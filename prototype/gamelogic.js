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
    if (!agent.destroyed) {
      agent.update();
      agent.draw();
    }
  });
  
  // clean up destroyed agents
  var i = 0;
  while (i < agents.length) {
    var agent = agents[i];
    if (agent.destroyed) {
      agents.splice(i, 1);
    } else i++;
  }
  
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
  playerReloadTime: 40, // frames
  bulletMoveSpeed: 3, // pixels per frame
  bulletTravelDistance: 200 // pixels
};


var agents = [];

function makeAgent() {
  var agent = {};
  agents.push(agent);
  agent.destroy = function () {
    agent.destroyed = true;
  };
  
  return agent;
}

function makePlayer(x, y, keyCodes) {
  var facing = 0;
  var readyToShoot = 0; // 0 means ready to shoot
  
  var sprite = makeSprite(40, 40, "../media/hat_p1_sheet.png");
  
  var player = makeAgent();
  
  player.shoot = function () {
    if (readyToShoot == 0) {
      makeBullet(x, y, facing);
      readyToShoot = env.playerReloadTime;
    }
  };
  
  player.update = function () {
    // based on keyCodes (specific to the player) and keyboardState, update facing and position
    if (keyboardState[keyCodes.left]) {
      facing -= env.playerRotateSpeed;
    }
    if (keyboardState[keyCodes.right]) {
      facing += env.playerRotateSpeed;
    }
    if (keyboardState[keyCodes.forward]) {
      x += Math.cos(facing) * env.playerMoveSpeed;
      y += Math.sin(facing) * env.playerMoveSpeed;
    }
    if (keyboardState[keyCodes.backward]) {
      x -= Math.cos(facing) * env.playerMoveSpeed;
      y -= Math.sin(facing) * env.playerMoveSpeed;
    }
    
    if (keyboardState[keyCodes.shoot]) {
      player.shoot();
    }
    
    // bullets
    // design decision: hold to keep firing or fire on every key press?
    if (readyToShoot > 0) readyToShoot--;
    
  };
  
  player.draw = function () {
    sprite.draw(x, y, Math.round((facing / (Math.PI*2))*36 - 9) % 36);
  };
  
  return player;
}

function makeDodo() {
  
}

function makeBullet(x, y, facing) {
  var distanceTravelled = 0;
  
  var bullet = makeAgent();
  
  var div = $("<div style='position:absolute;width:4px;height:4px;background-color:#000'></div>");
  $("#canvas").append(div);
  
  bullet.update = function () {
    x += Math.cos(facing) * env.bulletMoveSpeed;
    y += Math.sin(facing) * env.bulletMoveSpeed;
    
    distanceTravelled += env.bulletMoveSpeed;
    if (distanceTravelled >= env.bulletTravelDistance) {
      bullet.destroy();
    }
  };
  
  bullet.draw = function () {
    div.css("left", x);
    div.css("top", y);
  };
  
  var oldDestroy = bullet.destroy;
  bullet.destroy = function () {
    div.remove();
    oldDestroy();
  };
}

