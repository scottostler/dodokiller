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

var keyboardState = {};

var setKeyboardState = function(playerId, isDown, cmd) {
  if (playerId in keyboardState) {
    if (isDown) {
      keyboardState[playerId][cmd] = true;
    } else {
      delete keyboardState[playerId][cmd];
    }
  } else {
    console.warn("Missing keyboard state for player " +  playerId);
  }
}

exports.setKeyboardState = setKeyboardState;

var agents = [];

function makeRandomDodos() {
  for (var i = 0; i < 10; i++) {
    makeDodo(Math.random() * 500, Math.random() * 500);
  }
}

exports.gameInit = function() {
  makeRandomDodos();
}

gameLoop = function(callback) {
  // look at keyboard and move players
  // move bullets
  // kill dodos

  var loop = function() {
    agents.forEach(function (agent, i) {
      if (!agent.destroyed) {
        agent.update();
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

    if (callback) {
      callback();
    }
  };
  setInterval(loop, env.gameSpeed);
}

exports.gameLoop = gameLoop;

var env = {
  gameSpeed: 10, // frames per "millisecond" (changes based on browser...)
  playingFieldDimensions: [500, 500], // pixels
  playerRotateSpeed: 2*Math.PI/170, // radians per frame
  playerMoveSpeed: 1.8, // pixels per frame
  playerReloadTime: 40, // frames
  bulletMoveSpeed: 4, // pixels per frame
  bulletTravelDistance: 200, // pixels
  dodoRadius: 20 // pixels, refers to how close bullets have to be to kill
};

var objectId = 0;

function makeAgent() {
  var agent = {};
  agent.objectId = objectId++;
  agents.push(agent);
  agent.destroy = function () {
    agent.destroyed = true;
  };
  
  return agent;
}

function lookupPlayer(playerId) {
  for (var i in agents) {
    var agent = agents[i];
    if (agent.playerId == playerId)
      return agent;
  }
}

function makePlayer(x, y, playerId, name) {
  var facing = 0;
  var readyToShoot = 0; // 0 means ready to shoot
  
  //var sprite = makeSprite(40, 60, "../media/hat_new_2.png");
  // var sprite = makeSprite(40, 40, "../media/hat_p1_sheet.png");
  
  keyboardState[playerId] = {};
  
  var player = makeAgent();
  
  player.playerId = playerId;
  
  player.serialize = function() {
    return { type: "player", x: x, y: y, facing: facing };
  }
  
  player.shoot = function () {
    if (readyToShoot == 0) {
      makeBullet(x, y, facing, player);
      readyToShoot = env.playerReloadTime;
    }
  };
  
  player.update = function () {
    if (keyboardState[playerId] === undefined) {
      console.error("Missing keyboard state for player " + playerId);
      return;
    }
    
    // based on keyCodes (specific to the player) and keyboardState, update facing and position
    if (keyboardState[playerId].left) {
      facing -= env.playerRotateSpeed;
    }
    if (keyboardState[playerId].right) {
      facing += env.playerRotateSpeed;
    }
    if (keyboardState[playerId].forward) {
      x += Math.cos(facing) * env.playerMoveSpeed;
      y += Math.sin(facing) * env.playerMoveSpeed;
    }
    if (keyboardState[playerId].backward) {
      x -= Math.cos(facing) * env.playerMoveSpeed;
      y -= Math.sin(facing) * env.playerMoveSpeed;
    }
    
    if (keyboardState[playerId].shoot) {
      player.shoot();
    }
    
    // bullets
    // design decision: hold to keep firing or fire on every key press?
    if (readyToShoot > 0) readyToShoot--;
    
  };
  
  player.draw = function () {
    sprite.draw(x, y, Math.round((facing / (Math.PI*2))*36) % 36);
  };
  
  var oldDestroy = player.destroy;
  player.destroy = function() {
    delete keyboardState[playerId];
    oldDestroy();
  }
  
  player.win = function () {
    // TODO: announce winnner
     makeRandomDodos();
  };
  
  return player;
}

function makeDodo(x, y) {
  var dodo = makeAgent();
  
  //var sprite = makeSprite(40, 40, "../media/dodo.png");
  
  dodo.serialize = function() {
    return { type: "dodo", x: x, y: y };
  }
  
  dodo.update = function () {
    
  };
  dodo.draw = function () {
    sprite.draw(x, y, 0);
  };
  
  dodo.isHit = function (bulletX, bulletY) {
    var distance = Math.sqrt(Math.pow(bulletX - x, 2) + Math.pow(bulletY - y, 2));
    if (distance < env.dodoRadius) return true;
    else return false;
  };
  
  var oldDestroy = dodo.destroy;
  dodo.destroy = function () {
    oldDestroy();
  };
}

function makeBullet(x, y, facing, player) {
  var distanceTravelled = 0;
  
  var bullet = makeAgent();
  
  // var sprite = makeSprite(6, 6, "../media/bullet.png");
  
  bullet.serialize = function() {
    return { type: "bullet", x: x, y: y };
  }
  
  bullet.update = function () {
    x += Math.cos(facing) * env.bulletMoveSpeed;
    y += Math.sin(facing) * env.bulletMoveSpeed;
    
    distanceTravelled += env.bulletMoveSpeed;
    if (distanceTravelled >= env.bulletTravelDistance) {
      bullet.destroy();
    }
    
    // check if it killed a dodo
    var found = false;
    agents.forEach(function (agent, i) {
      if (agent.isHit && agent.isHit(x, y)) {
        found = agent;
      }
    });
    if (found) {
      // kill the dodo!
      found.destroy();
      bullet.destroy();
      
      // check if last dodo
      var nomore = true;
      agents.forEach(function (agent, i) {
        if (agent.isHit && !agent.destroyed) {
          nomore = false;
        }
      });
      if (nomore) {
        player.win();
      }
    }
  };
  
  bullet.draw = function () {
    sprite.draw(x, y, 0);
  };
  
  var oldDestroy = bullet.destroy;
  bullet.destroy = function () {
    // sprite.destroy();
    oldDestroy();
  };
}



exports.serializeGameState = function() {
  return agents.map(function(agent, i) {
    return agent.serialize();
  });
}

exports.connectPlayer = function(playerId) {
	makePlayer(
	  Math.random() * 500,
	  Math.random() * 500,
	  playerId,
	  // TODO: better names
	  "Player " + playerId);
}

exports.disconnectPlayer = function(playerId) {
  var player = lookupPlayer(playerId);
  // TODO: send broadcast message
  if (player) {
    player.destroy();
  } else {
    console.error("Unable to find player record for " + playerId);
  }
}
