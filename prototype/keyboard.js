var keyboardState = {};

function keyboardInit() {
  $(document).keydown(function (e) {
    keyboardState[e.keyCode] = true;
    // console.log(e.keyCode);
  });
  $(document).keyup(function (e) {
    keyboardState[e.keyCode] = false;
  });
}
$(keyboardInit);

