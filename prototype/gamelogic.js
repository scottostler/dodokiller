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

settingKeyCodes = { toggle_music:81, /* 'q' */
                    }

function makeRandomDodos() {
  for (var i = 0; i < 10; i++) {
    makeDodo(Math.random() * 500, Math.random() * 500);
  }
}

function gameInit() {
  // position players
  makePlayer(200, 200, {
    forward: 87,
    backward: 83,
    left: 65,
    right: 68,
    shoot: 16
  }, "Player 1");
  makePlayer(300, 300, {
    forward: 80,
    backward: 186,
    left: 76,
    right: 222,
    shoot: 77
  }, "Player 2");

  
  // position dodos
  makeRandomDodos();
  
  world = makeWorld(1000, 800, 20);
  world.generate(0.005);
  world.draw();

  // start music
  restart_music("snd_metal_music");      
  pause_music();  // it's kind of annoying...
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
  playerRotateSpeed: 2*Math.PI/170, // radians per frame
  playerMoveSpeed: 1.8, // pixels per frame
  playerReloadTime: 40, // frames
  bulletMoveSpeed: 4, // pixels per frame
  bulletTravelDistance: 200, // pixels
  dodoRadius: 20 // pixels, refers to how close bullets have to be to kill
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

function makePlayer(x, y, keyCodes, name) {
  var facing = 0;
  var readyToShoot = 0; // 0 means ready to shoot
  
  var sprite = makeSprite(40, 40, "../media/hat_3.png");
  // var sprite = makeSprite(40, 40, "../media/hat_p1_sheet.png");
  
  var player = makeAgent();
  
  player.shoot = function () {
    if (readyToShoot == 0) {
      play_sound("snd_shot1");      
      makeBullet(x, y, facing, player);
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
      var nx = x + Math.cos(facing) * env.playerMoveSpeed;
      var ny = y + Math.sin(facing) * env.playerMoveSpeed;
      
      if(!world.collide(nx, ny, true))
      {
          x = nx; 
          y = ny;
      }
    }
    if (keyboardState[keyCodes.backward]) {
      var nx = x - Math.cos(facing) * env.playerMoveSpeed;
      var ny = y - Math.sin(facing) * env.playerMoveSpeed;
      
      if(!world.collide(nx, ny, true))
      {
            x = nx; 
            y = ny;
      }
    }
    
    if (keyboardState[keyCodes.shoot]) {
      player.shoot();
    }
    
    // bullets
    // design decision: hold to keep firing or fire on every key press?
    if (readyToShoot > 0) readyToShoot--;
    
    // other game controls go down here...
    if (keyboardState[settingKeyCodes.toggle_music]) {
      toggle_music();
    }
  };
  
  player.draw = function () {
    sprite.draw(x, y, Math.round((facing / (Math.PI*2))*36) % 36);
  };
  
  player.win = function () {
    $("#wins").html(name + " Wins!");

    //pause_music();
    play_sound("snd_victory"); 
    // make more dodos
    makeRandomDodos();
  };
  
  return player;
}

function makeDodo(x, y) {
  var dodo = makeAgent();
  
  var sprite = makeSprite(40, 40, "../media/dodo.png");
  
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
    sprite.destroy();
    oldDestroy();
  };
}

function makeBullet(x, y, facing, player) {
  var distanceTravelled = 0;
  
  var bullet = makeAgent();
  
  var sprite = makeSprite(6, 6, "../media/bullet.png");
  
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
    $.each(agents, function (i, agent) {
      if (agent.isHit && agent.isHit(x, y)) {
        found = agent;
      }
    });
    if (found) {
      // kill the dodo!
      play_sound("snd_squawk");      
      found.destroy();
      bullet.destroy();
      
      // check if last dodo
      var nomore = true;
      $.each(agents, function (i, agent) {
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
    sprite.destroy();
    oldDestroy();
  };
}

