function Sprite(x, y, height, width, sprite) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.sprite = new Image();
    this.sprite.src = sprite;
}

function Spritesheet(x, y, width, height, spriteWidth, activeSprite, spirte) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.spriteWidht = spriteWidth;
    this.activeSprite = activeSprite;
    this.sprite = sprite;
}

Sprite.prototype.draw = function(ctx) {
    ctx.drawImage(this.sprite, this.x, this.y);
};

Spritesheet.prototype.draw = function(ctx) {
    ctx.drawImage(this.sprite, this.x, this.y);
};

function Game(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sprites = [];
    this.spritesheets = [];
    this.targetFPS = 30;
}

Game.prototype.addSprite = function(sprite) {
    this.sprites.push(sprite);
};

Game.prototype.addSpritesheet = function(spritesheet) {
    this.spritesheets.push(spritesheet);
};

Game.prototype.draw = function() {
    this.ctx.clearRect(0, 0, 1000, 1000);
   
    for (var i in this.sprites) {
        var sprite = this.sprites[i];
        sprite.draw(this.ctx);
    }
    
    for (var i in this.sprite) {
        var spritesheet = this.spritesheets[i];
        spritesheet.draw(this.ctx);
    }
};

function recognizeKeyEvent(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    codeMap = {
        32: 'space',
        97: 'left',
        141: 'left',
        100: 'right',
        144: 'right',
        115: 'down',
        163: 'down',
        119: 'up',
        167: 'up'
    };
    if (code in codeMap)
        return codeMap[code];
};

Game.prototype.handleKeyEvent = function(input) {
    console.log(input);
    if (input == 'up') {
        this.sprites[0].y = this.sprites[0].y + 1;
    } else if (input == 'down') {
        this.sprites[0].y = this.sprites[0].y - 1;
    } else if (input == 'left') {
        this.sprites[0].x = this.sprites[0].x - 1;
    } else if (input == 'right') {
        this.sprites[0].x = this.sprites[0].x + 1;
    }
};

Game.prototype.registerKeyboardHandlers = function() {
    var self = this;
    $('body').keypress(function(e) {
        var input = recognizeKeyEvent(e);
        if (input)
            self.handleKeyEvent(input);
    });
};

Game.prototype.enterRunLoop = function() {
    var msPerFrame = 1000 / this.targetFPS;
    var game = this;

    var loopFunc = function() {
        game.draw();
    };

    this.registerKeyboardHandlers();
    setInterval(loopFunc, msPerFrame);
};

function initGame(canvasID) {
    var canvasElem = document.getElementById(canvasID);
    if (!canvasElem)
        throw "Invalid canvas ID " + canvasID;

    var game = new Game(canvasElem);
    
    /*game.addSprite(new Sprite(
        0, 0, 50, 50,
        'http://josephsmith.net/Static%20Images/howard_w_hunter_SI.jpg'));*/
        
    game.addSpritesheet(new Spritesheet(
        0, 0, 1440, 40, 40, 0, "../media/hat_p1_spritesheet.png"
        ));

    game.enterRunLoop();
}