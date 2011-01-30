function makeWorld(width, height, gridSize) {
    
    var world = {};
    
    world.width = width;
    world.height = height;
    world.objects = [];
    world.grid = [];
    
    world.gridSize = gridSize;
    
    world.generate = function(density) {
      
      for(var i = 0; i < width/gridSize; i++)
      {
          world.grid[i] = [];
          
          for(var j = 0; j < height/gridSize; j++)
          {
              world.grid[i][j] = 0;
              
              if(Math.random() < density)
              {
                  var type = Math.random() > .3 ? 1 : 2;
                  var ob = makeObject(i, j, type == 1 ? "obstacle" : "water");
                  world.grid[i][j] = type;
                  world.objects.push(ob);
              }
              
          }
      }

      var newgrid = [];

      
      for(var iter = 0; iter < 3; iter++)
      {
          
      for(var i = 0; i < world.grid.length; i++)
      {
          newgrid[i] = [];
          for(var j = 0; j < world.grid[i].length; j++)
          {
              
              if(world.grid[i][j] > 0)
              {
              
              for(var n = Math.max(i - 1, 0); n < Math.min(i + 1, world.width); n++)
              {
                  for(var m = Math.max(j - 1, 0); m < Math.min(j + 1, world.height); m++)
                  {
                      if(world.grid[n][m] == 0)
                      {
                          if(Math.random() > .4) newgrid[n][m] = world.grid[i][j];
                      }
                  }
              }
              
              }
              
           }
       }

     
     for(var i = 0; i < world.grid.length; i++)
     {
           for(var j = 0; j < world.grid[i].length; j++)
           {
               if(world.grid[i][j] == 0 && newgrid[i][j] > 0)
               {
                   var type = newgrid[i][j];
                   var ob = makeObject(i, j, type == 1 ? "obstacle" : "water");
                   world.grid[i][j] = 1;
                   world.objects.push(ob);
               }
           }
     }
 }
        
    };
    
    world.collide = function(x, y, collideWithWater) {
        
        var coll = false;
        
        $.each(world.objects, function (i, ob) {
           if(Math.round(x/world.gridSize) == ob.x && Math.round(y/world.gridSize) == ob.y)
           {
               if(ob.type == "water")
                    coll = collideWithWater;
               else
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
    $("#canvas").append(object.div);
    
    
    return object;
} 