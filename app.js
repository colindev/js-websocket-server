#!/usr/bin/env node

var port = parseInt(process.argv[2], 10);
var ws = require("nodejs-websocket");
var qs = require('querystring');

if (isNaN(port)) throw new Error('port can\'t be '+port);

function log_time(){
    return (new Date).toISOString();
}
// Scream server example: "hi" -> "HI!!!"
var server = ws.createServer(function (conn) {

    var data = qs.parse(conn.path.replace(/^[^?]*\?/, '')),
        key = data.key;

    console.log(log_time()+' Connection: ', key);

    conn.on("text", function (str) {

        var ping_in = (new Date).getTime();

        console.log(log_time()+' Received: '+key+' [ '+str+' ] '+ping_in);
        conn.sendText('pong:in:'+ping_in+':out:'+(new Date).getTime());

    });
    conn.on("close", function (code, reason) {
        console.log(log_time()+' Connection closed: '+key);
    })
}).listen(port);
