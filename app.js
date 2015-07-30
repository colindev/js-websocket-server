#!/usr/bin/env node

var port = parseInt(process.argv[2], 10);
var ws = require("nodejs-websocket");

if (isNaN(port)) throw new Error('port can\'t be '+port);

// Scream server example: "hi" -> "HI!!!"
var server = ws.createServer(function (conn) {
    console.log("New connection");
    conn.on("text", function (str) {
        console.log("Received "+str);
        conn.sendText(str.toUpperCase()+"!!!");
        conn.sendText('news: hello channel\n....');
        conn.sendText('news: {"hello":"obj"}');
    });
    conn.on("close", function (code, reason) {
        console.log("Connection closed")
    })
}).listen(port);
