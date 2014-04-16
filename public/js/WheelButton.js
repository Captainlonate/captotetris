




function WheelButton(spriteSheet, frame, title, locPercentX, locPercentY, canvasWidth, canvasHeight) {			
	this._spriteSheet = spriteSheet;
	this._canvasWidth = canvasWidth;
	this._canvasHeight = canvasHeight;
    this._frame = frame; // indexOfFrame could have been better name, this is an integer value
    this.objectTitle = title;
    this._locPercentX = locPercentX;
    this._locPercentY = locPercentY;
    this._x = (this._locPercentX * canvasWidth);
    this._y = (this._locPercentY * canvasHeight);
}

_p = WheelButton.prototype;



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
};

_p.getBounds = function() {
    return this._spriteSheet.getFrameBounds(0, this._x, this._y);
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

_p.setLocPercentages = function( locX, locY ) {
	this._locPercentX = locX;
	this._locPercentY = locY;
	this._x = (this._locPercentX * this._canvasWidth);
    this._y = (this._locPercentY * this._canvasHeight);
};


/**								ANIMATION				**/

/**
 * Used for animating images - called by a setInterval()
 */
_p.incrementFrame = function() {
	if(this._frame == 0) { this._frame = 1; }
	else if(this._frame == 1) { this._frame = 2; }
	else if(this._frame == 2) { this._frame = 0; }
};


_p.draw = function(ctx, x, y) {
    this._spriteSheet.drawFrame(ctx, this._frame, x, y);
   // this.drawBoundingBox(ctx);
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



















