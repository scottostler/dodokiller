function Spritesheet(name, x, y, width, height, spriteWidth, spriteHeight, activeSprite, source) {
    this.name = name,
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.spriteWidth = spriteWidth;
    this.activeSprite = activeSprite;
    this.source = source;
    
    $("#canvas").append("<div class='spritesheet' id='"+name+"'><div class='image'><img src='"+source+"'></div></div>");
    this.jqdiv = $("#"+name);
    $(this.jqdiv).css("width", spriteWidth);
    $(this.jqdiv).css("height", spriteHeight);
    this.jqimg = $("#"+name).find(".image")[0];
    
}

Spritesheet.prototype.draw = function() {
    this.jqdiv.css("left", this.x);
    this.jqdiv.css("top", this.y);
    $(this.jqimg).css("left", - this.activeSprite * this.spriteWidth);
}




function makeSprite(width, height, source) {
  var div = $("<div style='position:absolute; top: -1000px; left: -1000px;'></div>");
  $("#canvas").append(div);
  div.css("width", width);
  div.css("height", height);
  div.css("background-image", "url("+source+")");
  
  return {
    draw: function (x, y, activeSprite) {
      var sx = -activeSprite * width;
      var sy = 0;
      div.css("background-position", sx + "px " + sy + "px");
      div.css("left", x - width/2);
      div.css("top", y - height/2);
    }
  }
}