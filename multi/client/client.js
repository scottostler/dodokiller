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

var sprites = {};

function receiveFromServer(msg) {
  var data = msg.data;
  
  $.each(data, function (i, event) {
    if (event.event === "create") {
      var s;
      if (event.type == "player") {
        s = makeSprite(40, 40, "../../media/hat_3.png");
      } else if (event.type == "dodo") {
        s = makeSprite(40, 40, "../../media/dodo.png");
      } else if (event.type == "bullet") {
        s = makeSprite(6, 6, "../../media/bullet.png");
      }
      s.draw(event.x, event.y, event.facing || 0);
      sprites[event.id] = s;
    } else if (event.event === "update") {
      sprites[event.id].draw(event.x, event.y, event.facing || 0);
    } else if (event.event === "destroy") {
      sprites[event.id].destroy();
      delete sprites[event.id];
    }
  });
}


// for testing
var sampleMessages = [
  [
    {"event": "create", "id": 0, "type": "player", "x": 200, "y": 200, "facing": 0},
    {"event": "create", "id": 1, "type": "player", "x": 400, "y": 400, "facing": 1.2345},
    {"event": "create", "id": 2, "type": "dodo", "x": 30, "y": 180},
    {"event": "create", "id": 3, "type": "dodo", "x": 280, "y": 300},
    {"event": "create", "id": 4, "type": "bullet", "x": 220, "y": 200},
    {"event": "create", "id": 5, "type": "bullet", "x": 240, "y": 200}
  ],
  [
    {"event": "update", "id": 4, "x": 225, "y": 200},
    {"event": "update", "id": 5, "x": 245, "y": 200}
  ],
  [
    {"event": "destroy", "id": 2},
    {"event": "destroy", "id": 3}
  ],
  [
    {"event": "update", "id": 0, "x": 200, "y": 200, "facing": 0.1}
  ]
  
];
// receiveFromServer({"data":sampleMessages[0]})


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
 	socket.on('message', receiveFromServer);
	socket.connect();
  
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