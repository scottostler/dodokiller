/*

game parameters
  game speed
  playing field dimensions
  player rotate speed
  player move speed
  bullet move speed
  bullet travel distance


game state consists of
  players
    facing (angle)
    position
      x
      y
  bullets
    facing (angle)
    position
      x
      y
    distance (how far it's travelled)
  dodos
    position
      x
      y
  obstruction
    function to determine whether a pixel is on or off limits

*/







function gameInit() {
  // position players
  makePlayer(200, 200, {
    forward: 87,
    backward: 83,
    left: 65,
    right: 68,
    shoot: 16
  });
  makePlayer(300, 300, {
    forward: 80,
    backward: 186,
    left: 76,
    right: 222,
    shoot: 77
  });
  
  // position dodos
}

function gameLoop() {
  // look at keyboard and move players
  
  // move bullets
  
  // kill dodos
  
  $.each(agents, function (i, agent) {
    agent.update();
    agent.draw();
  });
  
  setTimeout(gameLoop, env.gameSpeed);
}

$(function () {
  gameInit();
  gameLoop();
});

var env = {
  gameSpeed: 1, // frames per "millisecond" (changes based on browser...)
  playingFieldDimensions: [500, 500], // pixels
  playerRotateSpeed: 2*Math.PI/200, // radians per frame
  playerMoveSpeed: 1, // pixels per frame
  playerReloadTime: 100, // frames
  bulletMoveSpeed: 5, // pixels per frame
  bulletTravelDistance: 100 // pixels
};


var agents = [];

function makeAgent() {
  var agent = {};
  agents.push(agent);
  agent.destroy = function () {
    var found;
    $.each(agents, function (i, a) {
      if (a === agent) found = i;
    });
    agents.splice(found, 1);
  };
  
  return agent;
}

function makePlayer(x, y, keyCodes) {
  var facing = 0;
  var position = {x: x, y: y};
  var readyToShoot = 0; // 0 means ready to shoot
  
  // var div = $("<div style='position:absolute;width:40px;height:40px;background-image:url(../media/hat_p1_sheet.png)'></div>");
  // $("body").append(div);
  var sprite = new Spritesheet("id" + keyCodes.left, x, y, 1440, 40, 40, 40, 0, "../media/hat_3.png");
  
  var player = makeAgent();
  
  player.update = function () {
    // based on keyCodes (specific to the player) and keyboardState, update facing and position
    if (keyboardState[keyCodes.left]) {
      facing -= env.playerRotateSpeed;
      console.log(facing);
    }
    if (keyboardState[keyCodes.right]) {
      facing += env.playerRotateSpeed;
      console.log(facing);
    }
    if (keyboardState[keyCodes.forward]) {
      position.x += Math.cos(facing) * env.playerMoveSpeed;
      position.y += Math.sin(facing) * env.playerMoveSpeed;
      console.log([position.x, position.y]);
    }
    if (keyboardState[keyCodes.backward]) {
      position.x -= Math.cos(facing) * env.playerMoveSpeed;
      position.y -= Math.sin(facing) * env.playerMoveSpeed;
      console.log([position.x, position.y]);
    }
    
    // bullets
    // design decision: hold to keep firing or fire on every key press?
    if (readyToShoot == 0) {
      if (keyboardState[keyCodes.shoot]) {
        
      }
    } else {
      readyToShoot--;
    }
    
    
    // if shooting, make a bullet
    // TODO
    
  };
  
  player.draw = function () {
    // div.css("background-position", "0 0");
    // div.css("left", position.x);
    // div.css("top", position.y);
    sprite.x = position.x;
    sprite.y = position.y;
    sprite.activeSprite = Math.round((facing / (Math.PI*2))*36 - 9) % 36;
    if (sprite.activeSprite < 0) sprite.activeSprite += 36;
    sprite.draw();
  };
  
  return player;
}

function makeDodo() {
  
}

function makeBullet() {
  
}

