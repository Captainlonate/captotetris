/**
 *
 * @param image the image object to use for drawing
 * 		This actually ends up being an <img src=> tag with the path of the image file
 * @param frames the array describing the frames of the sprite sheet in a format:
 * [
 * 	 [x, y, width, height, anchorX, anchorY] // - frame 1
 * 	 [x, y, width, height, anchorX, anchorY] // - frame 2
 * 	 ...
 * ]
 * 
 */
function SpriteSheet(canvasWidth, canvasHeight, image, frames) {
    this._image = image; // "image" actually looks something like: <img src="img/PalmTree1.png">
    this._frames = frames; 
    // image.src looks something like: http://192.168.1.133:8000/img/Character1.png 
    // So if I split this up by '/' characters, the 5th spot should be the image title
    // Basically, this._spriteSheetTitle now equals something like PalmTree1 or Character1 
    this._spriteSheetTitle = image.src.split('/')[4].split('.')[0];
    if (this._spriteSheetTitle == "Tower1") {
        var imageRatio = frames[0][2] / frames[0][3];
        this._heightPerc = 0.18;
        this._heightPercPixels = this._heightPerc *  canvasHeight;
        this._widthPercPixels = imageRatio * this._heightPercPixels;

    }
    else if (this._spriteSheetTitle == "toucanTower") {
        var imageRatio = frames[0][2] / frames[0][3];
        this._heightPerc = 0.20;
        this._heightPercPixels = this._heightPerc *  canvasHeight;
        this._widthPercPixels = imageRatio * this._heightPercPixels;
    }
    else if (this._spriteSheetTitle == "ogreSheet") {
        var imageRatio = frames[0][2] / frames[0][3];
        this._heightPerc = 0.1;
        this._heightPercPixels = this._heightPerc *  canvasHeight;
        this._widthPercPixels = imageRatio * this._heightPercPixels;
    }
    else if (this._spriteSheetTitle == "Sign1") {
        var imageRatio = frames[0][2] / frames[0][3];
        this._heightPerc = 0.11;
        this._heightPercPixels = this._heightPerc *  canvasHeight;
        this._widthPercPixels = imageRatio * this._heightPercPixels;
    }
    else if (this._spriteSheetTitle == "Ring") {
        var imageRatio = frames[0][2] / frames[0][3];
        this._heightPerc = 0.35;
        this._heightPercPixels = this._heightPerc *  canvasHeight;
        this._widthPercPixels = imageRatio * this._heightPercPixels;
    }
    else if (this._spriteSheetTitle == "WheelButtons") {
        var imageRatio = frames[0][2] / frames[0][3];
        this._heightPerc = 0.1;
        this._heightPercPixels = this._heightPerc *  canvasHeight;
        this._widthPercPixels = imageRatio * this._heightPercPixels;
    }

}

_p = SpriteSheet.prototype;

// All "sets" of frames come with 6 numbers. I describe these numbers in detail down below
SpriteSheet.FRAME_X = 0;
SpriteSheet.FRAME_Y = 1;
SpriteSheet.FRAME_WIDTH = 2;
SpriteSheet.FRAME_HEIGHT = 3;
SpriteSheet.FRAME_ANCHOR_X = 4;
SpriteSheet.FRAME_ANCHOR_Y = 5;

/**
 * Draws the frame of the sprite sheet in the given coordinates of the context.
 * This is the actual function that does the drawing. It is called by WorldObject's draw() method
 * 
 * Basically somewhere outside, I will say myWorldObject.draw(), and then draw() will end up calling this method here
 * @param ctx the context to draw in
 * @param index the index of the frame
 * @param x the x coordinate where the anchor will appear
 * @param y the y coordinate where the anchor will appear
 */
_p.drawFrame = function(ctx, index, x, y) {
    // this._frames can contains a set of frames for multiple objects. What I'm trying to accomplish here
    // is that I want to get the set of frames that correspond to the object I want to draw
    var frame = this._frames[index]; // This looks something like: [0, 0, 90, 106, 45, 105]
    
    if (!frame)
        return;


    if (this._spriteSheetTitle == "toucanTower") {
        var imageRatio = this._frames[0][2] / this._frames[0][3];
        var newVal = frame[SpriteSheet.FRAME_ANCHOR_X]*imageRatio;
        

        
        


        var ankorX = frame[SpriteSheet.FRAME_ANCHOR_X];
        var newT = ankorX / frame[SpriteSheet.FRAME_WIDTH];
        var somet = newT * this._widthPercPixels;

        ctx.drawImage(
                    this._image, 
                    frame[SpriteSheet.FRAME_X], 
                    frame[SpriteSheet.FRAME_Y],
                    frame[SpriteSheet.FRAME_WIDTH], 
                    frame[SpriteSheet.FRAME_HEIGHT],
                    x - somet, 
                    y - this._heightPercPixels,
                    this._widthPercPixels, 
                    this._heightPercPixels
                );
    }
    else {
        ctx.drawImage(
        			this._image, 
        			frame[SpriteSheet.FRAME_X], 
        			frame[SpriteSheet.FRAME_Y],
            		frame[SpriteSheet.FRAME_WIDTH], 
            		frame[SpriteSheet.FRAME_HEIGHT],
            		x - this._widthPercPixels/2, 
            		y - this._heightPercPixels,
            		this._widthPercPixels, 
            		this._heightPercPixels
            	);
    }



};

_p.getFrameBounds = function(index, x, y) {
    var frame = this._frames[index];
    if (!frame)
        return;

    return {
        x: x - this._widthPercPixels/2,
        y: y - this._heightPercPixels,
        w: this._widthPercPixels,
        h: this._heightPercPixels
    };
};

_p.getTitle = function() {
	return this._spriteSheetTitle;
};

_p.canvasResized = function(newWidth, newHeight) {
    var imageRatio = this._frames[0][2] / this._frames[0][3];   
    this._heightPercPixels = this._heightPerc *  newHeight;
    this._widthPercPixels = imageRatio * this._heightPercPixels;
};