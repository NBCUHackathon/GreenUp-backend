/*
SAVVYSERVER
*/


//Server Init Stuff
var http = require("http");
var server = http.createServer(requestHandler);
function requestHandler(req, res) {
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write("Hello World");
    res.end();
}

//require db npm packages
var mongojs = require('mongojs');

//Socket.io init
var io = require('socket.io')(server);

server.listen(9999);


// //while connected to a client
io.on('connection', function(socket) { 

		socket.emit('auth.tokenReceived', "hi");

});