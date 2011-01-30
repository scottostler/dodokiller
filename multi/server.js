var game = require('./gamelogic.js');

game.gameInit();

var http = require('http'),  
    io = require('socket.io');

var server = http.createServer(function(req, res) {});
server.listen(8080);
var socket = io.listen(server);

function broadcastState() {
	// TODO
}

function handleIncomingMessage(playerId, msg) {
	if (playerId in keyboardState) {
	  if (msg.down) {
	    keyboardState[playerId][msg.cmd] = true;
	  } else {
	    delete keyboardState[playerId][msg.cmd];
	  }
	} else {
	  console.warn("Missing keyboard state for player " +  playerId);
	}
}

socket.on('connection', function(client) {
	console.log("connect " + client.sessionId);
	
	connectPlayer(client.sessionId);
	
	client.on('message', function(o) {
		handleIncomingMessage(client.sessionId, o);
	});
	
	client.on('disconnect', function() {
		disconnectPlayer(client.sessionId);
		console.log("disconnect " + client.sessionId);
	});
});

gameLoop(broadcastState);