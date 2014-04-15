

function UIWheel(spriteSheet, frame, title, locPercentX, locPercentY, canvasWidth, canvasHeight, buttonSheet) {	
		
	this._spriteSheet = spriteSheet;
	this._canvasWidth = canvasWidth;
	this._canvasHeight = canvasHeight;
    this._frame = frame; // indexOfFrame could have been better name, this is an integer value
    this.objectTitle = title;
    this._locPercentX = locPercentX;
    this._locPercentY = locPercentY;
    this._buttonSheet = buttonSheet;
    this._x = (this._locPercentX * canvasWidth);
    this._y = (this._locPercentY * canvasHeight);

    // Build the 5 Buttons
    this._wheelButtons = [];
    	// Top
    this._wheelButtons.push(new WheelButton(this._buttonSheet, 0, "topButton", this._locPercentX, this._locPercentY-.27, this._canvasWidth, this._canvasHeight));
    	// Top Left
    this._wheelButtons.push(new WheelButton(this._buttonSheet, 1, "topLeftButton", this._locPercentX-.07, this._locPercentY-.18, this._canvasWidth, this._canvasHeight));
    	// Bottom Left
    this._wheelButtons.push(new WheelButton(this._buttonSheet, 2, "bottomLeftButton", this._locPercentX-.05, this._locPercentY-.03, this._canvasWidth, this._canvasHeight));
    	// Bottom Right
    this._wheelButtons.push(new WheelButton(this._buttonSheet, 3, "bottomRightButton", this._locPercentX+.05, this._locPercentY-.03, this._canvasWidth, this._canvasHeight));
    	// Top Right
    this._wheelButtons.push(new WheelButton(this._buttonSheet, 4, "topRightButton", this._locPercentX+.06, this._locPercentY-.18, this._canvasWidth, this._canvasHeight));
}


_p = UIWheel.prototype;


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

_p.setLocPercentages = function( locX, locY ) {
	this._locPercentX = locX;
	this._locPercentY = locY;
	this._wheelButtons[0].setLocPercentages(locX, locY-.27);
	this._wheelButtons[1].setLocPercentages(locX-.07, locY-.18);
	this._wheelButtons[2].setLocPercentages(locX-.05, locY-.03);
	this._wheelButtons[3].setLocPercentages(locX+.05, locY-.03);
	this._wheelButtons[4].setLocPercentages(locX+.06, locY-.18);
};

_p.didClickbutton = function(canvasClickX, canvasClickY) {
	var counter = -1;

	for(var i=0; i<this._wheelButtons.length; i++) {
        if (  (canvasClickX >= this._wheelButtons[i].getBounds().x) && 
              (canvasClickX <= (this._wheelButtons[i].getBounds().x+this._wheelButtons[i].getBounds().w)) && 
              (canvasClickY >= this._wheelButtons[i].getBounds().y) && 
              (canvasClickY <= (this._wheelButtons[i].getBounds().y+this._wheelButtons[i].getBounds().h))
           ) {
            counter = i;
        }
	    
    }

    if (counter != -1) { return this._wheelButtons[counter];  }
    else {  return false;   }

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

/**
 * @param ctx What context to draw inside
 * @param x where to draw the object on the canas
 * @param y where to draw the object on the canvas
 */
_p.draw = function(ctx, x, y) {
    this._spriteSheet.drawFrame(ctx, this._frame, x, y);    
    for(var i=0; i<this._wheelButtons.length; i++) {
    	this._wheelButtons[i].draw(ctx, this._wheelButtons[i].getPosition().x, this._wheelButtons[i].getPosition().y);
    }
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



















