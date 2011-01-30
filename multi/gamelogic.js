var worldModule = require('./world.js');

var env = {
  gameSpeed: 10, // frames per "millisecond" (changes based on browser...)
  playingFieldDimensions: [600, 600], // pixels
  worldGridSize: 20, // pixel size of single world terrain tile
  worldFrequency: 0.005, // density of generated terrain
  playerRotateSpeed: 3*Math.PI/170, // radians per frame
  playerMoveSpeed: 4, // pixels per frame
  playerReloadTime: 40, // frames
  bulletMoveSpeed: 8, // pixels per frame
  bulletTravelDistance: 300, // pixels
  dodoMoveSpeed: 0.8, // scaling factor for dodo velocity
  dodoVelocityChangeProbability: 0.992, // chance that a dodo with velocity will move in a frame
  dodoMoveProbability: 0.7, // chance that a dodo's velocity will be increased in a frame
  dodoVelocityThreshold: 5.0, // if dodo's velocity is below this, dodo stops moving
  dodoVelocityDecay: 0.95, // dodo's velocity diminishes by this each frame
  dodoRadius: 20, // pixels, refers to how close bullets have to be to kill
  playerRadius: 20, // pixels, used to prevent sprites from leaving screen
  delayBetweenRounds: 5000 // ms between a player winning and a new round beginning
};

var keyboardState = {};
var agents = [];
var world;
var agentEvents = []; // Tracks per-cycle agent creation/destruction

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

function makeRandomDodos() {
  for (var i = 0; i < 10; i++) {
    var coord = makeRandomCoordinate(env.dodoRadius);
    makeDodo(coord[0], coord[1]);
  }
}

function initializeWorld() {
  world = worldModule.makeWorld(
    env.playingFieldDimensions[0],
    env.playingFieldDimensions[1],
    env.worldGridSize);
  world.generate(env.worldFrequency);
  agentEvents.push(world.serialize());
}

function moveAllPlayers() {
  agents.forEach(function(agent) {
    var coord = makeRandomCoordinate();
    agent.x = coord[0];
    agent.y = coord[1];
    agentEvents.push(agent.serialize('update'));
  });
}

var gameInit = function(reassignPlayers) {
  initializeWorld();
  if (reassignPlayers) {
    moveAllPlayers();    
  }
  makeRandomDodos();
}

exports.gameInit = gameInit;

gameLoop = function(roundCallback) {
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

    if (roundCallback) { roundCallback(); }
  };
  setInterval(loop, env.gameSpeed);
}

exports.gameLoop = gameLoop;

function makeRandomCoordinate(paddingRadius) {
  while (true) {
    var x = Math.random() * (env.playingFieldDimensions[0] - 2 * paddingRadius) + paddingRadius;
    var y = Math.random() * (env.playingFieldDimensions[1] - 2 * paddingRadius) + paddingRadius;

    var found = false;
    agents.forEach(function (agent, i) {
      if (agent.isHit && agent.isHit(x, y, paddingRadius)) {
        found = true;
      }
    });

    if (!found && !world.collide(x, y, true, paddingRadius)) {
      return [x, y];        
    }
  }
}


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
  
  player.serialize = function(eventType) {
    var event = { 
      event: eventType,
      type: "player", 
      id: player.objectId,
      name: name,
      x: x,
      y: y,
      facing: facing
    };
    if (eventType == 'create') {
      event.name = name;
    }
    return event;
  }
  
  agentEvents.push(player.serialize('create'));
  
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
    
    var oldX = x;
    var oldY = y;
    
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
        
        var nx = x + Math.cos(facing) * env.playerMoveSpeed;
        var ny = y + Math.sin(facing) * env.playerMoveSpeed;

          var found = false;
          agents.forEach( function (agent, i) {
            if (agent != player && agent.isHit && agent.isHit(nx, ny, env.dodoPlayerRadius)) {
              found = agent;
            }
          }
          );

          if(!world.collide(nx, ny, true) && inBounds(nx, ny) && !found)
          {
              x = nx; 
              y = ny;
          }
          
      dirty = true;
    }
    if (keyboardState[playerId].backward) {
        
         var nx = x - Math.cos(facing) * env.playerMoveSpeed;
         var ny = y - Math.sin(facing) * env.playerMoveSpeed;

          var found = false;
          agents.forEach( function (agent, i) {
              if (agent != player && agent.isHit && agent.isHit(nx, ny, env.dodoPlayerRadius)) {
                found = agent;
              }
            }
            );

          if(!world.collide(nx, ny, true) && inBounds(nx, ny) && !found)
          {
                x = nx; 
                y = ny;
          }
          
      dirty = true;
    }
    
    x = constrain(x, env.playingFieldDimensions[0], env.playerRadius);
    y = constrain(y, env.playingFieldDimensions[1], env.playerRadius);
    
    if (dirty && world.collide(x, y, true, env.playerRadius)) {
      x = oldX;
      y = oldY;
    } else if (dirty) {
      agentEvents.push(player.serialize('update'));      
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
  
  player.isHit = function (bulletX, bulletY, rad) {
        var distance = Math.sqrt(Math.pow(bulletX - x, 2) + Math.pow(bulletY - y, 2));
        if (distance < rad) return true;
        else return false;
      };
  
  player.win = function () {
    agentEvents.push({ event: 'win', name: name });
    setTimeout(
      function() { gameInit(true); },
      env.delayBetweenRounds);
  };
  
  player.isPlayer = true;
  
  return player;
}

