
/*
	So here is how this all works
	A piece is spawned above the visible portion of the grid.
	|______| <-- Up here
	|	   |
	|      |
	Then, a setInterval is created. Every time the setinterval calls
		it's callback function, the pieces' locations are updated
		to be one row greater than their current row.


*/


function LevelOne(ctx, canvasWidth, canvasHeight, imageManager) {	
	// LOL you better have this or nothing will draw
	this._ctx = ctx;
	// The canvas's width and height - used in setViewportSize()
	this._canvasWidth = canvasWidth;
	this._canvasHeight = canvasHeight;
	// The imageManager from Game.js - used to create spriteSheets
	this._imageManager = imageManager;
	// The enemyRenderer - Typically one per level ( should set up some sort of inheritance relationship )
	this.enemyRenderer = new EnemyRenderer(this._canvasWidth, this._canvasHeight);
	// Make and initialize the 2d array with all 0's
	this.gridArray = this.initialize2DArray();
	// Block One stuff
	this.activeBlockOne;
	this.b1_row;
	this.b1_col;
	// Block Two stuff
	this.activeBlockTwo;
	this.b2_row;
	this.b2_col;
	// The interval that drops the pieces
	this.pieceDropInterval;
}

_p = LevelOne.prototype;

/* SOME CONSTANTS FOR READABILITY */
// Colors
LevelOne.CL_BLU = 1; // Blue
LevelOne.CL_RED = 2; // Red
LevelOne.CL_GRN = 3; // Green
LevelOne.CL_YLW = 4; // Yellow
// Function of the piece
LevelOne.IS_BREAKER = true; // Builder
// Stage of Stone
LevelOne.FIRST_STONE = 1; // First Stage of Stone
LevelOne.SECOND_STONE = 2; // Second Stage of Stone
LevelOne.NUMROWS = 15;
LevelOne.NUMCOLS = 7;
LevelOne.STARTCOL = 3;
LevelOne.STARTROW_B1 = 0;
LevelOne.STARTROW_B2 = 1;








	







/**
 * The logic behind this level
 */
_p.run = function() {
	this.spawnNewPiece();
};

/** 
 * Initializes the 2d array with 0's 
 */
_p.initialize2DArray = function() {
	var board = [];
	for (var i=0; i<LevelOne.NUMROWS; i++) {
		board[i] = [];
		for (var j=0; j<LevelOne.NUMCOLS; j++) {
			board[i][j] = 0;
		}
	} 
	return board;
};


/**
 * Make a new Piece starting at the top of the grid 
 *  ( outside the bounds where you can't see )
 *  A piece consists of Block 1 and Block 2
 */
_p.spawnNewPiece = function() {
	// Make sure that the initial spawn point is empty
	if ( this.gridArray[LevelOne.STARTROW_B1][LevelOne.STARTCOL] == 0) {
		this.activeBlockOne = new Block(false);
		this.b1_row = LevelOne.STARTROW_B1;
		this.b1_col = LevelOne.STARTCOL;
		this.gridArray[LevelOne.STARTROW_B1][LevelOne.STARTCOL] = this.activeBlockOne;

		this.activeBlockTwo = new Block(false);
		this.b2_row = LevelOne.STARTROW_B2;
		this.b2_col = LevelOne.STARTCOL;
		this.gridArray[LevelOne.STARTROW_B2][LevelOne.STARTCOL] = this.activeBlockTwo;

		this.pieceDropInterval = setInterval(this.dropTheActivePiece.bind(this), 1000);
	}	
};


/*
		THE CONTROLS
*/

