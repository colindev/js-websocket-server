#!/usr/bin/env node

var ws = require("nodejs-websocket");

module.exports = {
    _server: null,
    sockets: {},
    listen: function(port){
        var me = this;
        me._server = ws.createServer(function (conn) {

            var sha1 = crypto.createHash('sha1');
            var id = sha1.update(conn.headers['sec-websocket-key']).digest('hex').replace(/^(\w{2}).*/, '$1');

            console.log(id, 'connect');

            me.sockets[id] = conn;

            conn.on("text", function (str) {

                console.log(id, str);

            });

            conn.on("close", function (code, reason) {
                console.log(id, 'close', code, reason);
                delete me.sockets[id];
            })

        }).listen(port);

        console.log('server listen on :'+port);

        setInterval(function(){

            me._server.connections.forEach(function (conn) {
                conn.processFrame(true, 9, new Buffer(0));
            });

        }, 50 * 1000);

        return me;
    },
    broadcast: function(msg){
        var cnt = 0;
        msg = ''+msg;
        this._server.connections.forEach(function (conn) {
            conn.sendText(msg) && cnt++;
        });

        console.log('broadcast', cnt);
    }
};

