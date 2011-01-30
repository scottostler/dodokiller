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
            "type": "player" | "dodo" | "bullet",
            "x": NUMBER, // int, pixels
            "y": NUMBER, // int, pixels
            "facing": NUMBER // float, radians (and only for player)
        },
        ...
    ]

*/

function sendToServer(msg) {
  console.log(msg);
}

function receiveFromServer(msg) {
  // msg is a series of sprites, need to draw them.
  
  // clear the canvas
  $("#canvas").html("");
  
  $.each(msg, function (i, sprite) {
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

function sendKey(cmd, down) {
  if (cmd) {
    sendToServer({
      "cmd": cmd,
      "down": down
    });
  }
}

var keyboardState = {};
function keyboardInit() {
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
$(keyboardInit);