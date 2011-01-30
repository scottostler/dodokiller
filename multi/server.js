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

function handleIncomingMessage(client, playerId, msg) {
  if (msg.cmd == "name") {
    game.connectPlayer(playerId, msg.name);
  } else {
    game.setKeyboardState(playerId, msg.down, msg.cmd);
  }
}

socket.on('connection', function(client) {
  var initState = game.serializeInitializingState();
  client.send({ data: initState });
  
	client.on('message', function(msg) {
		handleIncomingMessage(client, client.sessionId, msg);
	});
	
	client.on('disconnect', function() {
		game.disconnectPlayer(client.sessionId);
	});
});

game.gameLoop(broadcastState);