function gaussian() {
	return (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1);
}

function makeDodo(x, y) {
  var dodo = makeAgent();
  
  var facing = 0;
    var moving = true;
    var velocity = 0;
    var colliding = false;
  
  dodo.serialize = function(eventType) {
    return { event: eventType, type: "dodo", id: dodo.objectId, x: x, y: y };
  }
  
  agentEvents.push(dodo.serialize('create'));
  
  var facing = 0;
  var velocity = 0;
  
  dodo.update = function () {
    if (Math.random() > env.dodoVelocityChangeProbability) {
        facing += gaussian();
        velocity = gaussian() * 10;
        if (Math.abs(velocity) < env.dodoVelocityThreshold)
          velocity = 0;
    }
    
    if (Math.random() > env.dodoMoveProbability && velocity > 0) {
      var oldX = x;
      var oldY = y;
      
      x += Math.cos(facing) * env.dodoMoveSpeed * velocity;
      y += Math.sin(facing) * env.dodoMoveSpeed * velocity;

      velocity *= env.dodoVelocityDecay;

      x = constrain(x, env.playingFieldDimensions[0], env.dodoRadius);
      y = constrain(y, env.playingFieldDimensions[1], env.dodoRadius);
      
      if (world.collide(x, y, true, env.dodoRadius)) {
        x = oldX;
        y = oldY;
      } else {
        agentEvents.push(dodo.serialize('update'));        
      }
    }
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
  
  bullet.serialize = function(eventType) {
    return {
      event: eventType,
      type: "bullet", 
      id: bullet.objectId,
      x: x,
      y: y
    };
  }
  
  agentEvents.push(bullet.serialize('create'));
  
  bullet.update = function () {
    
      var nx = x + Math.cos(facing) * env.bulletMoveSpeed;
      var ny = y + Math.sin(facing) * env.bulletMoveSpeed;

      var collided = false;
      if(!world.collide(nx, ny, false))
      {
        x = nx; 
        y = ny;
      }
      else
      {
        collided = true;
        bullet.destroy();
      }
    
    distanceTravelled += env.bulletMoveSpeed;
    if (distanceTravelled >= env.bulletTravelDistance && !collided) {
      bullet.destroy();
    }
    
    // check if it killed a dodo
    var found = false;
    agents.forEach(function (agent, i) {
      if (!agent.isPlayer && !agent.destroyed && agent.isHit && agent.isHit(x, y)) {
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
        if (!agent.isPlayer && agent.isHit && !agent.destroyed) {
          nomore = false;
        }
      });
      if (nomore) {
        player.win();
      }
    }
    if (!bullet.destroyed) {
      agentEvents.push(bullet.serialize('update'));
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
};

exports.serializeInitializingState = function() {
  var events = agents.map(function(agent) {
	  return agent.serialize('create');
	});
	events.push(world.serialize());
	return events;
};

exports.connectPlayer = function(playerId, name) {
  var coord = makeRandomCoordinate(env.playerRadius);
	makePlayer(
    coord[0], coord[1],
	  playerId,
	  name);
}

exports.disconnectPlayer = function(playerId) {
  var player = lookupPlayer(playerId);
  if (player) {
    player.destroy();
  } else {
    console.warn("Unable to find player record for disconnected player " + playerId);
  }
}

function inBounds(x, y){
    if(x > 0 && x < env.playingFieldDimensions[0] && y > 0 && y < env.playingFieldDimensions[1])
        return true;
    else
        return false;
}
