function makeSprite(width, height, source) {
  var div = $("<div style='position:absolute; top: -1000px; left: -1000px;'></div>");
  $("#canvas").append(div);
  div.css("width", width);
  div.css("height", height);
  div.css("z-index", 10);
  div.css("background-image", "url("+source+")");
  
  return {
    draw: function (x, y, activeSprite) {
      var sx = activeSprite * width;
      var sy = 0;
      div.css("background-position", sx + "px " + sy + "px");
      div.css("left", x - width/2);
      div.css("top", y - height/2);
      
    },
    destroy: function () {
      div.remove();
    }
  };
}