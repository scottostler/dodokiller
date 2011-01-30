/* TODO:
initialize the websocket
set up sendToServer(msg) to send the message to the websocket
hook up the websocket so that incoming messages (from the server) call receiveFromServer(msg)
*/

/*
PROTOCOL:

keyboard (client to server)
    {
        "cmd": "forward" | "backward" | "left" | "right" | "shoot" | "name",
        "down": true | false, // if cmd != "name"
        "name": STRING // if cmd == "name"
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
        "name": STRING // if create player
    },
    ...
    
    {"event": "win", "name": "Toby"}
    
    
    
    
  ]

*/

var sprites = {};

function radiansToSprite(facing) {
  if (facing) {
    return Math.round((facing / (Math.PI*2))*36) % 36;
  } else return 0;
}

function receiveFromServer(msg) {
  var data = msg.data;
  
  $.each(data, function (i, event) {
    
    // play starts again when the server sends a dodo create after a win screen
    if (gameState === "win" && event.event === "create" && event.type === "dodo") {
      gameState = "playing";
      $(".popup").hide();
    }
    
    if (event.event === "create") {
      var s;
      if (event.type == "player") {
        var asset = "../../media/hat_3.png";
        if (event.name === myName) asset = "../../media/hat_3_highlight.png";
        s = makeSprite(40, 40, asset);
      } else if (event.type == "dodo") {
        s = makeSprite(40, 40, "../../media/dodo.png");
      } else if (event.type == "bullet") {
        play_sound("snd_shot1");
        s = makeSprite(6, 6, "../../media/bullet.png");
      }
      s.draw(event.x, event.y, radiansToSprite(event.facing));
      sprites[event.id] = s;
    } else if (event.event === "update") {
      sprites[event.id].draw(event.x, event.y, radiansToSprite(event.facing));
    } else if (event.event === "destroy") {
      console.warn(event);
      if(sprites[event.id].type == "dodo") {  
        play_sound("snd_squawk");
      }
      sprites[event.id].destroy();
      delete sprites[event.id];
    } else if (event.event === "win") {
      gameState = "win";
      play_sound("snd_victory");
      $("#winnerName").text(event.name);
      $("#winscreen").show();
      $("#countdown").text("6");
      doCountdown();
    }
    
  });
}


function doCountdown() {
  var current = +$("#countdown").text();
  if (current > 0) {
    $("#countdown").text(current - 1);
    setTimeout(doCountdown, 1000);
  }
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
  ],
  [
    {"event": "win", "name": "Scotty"}
  ]
  
];
// receiveFromServer({"data":sampleMessages[0]})



var gameState = "intro"; // this can be "intro", "playing", "win"
var myName = "";


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
  if (gameState !== "intro") {
    if (!cmd) { return; }
    var msg = {
      "cmd": cmd,
      "down": down
    };
    socket.send(msg);
  }
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
  
  $("#nameEntry").focus();
  
  $("#start").click(login);
  $("#nameEntry").keydown(function (e) {
    if (e.keyCode === 13) login();
  });
  
}

function login() {
  myName = $("#nameEntry").val();
  socket.send({
    "cmd": "name",
    "name": myName
  });
  $(".popup").hide();
  gameState = "playing";
}

$(clientInit);
