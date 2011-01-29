var http = require('http'),  
    io = require('socket.io'),

server = http.createServer(function(req, res){ 
 // your normal server code 
 res.writeHead(200, {'Content-Type': 'text/html'}); 
 res.end('<h1>Hello world</h1>'); 
});
server.listen(8080);

var Clients = {};

function broadcastTime() {
	var time = new Date().toString();
	for (var i in Clients) {
		var client = Clients[i];
		client.send({ 'time': time });
	}
}

setInterval(broadcastTime, 50);

// socket.io 
var socket = io.listen(server); 
socket.on('connection', function(client) {
	Clients[client.sessionId] = client;
	console.log("new client");
	// new client is here! 
	client.on('message', function(){
		console.log("message");
	});
	client.on('disconnect', function() {
		delete Clients[client.sessionId];
		console.log("disconnect");
	});
});