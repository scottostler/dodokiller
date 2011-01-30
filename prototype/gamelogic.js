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


WIDTH = 1600;
HEIGHT = 1600;
WIN_WIDTH = WIDTH/2;
WIN_HEIGHT = HEIGHT/2;



settingKeyCodes = { toggle_music:81, /* 'q' */ }


function makeRandomDodos() {
  for (var i = 0; i < 10; i++) {
      
      var x1 = 0, y1 = 0;

        do
        {
            x1 = Math.floor(Math.random() * WIDTH);
            y1 = Math.floor(Math.random() * HEIGHT);
            
            var found = false;
            $.each(agents, function (i, agent) {
              if (agent.isHit && agent.isHit(x1, y1, env.dodoPlayerRadius)) {
                found = agent;
              }
            });


        } while(world.collide(x1, y1, true) || found);
      
    makeDodo(x1, y1);
  }
}

function gameInit() {
  // position players

  
  // position dodos
  
  
  world = makeWorld(WIDTH, HEIGHT, 20);
  world.generate(0.005);
  world.draw();
  
  var x1 = 0, x2 = 0, y1 = 0, y2 = 0;

    do
    {
        x1 = Math.floor(Math.random() * WIDTH);
        y1 = Math.floor(Math.random() * HEIGHT);
        x2 = Math.floor(Math.random() * WIDTH);
        y2 = Math.floor(Math.random() * HEIGHT);


    } while((x1==x2 && y1==y2) || world.collide(x1, y1, true) || world.collide(x2, y2, true));
  
  makePlayer(x1, y1, {
        forward: 87,
        backward: 83,
        left: 65,
        right: 68,
        shoot: 16
      }, "Player 1");
      
 makePlayer(x2, y2, {
        forward: 80,
        backward: 186,
        left: 76,
        right: 222,
        shoot: 77
      }, "Player 2");
      
makeRandomDodos();


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
  dodoMoveSpeed: .8, // pixels per frame
  dodoRadius: 20, // pixels, refers to how close bullets have to be to kill
  dodoPlayerRadius: 40 // pixels, refers to how close bullets have to be to kill
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
  
  var sprite = makeSprite(40, 40, "../media/hat_3.png", true);
  // var sprite = makeSprite(40, 40, "../media/hat_p1_sheet.png");
  
  var player = makeAgent();
  var pushing = 0;
  
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
      
      var found = false;
      $.each(agents, function (i, agent) {
        if (agent != player && agent.isHit && agent.isHit(nx, ny, env.dodoPlayerRadius)) {
          found = agent;
        }
      });
      
      if(!world.collide(nx, ny, true) && inBounds(nx, ny) && !found)
      {
          x = nx; 
          y = ny;
      }
    }
    if (keyboardState[keyCodes.backward]) {
      var nx = x - Math.cos(facing) * env.playerMoveSpeed;
      var ny = y - Math.sin(facing) * env.playerMoveSpeed;
      
      var found = false;
        $.each(agents, function (i, agent) {
          if (agent != player && agent.isHit && agent.isHit(nx, ny, env.dodoPlayerRadius)) {
            found = agent;
          }
        });
      
      if(!world.collide(nx, ny, true) && inBounds(nx, ny) && !found)
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
    
    /*
    // collide w dodos
    var found = false;
    $.each(agents, function (i, agent) {
      if (agent.isHit && agent.isHit(x, y, env.dodoPlayerRadius)) {
        found = agent;
      }
    });
    if (found && keyboardState[keyCodes.forward]) {
    //  console.log(found);
     // found.setFacing(facing);
     // found.setPushed(true, this);
     // pushing = found;
     
     
     
    } else if(found) {
      //found.setPushed(false, this);
    }
    */

    // other game controls go down here...
    if (keyboardState[settingKeyCodes.toggle_music]) {
      toggle_music();
    }

  };
  
  player.draw = function () {
    if(name == "Player 1"){
        world.setEye(x,y);
    }
    sprite.draw(x, y, Math.round((facing / (Math.PI*2))*36) % 36);
  };
  
  
  player.isHit = function (bulletX, bulletY, rad) {
      var distance = Math.sqrt(Math.pow(bulletX - x, 2) + Math.pow(bulletY - y, 2));
      if (distance < rad) return true;
      else return false;
    };
  
  player.win = function () {
    $("#wins").html(name + " Wins!");

    //pause_music();
    play_sound("snd_victory"); 
    // make more dodos
    makeRandomDodos();
  };
  
  player.isPlayer = true;
  
  return player;
}

function gaussian() {
	return (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1);
}

function makeDodo(x, y) {
  var dodo = makeAgent();
  
  var sprite = makeSprite(40, 40, "../media/dodo.png", false);
  
  var facing = 0;
  var pushed = false;
  var pusher = 0;
  var moving = true;
  var velocity = 0;
  var colliding = false;
  
  dodo.setPushed = function (p, pushr) {
      pushed = p;
      pusher = pushr;
      moving = false;
  };
  
  dodo.setFacing = function (f) {
      facing = f;
  };
  
  dodo.update = function () {
    if(pushed){
       // console.log("dodo moving " + moving);
        var nx = x + Math.cos(facing) * env.playerMoveSpeed;
        var ny = y + Math.sin(facing) * env.playerMoveSpeed;

          if(!world.collide(nx, ny, true) && inBounds(nx, ny))
          {
              x = nx; 
              y = ny;
          }
          
        if(!this.isHit(pusher.x, pusher.y, env.dodoPlayerRadius))
        {
            pushed = false;
            moving = true;
        }
    } else {
        
        if(moving && Math.random() > .992)
        {
            facing += gaussian();
            velocity = gaussian() * 10;
            if(Math.abs(velocity) < 5.0) velocity = 0;
        }
        
        if(moving && Math.random() > .7)
        {
        var nx = x + Math.cos(facing) * env.dodoMoveSpeed * velocity;
        var ny = y + Math.sin(facing) * env.dodoMoveSpeed * velocity;
        
        var found = false;
          $.each(agents, function (i, agent) {
            if (agent != dodo && agent.isHit && agent.isHit(nx, ny, env.dodoPlayerRadius)) {
              found = agent;
            }
          });

          if(!world.collide(nx, ny, true) && inBounds(nx, ny) && !found)
          {
              x = nx; 
              y = ny;
              colliding = false;
          } else {
              colliding = true;
          }
        }
        
        velocity *= .95;
        
    }
  };
  dodo.draw = function () {
    sprite.draw(x, y, 0);
  };
  
  dodo.isHit = function (bulletX, bulletY, rad) {
    var distance = Math.sqrt(Math.pow(bulletX - x, 2) + Math.pow(bulletY - y, 2));
    if (distance < rad) return true;
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
  
  var sprite = makeSprite(6, 6, "../media/bullet.png", false);
  
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
      if (!agent.isPlayer && agent.isHit && agent.isHit(x, y, env.dodoRadius)) {
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

function inBounds(x, y){
    if(x > 0 && x < WIDTH && y > 0 && y < HEIGHT)
        return true;
    else
        return false;
}

