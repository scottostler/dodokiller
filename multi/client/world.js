function makeWorld(width, height, gridSize) {
    
    var world = {};
    
    world.width = width;
    world.height = height;
    world.objects = [];
    world.grid = [];
    
    world.gridSize = gridSize;
    
    world.eye_x = 0;
    world.eye_y = 0;
    
    world.initializeFromData = function(w, h, obs, gs) {
        world.width = w;
        world.height = h;
        
        world.gridSize = gs;
        world.objects = [];
        
        $.each(obs, function (i, ob) {
           var o = makeObject(ob.x, ob.y, ob.type);
           world.objects.push(o);
        });
        
    }
    
    world.setEye = function(x, y) {
        world.eye_x = x;
        world.eye_y = y;
        $("#canvas").css("left", -( world.eye_x - WIN_WIDTH/2 ));
        $("#canvas").css("top", -( world.eye_y - WIN_HEIGHT/2 ));
    }
    
    world.draw = function() {
        
        $.each(world.objects, function (i, ob) {
           // console.log(ob);
            ob.div.css("left", ob.x * gridSize - gridSize/2);// - (world.eye_x - WIN_WIDTH/2));
            ob.div.css("top", ob.y * gridSize - gridSize/2);// - (world.eye_y - WIN_HEIGHT/2));
        });
        
        
    }
    
    return world;
}

Object.prototype.clone = function() {
  var newObj = (this instanceof Array) ? [] : {};
  for (i in this) {
    if (i == 'clone') continue;
    if (this[i] && typeof this[i] == "object") {
      newObj[i] = this[i].clone();
    } else newObj[i] = this[i]
  } return newObj;
};

function makeObject(x, y, type) {
    
    var object = {};
    
    object.x = x;
    object.y = y;
    object.type = type;
    object.div = $("<div class='"+type+"'></div>");
    //object.div.css("width", world.gridSize + (type == "obstacle" ? Math.round(Math.random() * 3 - 6) : 0));
    object.div.css("width", world.gridSize);
    //object.div.css("height", world.gridSize + (type == "obstacle" ? Math.round(Math.random() * 3 - 6) : 0));
    object.div.css("height", world.gridSize);
 //   object.div.css("border-radius", Math.round(Math.random() * 2 + 8));
  //  object.div.css("-moz-border-radius", Math.round(Math.random() * 2 + 8));
    $("#canvas").append(object.div);
    
    
    return object;
} 
