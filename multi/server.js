var game = require('./gamelogic.js');

game.gameInit();

var http = require('http'),  
    io = require('socket.io');

var server = http.createServer(function(req, res) {});
server.listen(8080);
var socket = io.listen(server);

Clients = {};

function broadcastState() {
	var state = game.serializeGameState();
	socket.broadcast({ data: state });
}

function handleIncomingMessage(playerId, msg) {
  // UGLY keyboard state abstraction
	if (playerId in game.keyboardState) {
	  if (msg.down) {
	    game.keyboardState[playerId][msg.cmd] = true;
	  } else {
	    delete game.keyboardState[playerId][msg.cmd];
	  }
	} else {
	  console.warn("Missing keyboard state for player " +  playerId);
	}
}

socket.on('connection', function(client) {
	game.connectPlayer(client.sessionId);
	
	client.on('message', function(o) {
		handleIncomingMessage(client.sessionId, o);
	});
	
	client.on('disconnect', function() {
		game.disconnectPlayer(client.sessionId);
	});
});

game.gameLoop(broadcastState);