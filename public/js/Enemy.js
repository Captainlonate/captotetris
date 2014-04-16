
/**
 * An Enemy really only contains a sprite sheet full of images, and an index of a frame for that sprite sheet.
 * 
 * If you think about it hierarchically:
 * We have an ImageManager which is really just a sprite sheet with some overhead
 * Next we have a SpriteSheet. This is where we split up the group of sprite sheets into just one sprite sheet
 * Here we have an Enemy, which is where we cut out a section of a sprite sheet and consider it to be its own "object"
 *
 */
function Enemy(spriteSheet, frame, title, cellX, cellY, predefinedPaths, canvasWidth, canvasHeight) {	
	
	// Store parameters in local variables
	this._predefinedPaths = predefinedPaths;
	this._spriteSheet = spriteSheet;
	this._canvasWidth = canvasWidth;
	this._canvasHeight = canvasHeight;
    this._frame = frame; // indexOfFrame could have been better name, this is an integer value
    this.objectTitle = title;
    
    // Intervals
    this.animationInterval = setInterval(this.incrementFrame.bind(this), 1000);
    
    this._x = (cellX * canvasWidth);
    this._y = (cellY * canvasHeight);

    this._destinationX;
    this._destinationY;
    this._speed = 1;
    
    this.doneX = 1; // 1 for "x is where it should be", 0 for "x still needs to move"
    this.doneY = 1; // 1 for "y is where it should be", 0 for "y still needs to move"
    
    this._currentStep = 0;
    this._walking = true;
    this._fighting = false;
    this._reachedCheckpoint = false;
}

_p = Enemy.prototype;





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

_p.isTraveling = function() {
    if( this._traveling == 1 ) {return true;} 
    else if( this._traveling == 0 ) {return false;}
};

_p.setCanvasSize = function(width, height) {
	this._canvasWidth = width;
	this._canvasHeight = height;
}

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
	else if(this._frame == 2) { this._frame = 0; }
};

/**
 * @param ctx What context to draw inside
 * @param x where to draw the object on the canas
 * @param y where to draw the object on the canvas
 */
_p.draw = function(ctx, x, y) {
	// this._frame specifies where in the sprite sheet the "object" exists. It's the set of frames example: [0, 0, 90, 150, 45, 150]
	// x and y are where we want to draw the image IN THE CONTEXT. They are the destination x and y
    
    //this.drawBoundingBox(ctx);
    this._spriteSheet.drawFrame(ctx, this._frame, x, y);
};








/**								MOVEMENT				**/

/** This gets called every frame. If the Player Character is currently traveling to a location, traveling will == 1 and 
 *	this function will change the Player Character's position. Otherwise it will quickly exit. 
 *  WHEN THE NPC MOVES
 */
_p.updateLocation = function() {
	// If he is fighting something
	if (this._fighting == true) {
		
	}

	// If he has reached the checkpoint location and needs to calculate the next one
	if (this._reachedCheckpoint == true) {

	
		// What is the next destination? Set it here
		if ( this._currentStep < this._predefinedPaths.length) {
			this._destinationX = (this._predefinedPaths[this._currentStep].x * this._canvasWidth);
			this._destinationY = (this._predefinedPaths[this._currentStep].y * this._canvasHeight);			
			this._currentStep++;
			this._walking = true;
		}
		this._reachedCheckpoint = false;
	}

	// If he is just walking to the already calculated location
	if (this._walking == true) {

		if(this._x < this._destinationX-1) {
			this._x += this._speed;
			this.doneX = 0; // Since there was a change, we'll need to check again later
		}else if(this._x > this._destinationX+1) {
			this._x -= this._speed;
			this.doneX = 0; // Since there was a change, we'll need to check again later
		}else {
			this.doneX = 1;
		}
		
		// Move the Y coordinate
		if (this._y < this._destinationY-1) {
			this._y += this._speed;
			this.doneY = 0; // Since there was a change, we'll need to check again later
		}else if(this._y > this._destinationY+1) {
			this._y -= this._speed;
			this.doneY = 0; // Since there was a change, we'll need to check again later
		}else {
			this.doneY = 1;
		}
		
		// If neither x nor y were updated
		if(this.doneX == 1 && this.doneY == 1) {
			this._reachedCheckpoint = true;
		}
		
	}
	
};

_p.drawBoundingBox = function(ctx) {	
	ctx.rect(	this._spriteSheet.getFrameBounds(0, this._x, this._y).x,
				this._spriteSheet.getFrameBounds(0, this._x, this._y).y,	
				this._spriteSheet.getFrameBounds(0, this._x, this._y).w,
				this._spriteSheet.getFrameBounds(0, this._x, this._y).h	);
};











