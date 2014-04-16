




function Tower(spriteSheet, frame, title, locPercentX, locPercentY, canvasWidth, canvasHeight) {	
		
	this._spriteSheet = spriteSheet;
	this._canvasWidth = canvasWidth;
	this._canvasHeight = canvasHeight;
    this._frame = frame; // indexOfFrame could have been better name, this is an integer value
    this.objectTitle = title;
    this._locPercentX = locPercentX;
    this._locPercentY = locPercentY;
    this._x = (locPercentX * canvasWidth);
    this._y = (locPercentY * canvasHeight);
    // this.animationInterval = setInterval(this.incrementFrame.bind(this), 400);
    this.masterAnimationInterval;
}

_p = Tower.prototype;



/** 						GETTERS AND SETTERS     		**/

_p.setPosition = function(x, y) {
    this._x = x;
    this._y = y;
};

/**	EnemyRenderer calls this, includes the viewport coordinates and then calls Enemy.draw() **/
_p.getPosition = function() {
    return {
        x: this._x,
        y: this._y
    };
};

_p.getSpriteSheet = function() {
	return this._spriteSheet;
};

_p.setSpriteSheet = function(newSpriteSheet) {
	this._spriteSheet = newSpriteSheet;
	
	if ( newSpriteSheet.getTitle() == "toucanTower" ) {
		this.masterAnimationInterval = setInterval(this.getAnimationGoing.bind(this), 5000);
	}	
};

_p.getAnimationGoing = function() {
	if ( this._spriteSheet.getTitle() == "toucanTower" ) {
		this.animationInterval = setInterval(this.incrementFrame.bind(this), 100);
	}
};

_p.getBounds = function() {
    return this._spriteSheet.getFrameBounds(this._frame, this._x, this._y);
};

_p.setFrame= function(newFrame) {
	this._frame = newFrame;
};

_p.getTitle = function() {
    return this.objectTitle;
};

_p.setCanvasSize = function(width, height) {
	this._canvasWidth = width;
	this._canvasHeight = height;
	this._x = this._locPercentX  * this._canvasWidth;
	this._y = this._locPercentY * this._canvasHeight;
};

_p.getLocPercentages = function() {
	return {
		x: this._locPercentX,
		y: this._locPercentY
	};
};



/**								ANIMATION				**/

/**
 * Used for animating images - called by a setInterval()
 */
_p.incrementFrame = function() {
	if(this._frame == 0) { this._frame = 1; }
	else if(this._frame == 1) { this._frame = 2; }
	else if(this._frame == 2) { this._frame = 3; }
	else if(this._frame == 3) { this._frame = 4; }
	else if(this._frame == 4) { this._frame = 5; }
	else if(this._frame == 5) { this._frame = 6; }
	else if(this._frame == 6) { this._frame = 7; }
	else if(this._frame == 7) { this._frame = 8; }
	else if(this._frame == 8) { this._frame = 9; }
	else if(this._frame == 9) { this._frame = 0; 
	clearInterval(this.animationInterval);}
};

/**
 * @param ctx What context to draw inside
 * @param x where to draw the object on the canas
 * @param y where to draw the object on the canvas
 */
_p.draw = function(ctx, x, y) {
	// this._frame specifies where in the sprite sheet the "object" exists. It's the set of frames example: [0, 0, 90, 150, 45, 150]
	// x and y are where we want to draw the image IN THE CONTEXT. They are the destination x and y
    this._spriteSheet.drawFrame(ctx, this._frame, x, y);    
    //this.drawBoundingBox(ctx);
};

_p.drawBoundingBox = function(ctx) {
	ctx.rect(	this._spriteSheet.getFrameBounds(0, this._x, this._y).x,
				this._spriteSheet.getFrameBounds(0, this._x, this._y).y,	
				this._spriteSheet.getFrameBounds(0, this._x, this._y).w,
				this._spriteSheet.getFrameBounds(0, this._x, this._y).h	);
	ctx.stroke();
}

_p.updateLocation = function() {

};



















