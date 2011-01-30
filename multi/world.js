exports.makeWorld = function(width, height, gridSize) {
    
    var world = {};
    
    world.width = width;
    world.height = height;
    world.objects = [];
    world.grid = [];
    world.gridSize = gridSize;
    
    world.serialize = function() {
      return {
        event: 'world', 
        width: world.width,
        height: world.height,
        gridSize: world.gridSize,
        objects: world.objects
      };
    };

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

      // "BLUR" to make clusters
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
                       world.grid[i][j] = type;
                       world.objects.push(ob);
                   }
               }
         }
     }
     
     // close gaps
     
   
     for (var i = 0; i < world.grid.length; i++)
       {
 
           for(var j = 0; j < world.grid[i].length; j++)
           {
               if(world.grid[i][j] == 0 
                   && (i == 0 || world.grid[i-1][j] > 0)
                   && (i+1 >= world.grid.length || world.grid[i+1][j] > 0)
                   && (j == 0 || world.grid[i][j-1] > 0)
                   && (j+1 >= world.grid[i].length || world.grid[i][j+1] > 0)
                   )
               {
           
                world.grid[i][j] = 2;
                var ob = makeObject(i, j, "water");
                world.objects.push(ob);
           
               }
           
            }
        }
     
     
        
    };
    
    world.collide = function(x, y, collideWithWater, radius) {
        
        var coll = false;
        
        world.objects.forEach(function (ob, i) {
          // if(Math.round(x/world.gridSize) == ob.x && Math.round(y/world.gridSize) == ob.y)
           if(distance(ob.x * gridSize, ob.y * gridSize, x, y) < radius)
           {
               if(ob.type == "water")
                    coll = collideWithWater;
               else
                    coll = true;
           }  
        });
        
        return coll;
    };
    
    return world;
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function makeObject(x, y, type) {
  return {
    x: x,
    y: y,
    type: type
  };
}