var keyboardState = {};

function keyboardInit() {
  $("body").keydown(function (e) {
    keyboardState[e.keyCode] = true;
    console.log(e.keyCode);
  });
  $("body").keyup(function (e) {
    keyboardState[e.keyCode] = false;
  });
}
$(keyboardInit);

