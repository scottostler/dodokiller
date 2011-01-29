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
  
  // position dodos
}

function gameLoop() {
  // look at keyboard and move players
  players[0].update(keyCodes[0]);
  players[1].update(keyCodes[1]);
  
  // move bullets
  
  // kill dodos
  
  
}

var keyCodes = [
  {
    forward: 87,
    backward: 83,
    left: 65,
    right: 68,
    shoot: 16
  },
  {
    forward: 80,
    backward: 186,
    left: 76,
    right: 222,
    shoot: 77
  }
];




var players = [];
var dodos = [];
var bullets = [];

function makePlayer(x, y) {
  var facing = 0;
  var position = [x, y];
  
  var div = $(body).append("<div></div>"); // TODO this will probably be more specific...
  
  player = {
    update: function (keyCodes) {
      // based on keyCodes (specific to the player) and keyboardState, update facing and position
      
      
      // if shooting, make a bullet
      // TODO
      
    },
    draw: function () {
      // TODO move the div to the right place, change its sprite
    }
  };
  
  players.push(player);
  return player;
}

function makeDodo() {
  
}

function makeBullet() {
  
}