_p.keyPressed = function(e) {	
	// Don't try to modify the block if it doesn't exist
	if (this.activeBlockOne != null) {	
		switch(e.keyCode) {
		case 87:// W
		case 38:// Up Arrow
			
			// If the other block is above the pivot ( default starting position )
			if ( (this.b1_row == (this.b2_row-1)) && (this.b1_col == this.b2_col) ) {
					// See if the cell to the Right of the pivot block is empty
					if ( this.gridArray[this.b2_row][this.b2_col+1] == 0 ) {
						// Move the other block to the right of the pivot
						// First, move the other block ( there will end up being two )
						this.gridArray[this.b2_row][this.b2_col+1] = this.activeBlockOne;
						// Then remove the previously existing one ( so that there is 1 again )
						this.gridArray[this.b1_row][this.b1_col] = 0;
						// Then update the location of the other block
						this.b1_row = this.b2_row;
						this.b1_col = this.b2_col+1;
					}
					// If not, is the cell to the Left of the pivot empty?
					else if( this.gridArray[this.b2_row][this.b2_col-1] == 0 ) {

					}
					// otherwise, just swap the position of the two blocks
					else {

					}
				
			}
			// If the other block is to the right of the pivot
			else if( (this.b1_col == (this.b2_col+1)) && (this.b1_row == this.b2_row) ) {
					// See if the cell below the pivot block is empty
					if ( this.gridArray[this.b2_row+1][this.b2_col] == 0 ) {
						// Move the other block (to) below the pivot
						// First, move the other block ( there will end up being two )
						this.gridArray[this.b2_row+1][this.b2_col] = this.activeBlockOne;
						// Then remove the previously existing one ( so that there is 1 again )
						this.gridArray[this.b1_row][this.b1_col] = 0;
						// Then update the location of the other block
						this.b1_row = this.b2_row+1;
						this.b1_col = this.b2_col;
					}
					// If not, is the cell above the pivot empty?
					else if ( this.gridArray[this.b2_row-1][this.b2_col] == 0 ) {

					}
					// otherwise, just swap the position of the two blocks
					else {

					}
			}
			// If the other block is below the pivot
			else if( (this.b1_row == (this.b2_row+1)) && (this.b1_col == this.b2_col) ) {
					// See if the cell to the left of the pivot block is empty
					if ( this.gridArray[this.b2_row][this.b2_col-1] == 0 ) {
						// Move the other block to the left of the pivot
						// First, move the other block ( there will end up being two )
						this.gridArray[this.b2_row][this.b2_col-1] = this.activeBlockOne;
						// Then remove the previously existing one ( so that there is 1 again )
						this.gridArray[this.b1_row][this.b1_col] = 0;
						// Then update the location of the other block
						this.b1_row = this.b2_row;
						this.b1_col = this.b2_col-1;
					}
					// If not, is the cell to the right of the pivot empty?
					else if( this.gridArray[this.b2_row][this.b2_col+1] == 0 ) {

					}
					// otherwise, just swap the position of the two blocks
					else {

					}
			}
			// If the other block is to the left of the pivot
			else if( (this.b1_col == (this.b2_col-1)) && (this.b1_row == this.b2_row) ) {
					// See if the cell above the pivot block is empty
					if ( this.gridArray[this.b2_row-1][this.b2_col] == 0 ) {
						// Move the other block (to) above of the pivot
						// First, move the other block ( there will end up being two )
						this.gridArray[this.b2_row-1][this.b2_col] = this.activeBlockOne;
						// Then remove the previously existing one ( so that there is 1 again )
						this.gridArray[this.b1_row][this.b1_col] = 0;
						// Then update the location of the other block
						this.b1_row = this.b2_row-1;
						this.b1_col = this.b2_col;
					}
					// If not, is the cell below the pivot empty?
					else if ( this.gridArray[this.b2_row+1][this.b2_col] == 0 ) {

					}
					// otherwise, just swap the position of the two blocks
					else {

					}
			}
			
			break;
		case 65:// A
		case 37:// L Arrow
				this.leftTheActivePiece();
			break;
		case 83:// S
		case 40:// D Arrow
		case 32:// SpaceBar			
				this.dropTheActivePiece();			
			break;
		case 68:// D
		case 39:// R Arrow
			// If moving the piece right won't take it out of bounds
			// If there is no block to the right of this active block
			// if ( (this.b1_col+1 < LevelOne.NUMCOLS) &&
			//      (this.gridArray[this.b1_row][this.b1_col+1] == 0) && 
			//      (this.b2_col+1 < LevelOne.NUMCOLS) &&
			//      (this.gridArray[this.b2_row][this.b2_col+1] == 0) ){
			// 	// First, move the block to the right
			// 	this.gridArray[this.b1_row][this.b1_col+1] = this.activeBlockOne;
			// 	this.gridArray[this.b2_row][this.b2_col+1] = this.activeBlockTwo;
			// 	// Then, remove the block from where it's at
			// 	this.gridArray[this.b1_row][this.b1_col] = 0;
			// 	this.gridArray[this.b2_row][this.b2_col] = 0;
			// 	// Then, update the row variable representing the location
			// 	this.b1_col = this.b1_col+1;
			// 	this.b2_col = this.b2_col+1;
			// }
				this.rightTheActivePiece();
			break;
		}
	}
};


/** 
 * This is the callback function for the pieceDropInterval. It attempts to move the 
 * active Piece ( block 1 and block 2 ) down every time it's called based on some 
 * criteria. This is ultimately where the end of the player's turn should be.
 * ALTERNATIVELY, this function can be manually called to drop the active piece. It
 * performs all the necessary bounds checking to see if the piece CAN be dropped first.
 */
