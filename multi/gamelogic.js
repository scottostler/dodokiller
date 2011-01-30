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

// Tracks per-cycle agent creation/destruction
var agentEvents = [];

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
  dodoRadius: 20, // pixels, refers to how close bullets have to be to kill
  playerRadius: 20 // pixels, used to prevent sprites from leaving screen
};

function constrain(val, max, padding) {
  return Math.max(
    Math.min(val, max - padding),
    padding);
}

var objectId = 0;

function makeAgent() {
  var agent = {};
  
  agent.objectId = ++objectId;
  agents.push(agent);
  
  agent.destroy = function () {
    agent.destroyed = true;
    agentEvents.push({ event: "destroy", id: agent.objectId });
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
  
  keyboardState[playerId] = {};
  
  var player = makeAgent();
  
  player.playerId = playerId;
  
  player.serialize = function() {
    return { type: "player", id: player.objectId, x: x, y: y, facing: facing };
  }
  
  var agentState = player.serialize();
  agentState['event'] = 'create';
  agentEvents.push(agentState);
  
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
    
    var dirty = false;
    
    // based on keyCodes (specific to the player) and keyboardState, update facing and position
    if (keyboardState[playerId].left) {
      facing -= env.playerRotateSpeed;
      dirty = true;
    }
    if (keyboardState[playerId].right) {
      facing += env.playerRotateSpeed;
      dirty = true;
    }
    if (keyboardState[playerId].forward) {
      x += Math.cos(facing) * env.playerMoveSpeed;
      y += Math.sin(facing) * env.playerMoveSpeed;
      dirty = true;
    }
    if (keyboardState[playerId].backward) {
      x -= Math.cos(facing) * env.playerMoveSpeed;
      y -= Math.sin(facing) * env.playerMoveSpeed;
      dirty = true;
    }
    
    x = constrain(x, env.playingFieldDimensions[0], env.playerRadius);
    y = constrain(y, env.playingFieldDimensions[1], env.playerRadius);
    
    if (dirty) {
      var state = player.serialize();
      state.event = 'update';
      agentEvents.push(state);
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
  
  dodo.serialize = function() {
    return { type: "dodo", id: dodo.objectId, x: x, y: y };
  }
  
  var agentState = dodo.serialize();
  agentState.event = 'create';
  agentEvents.push(agentState);
  
  dodo.update = function () {
    x = constrain(x, env.playingFieldDimensions[0], env.dodoRadius);
    y = constrain(y, env.playingFieldDimensions[1], env.dodoRadius);
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
  
  bullet.serialize = function() {
    return { type: "bullet", id: bullet.objectId, x: x, y: y };
  }
  
  var agentState = bullet.serialize();
  agentState['event'] = 'create';
  agentEvents.push(agentState);
  
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
    if (!bullet.destroyed) {
      var state = bullet.serialize();
      state.event = 'update';
      agentEvents.push(state);
    }
  };
  
  bullet.draw = function () {
    sprite.draw(x, y, 0);
  };
  
  var oldDestroy = bullet.destroy;
  bullet.destroy = function () {
    oldDestroy();
  };
}

exports.serializeAndClearGameState = function() {
  var output = agentEvents;
  agentEvents = [];
  return output;  
}

exports.connectPlayer = function(playerId) {
  // note that this doesn't contain the creation event
  // for this player's character -- that will be sent on the
  // next game loop.
	var agentEvents = agents.map(function(agent) {
	  var state = agent.serialize();
	  state.event = 'create';
	  return state;
	});

	makePlayer(
	  Math.random() * 500,
	  Math.random() * 500,
	  playerId,
	  "Player " + playerId);  // TODO: better names
	return agentEvents;
}

exports.disconnectPlayer = function(playerId) {
  var player = lookupPlayer(playerId);
  if (player) {
    player.destroy();
  } else {
    console.error("Unable to find player record for " + playerId);
  }
}
