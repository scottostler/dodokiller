/*
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
  
}



var keyCodes = {
  "38": "forward",
  "37": "left",
  "40": "backward",
  "39": "right",
  "32": "shoot"
};

function keyboardInit() {
  $(document).keydown(function (e) {
    var cmd = keyCodes[e.keyCode];
    if (cmd) sendToServer({
      "cmd": cmd,
      "down": true
    });
  });
  $(document).keyup(function (e) {
    var cmd = keyCodes[e.keyCode];
    if (cmd) sendToServer({
      "cmd": cmd,
      "down": false
    });
  });
}
$(keyboardInit);