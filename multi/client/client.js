/* TODO:
initialize the websocket
set up sendToServer(msg) to send the message to the websocket
hook up the websocket so that incoming messages (from the server) call receiveFromServer(msg)
*/

/*
PROTOCOL:

keyboard (client to server)
    {
        "cmd": "forward" | "backward" | "left" | "right" | "shoot",
        "down": true | false
    }

sprites (server to client)
  [
    {
      "event": "create" | "destroy" | "update",
      "id": NUMBER,
  
      if create
        "type": "player" | "dodo" | "bullet",
  
      if create or update
        "x": NUMBER,
        "y": NUMBER,
        "facing": NUMBER // if applicable
    },
    ...
  ]

*/

function receiveFromServer(msg) {
  var data = msg.data;
  if (Math.random() > 0.99) { console.log(msg); }
    
  // msg is a series of sprites, need to draw them.
  
  // clear the canvas
  $("#canvas").html("");
  
  $.each(data, function (i, sprite) {
    if (sprite.type == "player") {
      var s = makeSprite(40, 60, "../../media/hat_new_2.png");
      s.draw(sprite.x, sprite.y, Math.round((sprite.facing / (Math.PI*2))*36) % 36);
    } else if (sprite.type == "dodo") {
      var s = makeSprite(40, 40, "../../media/dodo.png");
      s.draw(sprite.x, sprite.y, 0);
    } else if (sprite.type == "bullet") {
      var s = makeSprite(6, 6, "../../media/bullet.png");
      s.draw(sprite.x, sprite.y, 0);
    }
  });
}


// for testing
var sampleMessageFromServer = [
  {"type": "player", "x": 200, "y": 200, "facing": 0},
  {"type": "player", "x": 400, "y": 400, "facing": 1.2345},
  {"type": "dodo", "x": 30, "y": 180},
  {"type": "dodo", "x": 280, "y": 300},
  {"type": "bullet", "x": 220, "y": 200},
  {"type": "bullet", "x": 240, "y": 200}
];
// receiveFromServer(sampleMessageFromServer)


var keyCodes = {
  "38": "forward",
  "37": "left",
  "40": "backward",
  "39": "right",
  "32": "shoot"
};

var socket;
var keyboardState = {};

function sendKey(cmd, down) {
  if (!cmd) { return; }
  var msg = {
    "cmd": cmd,
    "down": down
  };
  socket.send(msg);
}

function clientInit() {
  socket = new io.Socket(null, { port: 8080 }); 
	socket.connect();
 	socket.on('message', receiveFromServer);
  
  $(document).keydown(function (e) {
    var code = e.keyCode;
    if (!keyboardState[code]) {
      keyboardState[code] = true;
      cmd = keyCodes[e.keyCode];
      sendKey(cmd, true);
    }
  });
  $(document).keyup(function (e) {
    var code = e.keyCode;
    if (keyboardState[code]) {
      keyboardState[code] = false;
      cmd = keyCodes[e.keyCode];
      sendKey(cmd, false);
    }
  });
}

$(clientInit);