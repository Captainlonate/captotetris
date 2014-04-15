
/**
 * Basically an Enemy Renderer contains a bunch of Enemy's. It can tell all of the Enemy's to draw themselves.
 * 
 * @param {Object} enemies			The collection of "Enemy's" that already exist
 * @param {Object} viewportWidth   	The width of the canvas
 * @param {Object} viewportHeight	The height of the canvas
 */
function EnemyRenderer(viewportWidth, viewportHeight) {
    this._enemiesArray = []; // These are all Enemys

	// I expect this to sort the enemies based on their y location. This is so objects will be layered, and the lower positioned objects
	// will appear to be in front of the higher positioned objects. This is done via the order in which they are drawn
    this._enemiesArray.sort(function(o1, o2) {
        var bounds1 = o1.getBounds();
        var bounds2 = o2.getBounds();
        return (bounds1.y + bounds1.h) - (bounds2.y + bounds2.h);
    });
	// Canvas width and canvas height stored as local variables here
    this._viewportWidth = viewportWidth;
    this._viewportHeight = viewportHeight;
    // X:    + << >> -
    // Y:    + up   down -
    this._x = 0;
    this._y = 0;
}

_p = EnemyRenderer.prototype;

/**
 *	Game.js onMove() calls this 
 */
_p.move = function(deltaX, deltaY) {
    this._x += deltaX;
    this._y += deltaY;
    //var ogre = this.findObjectBySpriteSheet("ogreSheet");
    //console.log("I'm at: " + ogre.getPosition().x + ", " + ogre.getPosition().y);
};

/**
 * Function that is capable of searching through all known World Objects and performing some action on it 
 */
_p.findObjectBySpriteSheet = function(title) {
	var counter = -1;
	for(var i=0; i<this._enemiesArray.length; i++) {
		if( this._enemiesArray[i].getSpriteSheet().getTitle() == title) {
			counter = i;
		}
	}
	if (counter != -1) {
		return this._enemiesArray[counter];
	}
};

/**
 * Game.html has resizeCanvas(), it calls Game.js's resizeMainCanvas() 
 */
_p.setViewportSize = function(width, height) {
    this._viewportWidth = width;
    this._viewportHeight = height;
    if (this._enemiesArray.length > 0) {  
        this._enemiesArray.forEach(function(entry){entry.setCanvasSize(width, height);});
         this._enemiesArray.forEach(function(entry){entry.getSpriteSheet().canvasResized(width, height);});
    }
};

/**
 * Game.js calls this in it's animate() method. 
 * This tells the enemy to draw itself
 */
_p.draw = function(ctx) {
    for (var i = 0; i < this._enemiesArray.length; i++) {
        var obj = this._enemiesArray[i];        
        var pos = obj.getPosition();
        obj.draw(ctx, this._x + pos.x, this._y + pos.y);
    }
 };

_p.getViewPortPosition = function() {
	return {
        x: this._x,
        y: this._y
    };
};

_p.updateLocations = function() {
	for (var i = 0; i < this._enemiesArray.length; i++) {
        this._enemiesArray[i].updateLocation();
    }
};

_p.clickedOnObject = function(canvasClickX, canvasClickY) {
    var counter = -1;

    for(var i=0; i<this._enemiesArray.length; i++) {
        if (  (canvasClickX >= this._enemiesArray[i].getBounds().x) && 
              (canvasClickX <= (this._enemiesArray[i].getBounds().x+this._enemiesArray[i].getBounds().w)) && 
              (canvasClickY >= this._enemiesArray[i].getBounds().y) && 
              (canvasClickY <= (this._enemiesArray[i].getBounds().y+this._enemiesArray[i].getBounds().h))
           ) {
            //console.log("Found: " + this._enemiesArray[i].getTitle());
            counter = i;
        }
    }
    if (counter != -1) {
        return this._enemiesArray[counter];
    }
    else {
        return false;
    }
};


_p.addObject = function(ctx, object) {
	this._enemiesArray.push(object);
	this._enemiesArray.sort(function(o1, o2) {
        var bounds1 = o1.getBounds();
        var bounds2 = o2.getBounds();
        return (bounds1.y + bounds1.h) - (bounds2.y + bounds2.h);
    });
	this.draw(ctx);
}

_p.removeWheel = function() {
    var counter = -1;
    for(var i=0; i<this._enemiesArray.length; i++) {
        if( this._enemiesArray[i].getSpriteSheet().getTitle() == "Ring") {
            counter = i;
        }
    }
    if (counter != -1) {
        this._enemiesArray.splice(counter, 1);
    }
};


