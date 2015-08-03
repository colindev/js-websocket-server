#!/usr/bin/env node

var port = parseInt(process.argv[2], 10);
var heartbeat = parseInt(process.argv[3], 10) || 30;
var ws = require("nodejs-websocket");
var qs = require('querystring');

if (isNaN(port)) throw new Error('port can\'t be '+port);

var server = ws.createServer(function (conn) {

    var data = qs.parse(conn.path.replace(/^[^?]*\?/, '')),
        key = data.key,
        id = conn.headers['sec-websocket-key'];

    log_time('Connection: key=['+key+'] id=['+id+']');

    conn.on("text", function (str) {

        switch (str) {
            case 'rde-tech':
                return broadcast('broadcast-ping:'+(new Date).getTime());

            default:
                broadcast_response_receive(str) || pong(str, conn, key);
        }

    });

    conn.on("close", function (code, reason) {
        log_time('Connection closed: key=['+key+'] id=['+id+']');
    })

}).listen(port);

setInterval(function(){

    server.connections.forEach(function (conn) {
        conn.processFrame(true, 9, new Buffer(0));
    });

}, heartbeat * 1000);

function log_time(tag, time){
    var d = new Date;
    console.log(d.toLocaleString(), tag, typeof time == 'undefined' ? d.getTime() : time);
}

function pong(str, conn, key){

    var ping_in = (new Date).getTime();

    log_time('Received: '+key+' [ '+str+' ]', ping_in);
    conn.sendText('pong:in:'+ping_in+':out:'+(new Date).getTime());

    return true;
}

function broadcast(str){

    log_time('broadcast-ping sending...');

    server.connections.forEach(function (conn) {
        conn.sendText(str);
    });

    log_time('broadcast-ping send');

    return true;
}

function broadcast_response_receive(str){

    var m = str.match(/^broadcast-pong(:\d+)?$/);
    if ( ! m) return;

    log_time('broadcast-pong receive [ '+m[1].substr(1)+' ]');

    return true;
}
