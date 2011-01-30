function makeWorld(width, height, gridSize) {
    
    var world = {};
    
    world.width = width;
    world.height = height;
    world.objects = [];
    
    world.gridSize = gridSize;
    
    world.generate = function(density) {
      
      for(var i = 0; i < width/gridSize; i++)
      {
          for(var j = 0; j < height/gridSize; j++)
          {
              if(Math.random() < density)
              {
                  var ob = makeObject(i, j, "obstacle");
                  world.objects.push(ob);
              }
              
          }
      }
        
    };
    
    world.collide = function(x, y) {
        
        var coll = false;
        
        $.each(world.objects, function (i, ob) {
           if(Math.round(x/world.gridSize) == ob.x && Math.round(y/world.gridSize) == ob.y)
           {
               coll = true;
           }  
        });
        
        return coll;
    };
    
    world.draw = function() {
        
        $.each(world.objects, function (i, ob) {
           // console.log(ob);
            ob.div.css("left", ob.x * gridSize - gridSize/2);
            ob.div.css("top", ob.y * gridSize - gridSize/2);
            ob.div.css("width", gridSize);
            ob.div.css("height", gridSize);
        });
        
        
    }
    
    return world;
}

function makeObject(x, y, type) {
    
    var object = {};
    
    object.x = x;
    object.y = y;
    object.type = type;
    object.div = $("<div class='obstacle'></div>");
    $("#canvas").append(object.div);
    
    
    return object;
} 