_p.dropTheActivePiece = function() {

	if ( this.b1_row > this.b2_row ) { // If Block 1 is below Block 2
			// Will moving block 1 cause it to go out of bounds?
			// Is there a pieceDropInterval active?
			// Finally, is there a block under block 1? ( where block 1 is trying to move)
			if ( (this.b1_row+1 < LevelOne.NUMROWS) &&
				 (this.pieceDropInterval != null) &&
				 (this.gridArray[this.b1_row+1][this.b1_col] == 0) ) {

				this.dropBlockOne();
				this.dropBlockTwo();
			}
			else {
				// If the piece can't drop anymore, get rid of the dropping interval, 
				// and try to spawn a new piece
				clearInterval(this.pieceDropInterval);
				this.pieceDropInterval = null;
				this.spawnNewPiece();
			}

	}
	else if( this.b2_row > this.b1_row ) { // If Block 2 is below Block 1
			// Will moving block 2 cause it to go out of bounds?
			// Is there a pieceDropInterval active?
			// Finally, is there a block under block 2? ( where block 2 is trying to move)
			if ( (this.b2_row+1 < LevelOne.NUMROWS) &&
				 (this.pieceDropInterval != null) &&
				 (this.gridArray[this.b2_row+1][this.b2_col] == 0) ) {

				this.dropBlockTwo();
				this.dropBlockOne();
			}
			else {
				// If the piece can't drop anymore, get rid of the dropping interval, 
				// and try to spawn a new piece
				clearInterval(this.pieceDropInterval);
				this.pieceDropInterval = null;
				this.spawnNewPiece();
			}
	}
	else { // If both blocks are side by side
			// Can block one move? AND Can block two move?
			if ( this.canBlockOneDrop() && this.canBlockTwoDrop() ) {
				// If both can move, then move them
				this.dropBlockOne();
				this.dropBlockTwo();
			}
			else { // else if even one of them can't move, end the turn
				// If the piece can't drop anymore, get rid of the dropping interval, 
				// and try to spawn a new piece
				clearInterval(this.pieceDropInterval);
				this.pieceDropInterval = null;
				this.spawnNewPiece();
			} 		
	}
};

_p.leftTheActivePiece = function() {
	if ( this.b1_col < this.b2_col ) { // If Block 1 is left of Block 2
			if ( this.canBlockOneLeft() ) {
				this.leftBlockOne();
				this.leftBlockTwo();
			}			
	}
	else if( this.b2_col < this.b1_col ) { // If Block 2 is left of Block 1
			if ( this.canBlockTwoLeft() ) {
				this.leftBlockTwo();
				this.leftBlockOne();
			}			
	}
	else if ( this.b1_col == this.b2_col ) { // If both blocks are vertical
			if ( this.canBlockOneLeft() && this.canBlockTwoLeft() ) {
				this.leftBlockOne();
				this.leftBlockTwo();
			}			
	}
};

_p.rightTheActivePiece = function() {
	if ( this.b1_col < this.b2_col ) { // If Block 2 is right of Block 1
			if ( this.canBlockTwoRight() ) {				
				this.rightBlockTwo();
				this.rightBlockOne();
			}			
	}
	else if( this.b2_col < this.b1_col ) { // If Block 1 is right of Block 2
			if ( this.canBlockOneRight() ) {				
				this.rightBlockOne();
				this.rightBlockTwo();
			}			
	}
	else if ( this.b1_col == this.b2_col ) { // If both blocks are vertical
			if ( this.canBlockOneRight() && this.canBlockTwoRight() ) {
				this.rightBlockOne();
				this.rightBlockTwo();
			}			
	}
};

/**
 * These are called by dropTheActivePiece() They are "dumb" functions
 *  meaning that they only know how to move the block but they do no
 *  error or bounds checking to make sure they can.
 */

 /* Mechanical Functions */
