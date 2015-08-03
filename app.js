#!/usr/bin/env node

var port = parseInt(process.argv[2], 10);
var heartbeat = parseInt(process.argv[3], 10) || 30;
var ws = require("nodejs-websocket");
var qs = require('querystring');

if (isNaN(port)) throw new Error('port can\'t be '+port);

var conn_map = {};
var server = ws.createServer(function (conn) {

    var data = qs.parse(conn.path.replace(/^[^?]*\?/, '')),
        key = data.key,
        id = conn.headers['sec-websocket-key'];

    if (conn_map[id]) {
        conn_map[id].close();
        log_time('already exists conn '+id);
    }

    conn_map[id] = conn;

    log_time('Connection: key=['+key+'] id=['+id+']');

    conn.on("text", function (str) {

        broadcast(str) || broadcast_response_receive(str) || pong(str, conn, key);

    });

    conn.on("close", function (code, reason) {
        log_time('Connection closed: '+key);
        delete conn_map[id];
    })

}).listen(port);

setInterval(function(){
    var alive_conn = [];
    for (var id in conn_map) {
        conn_map[id].send && conn_map[id].sendText(' ');
        alive_conn.push(id);
    }

    console.log('alive', alive_conn);

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
    if ('rde-tech' != str) return;

    log_time('broadcast-ping sending...');

    for (var key in conn_map) {
        conn_map[key].sendText && conn_map[key].sendText('broadcast-ping:'+(new Date).getTime());
    }

    log_time('broadcast-ping send');

    return true;
}

function broadcast_response_receive(str){

    var m = str.match(/^broadcast-pong(:\d+)?$/);
    if ( ! m) return;

    log_time('broadcast-pong receive [ '+m[1].substr(1)+' ]');

    return true;
}
