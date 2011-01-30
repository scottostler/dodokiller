var game = require('./gamelogic.js');

game.gameInit();

var http = require('http'),  
    io = require('socket.io');

var server = http.createServer(function(req, res) {});
server.listen(8080);
var socket = io.listen(server);

Clients = {};

function broadcastState() {
	var state = game.serializeAndClearGameState();
	socket.broadcast({ data: state });
}

function handleIncomingMessage(playerId, msg) {
  game.setKeyboardState(playerId, msg.down, msg.cmd);
}

socket.on('connection', function(client) {
	var initState = game.connectPlayer(client.sessionId);
	client.send({ data: initState, init: true });
	
	client.on('message', function(o) {
		handleIncomingMessage(client.sessionId, o);
	});
	
	client.on('disconnect', function() {
		game.disconnectPlayer(client.sessionId);
	});
});

game.gameLoop(broadcastState);