_p.dropBlockOne = function() {
	// Drop Block One
	this.gridArray[this.b1_row+1][this.b1_col] = this.activeBlockOne;
	this.gridArray[this.b1_row][this.b1_col] = 0;
	this.b1_row = this.b1_row+1;
};
_p.dropBlockTwo = function() {
	// Drop Block Two
	this.gridArray[this.b2_row+1][this.b2_col] = this.activeBlockTwo;
	this.gridArray[this.b2_row][this.b2_col] = 0;
	this.b2_row = this.b2_row+1;
};
_p.leftBlockOne = function() {
	// Move Block One to the Left
	this.gridArray[this.b1_row][this.b1_col-1] = this.activeBlockOne;
	this.gridArray[this.b1_row][this.b1_col] = 0;
	this.b1_col = this.b1_col-1;
};
_p.leftBlockTwo = function() {
	// Move Block Two to the Left
	this.gridArray[this.b2_row][this.b2_col-1] = this.activeBlockTwo;
	this.gridArray[this.b2_row][this.b2_col] = 0;
	this.b2_col = this.b2_col-1;
};
_p.rightBlockOne = function() {
	// Move Block One to the Right
	this.gridArray[this.b1_row][this.b1_col+1] = this.activeBlockOne;
	this.gridArray[this.b1_row][this.b1_col] = 0;
	this.b1_col = this.b1_col+1;
};
_p.rightBlockTwo = function() {
	// Move Block Two to the Right
	this.gridArray[this.b2_row][this.b2_col+1] = this.activeBlockTwo;
	this.gridArray[this.b2_row][this.b2_col] = 0;
	this.b2_col = this.b2_col+1;
};
_p.swapTheTwoBlocks = function() {

};

/* Reconnesance Functions */
_p.canBlockOneDrop = function() {
	if ( (this.b1_row+1 < LevelOne.NUMROWS) &&
		 (this.gridArray[this.b1_row+1][this.b1_col] == 0) ) {
		return true;
	}
	else {
		return false;
	}
};
_p.canBlockTwoDrop = function() {
	if ( (this.b2_row+1 < LevelOne.NUMROWS) &&
		 (this.gridArray[this.b2_row+1][this.b2_col] == 0) ) {
		return true;
	}
	else {
		return false;
	}
};
_p.canBlockOneLeft = function() {
	if( (this.b1_col-1 >= 0) && (this.gridArray[this.b1_row][this.b1_col-1] == 0) ) {
		console.log("B1 Can move left: " + this.gridArray[this.b1_row][this.b1_col-1]);
		return true;
	}
	else {
		return false;
	}
	
};
_p.canBlockTwoLeft = function() {
	if( (this.b2_col-1 >= 0) && (this.gridArray[this.b2_row][this.b2_col-1] == 0) ) {
		return true;
	}
	else {
		return false;
	}
};
_p.canBlockOneRight = function() {
	if( (this.b1_col+1 < LevelOne.NUMCOLS) && (this.gridArray[this.b1_row][this.b1_col+1] == 0) ) {
		return true;
	}
	else {
		return false;
	}
};
_p.canBlockTwoRight = function() {
	if( (this.b2_col+1 < LevelOne.NUMCOLS) && (this.gridArray[this.b2_row][this.b2_col+1] == 0) ) {
		return true;
	}
	else {
		return false;
	}
};





















/**		
 *	This is the ResizeMainCanvas method		
 **/
_p.setViewportSize = function(canvasWidth, canvasHeight) {
	this.pieceWidth = Math.floor( (canvasWidth / 7) );
	this.pieceHeight = Math.floor( (canvasHeight / 13) );
};












/*
		THE LOOP
*/

/**
 * Game.js calls this
 */
_p.draw = function(ctx) {
 	// Draw each element on the grid the appropriate color
 	for (var i=2; i<LevelOne.NUMROWS; i++) {		
		for (var j=0; j<LevelOne.NUMCOLS; j++) {	
			if ( this.gridArray[i][j] != 0 ) { // If there is a block object there
				switch(this.gridArray[i][j].getColor()) { // Which color is it
					case 0:
						break;
					case 1: 
						ctx.fillStyle = "blue";
						ctx.fillRect(j*this.pieceWidth, (i-2)*this.pieceHeight, this.pieceWidth, this.pieceHeight);
						break;
					case 2: 
						ctx.fillStyle = "red";
						ctx.fillRect(j*this.pieceWidth, (i-2)*this.pieceHeight, this.pieceWidth, this.pieceHeight);
						break;
					case 3: 
						ctx.fillStyle = "green";
						ctx.fillRect(j*this.pieceWidth, (i-2)*this.pieceHeight, this.pieceWidth, this.pieceHeight);
						break;
					case 4: 
						ctx.fillStyle = "yellow";
						ctx.fillRect(j*this.pieceWidth, (i-2)*this.pieceHeight, this.pieceWidth, this.pieceHeight);
						break;
				}// end switch
			}// end if there is a block at [i][j]
		}// end inner for loop
	}// end outer for loop
};

/**
 * Game.js calls this
 */
_p.updateLogic = function() {
	
};









