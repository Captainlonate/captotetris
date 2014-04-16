
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
	this.droppableBlockInterval;
	this.acceptInputs = false;	
	// The color of the blocks that is next to drop
	this.nextBlockOne = new Block(false);
	this.nextBlockTwo = new Block(false);
}




_p = LevelOne.prototype;

					/* CONSTANTS */
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







/* Decision Making Functions */
/** 
* This is the callback function for the pieceDropInterval. 
* ALTERNATIVELY, this function can be manually called to drop the active piece. 
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
				this.endTheTurn();
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
				this.endTheTurn();				
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
				this.endTheTurn();				
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

_p.rotateCWTheActivePiece = function() {
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
				// Move the pivot block, left one cell
				this.leftBlockTwo();
				// Move the other block, down to the location of the pivot block.
				this.dropBlockOne();				
			}
			// otherwise, just swap the position of the two blocks
			else {
				this.swapTheTwoBlocks();
			}
		
	}
	// If the other block is to the right of the pivot
	else if( (this.b1_col == (this.b2_col+1)) && (this.b1_row == this.b2_row) ) {
			// See if the cell below the pivot block is empty
			if ( (this.b2_row+1 < LevelOne.NUMROWS) && (this.gridArray[this.b2_row+1][this.b2_col] == 0) ) {
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
				// Move the pivot up one cell
				this.upBlockTwo();
				// Move the other block left one cell
				this.leftBlockOne();
			}
			// otherwise, just swap the position of the two blocks
			else {
				this.swapTheTwoBlocks();
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
				// Pivot block right one cell
				this.rightBlockTwo();
				// Other block up one cell
				this.upBlockOne();
			}
			// otherwise, just swap the position of the two blocks
			else {
				this.swapTheTwoBlocks();
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
				// Pivot down one cell
				this.dropBlockTwo();
				// Other right one cell
				this.rightBlockOne();
			}
			// otherwise, just swap the position of the two blocks
			else {
				this.swapTheTwoBlocks();
			}
	}
};

_p.rotateCCWTheActivePiece = function() {
	// If the other block is above the pivot ( default starting position )
	if ( (this.b1_row == (this.b2_row-1)) && (this.b1_col == this.b2_col) ) {
			// See if the cell to the Left of the pivot block is empty
			if ( (this.gridArray[this.b2_row][this.b2_col-1] == 0)  ) {
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
				// Move the pivot block, right one cell
				this.rightBlockTwo();
				// Move the other block, down to the location of the pivot block.
				this.dropBlockOne();				
			}
			// otherwise, just swap the position of the two blocks
			else {
				this.swapTheTwoBlocks();
			}
		
	}
	// If the other block is to the right of the pivot
	else if( (this.b1_col == (this.b2_col+1)) && (this.b1_row == this.b2_row) ) {
			// See if the cell above the pivot block is empty
			if ( this.gridArray[this.b2_row-1][this.b2_col] == 0 ) {
				// Move the other block (to) above the pivot
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
				// Move the pivot down one cell
				this.dropBlockTwo();
				// Move the other block left one cell
				this.leftBlockOne();
			}
			// otherwise, just swap the position of the two blocks
			else {
				this.swapTheTwoBlocks();
			}
	}
	// If the other block is below the pivot
	else if( (this.b1_row == (this.b2_row+1)) && (this.b1_col == this.b2_col) ) {
			// See if the cell to the right of the pivot block is empty
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
			// If not, is the cell to the left of the pivot empty?
			else if( this.gridArray[this.b2_row][this.b2_col-1] == 0 ) {
				// Pivot block left one cell
				this.leftBlockTwo();
				// Other block up one cell
				this.upBlockOne();
			}
			// otherwise, just swap the position of the two blocks
			else {
				this.swapTheTwoBlocks();
			}
	}
	// If the other block is to the left of the pivot
	else if( (this.b1_col == (this.b2_col-1)) && (this.b1_row == this.b2_row) ) {
			// See if the cell below the pivot block is empty
			if ( (this.b2_row+1 < LevelOne.NUMROWS) && (this.gridArray[this.b2_row+1][this.b2_col] == 0) ) {
				// Move the other block (to) below of the pivot
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
				// Pivot up one cell
				this.upBlockTwo();
				// Other right one cell
				this.rightBlockOne();
			}
			// otherwise, just swap the position of the two blocks
			else {
				this.swapTheTwoBlocks();
			}
	}
};

/**
	The end of the line for a falling piece
	Once a piece falls, I check if anything should break
	and then fall again correspondingly before spawning
	a new piece.
**/
_p.endTheTurn = function() {
	clearInterval(this.pieceDropInterval);
	this.pieceDropInterval = null;
	this.acceptInputs = false;
	// Make the hanging blocks fall
	this.handleBreaksAndDropsAfterTurn();
	this.spawnNewPiece();
};

/**
*	Function that runs a do-while loop over and over.
	Loop makes everything drop, then everything break, then drop, then break.
	Only stops running when nothing fell AND nothing broke
*/
_p.handleBreaksAndDropsAfterTurn = function() {
	var shouldCheckDroppableBlocks = true;
	var shouldCheckBreaks = true;
	do {
	   shouldCheckDroppableBlocks = this.makeDroppableBlocksDrop();
	   shouldCheckBreaks = this.checkAndHandleBreaks();
	} while ((shouldCheckDroppableBlocks==true) || (shouldCheckBreaks==true));
};


/** 
	Function that goes through the entire grid and makes everything 
	that can drop, drop by 1 block.
*/
_p.makeDroppableBlocksDrop = function() {
	var droppedCounter = 0;
	for (var i=2; i<LevelOne.NUMROWS; i++) {		
		for (var j=0; j<LevelOne.NUMCOLS; j++) {	
			// If there is something at this spot
			if ( this.gridArray[i][j] != 0 ) {
				// If this thing that we found can drop one cell
				if ( (i+1 < LevelOne.NUMROWS) && (this.gridArray[i+1][j] == 0) ) {
					this.gridArray[i+1][j] = this.gridArray[i][j];
					this.gridArray[i][j] = 0;
					droppedCounter++;
				}
			}			
		}
	}
	// Returns false if nothing dropped
	// Returns true if this should be ran again
	if ( droppedCounter == 0) { // Nothing to drop	
		return false;
	}
	else { // Something dropped, check again
		return true;
	}
};
 		










/**
	Function that checks each cell to determine if it's a breaker.
	When it finds a breaker, it calls breakBlocks() on it, which will
	build an array of all the connected pieces of the same color as the breaker.
	When the array is built, checkAndHandleBreaks() will remove the elements.
	Returns True if something was removed "broken"
	Returns False if nothign was
*/
_p.checkAndHandleBreaks = function() {
	var didSomethingBreak = false;
	for (var i=2; i<LevelOne.NUMROWS; i++) {		
		for (var j=0; j<LevelOne.NUMCOLS; j++) {	
			// If there is a block at this spot which is a breaker
			if ( (this.gridArray[i][j] != 0) && (this.gridArray[i][j].getBreakerStatus() == true) ) {	
				// Get an array of elements which should be removed
				var completedFlagArray = this.breakBlocks( this.gridArray[i][j].getColor(), i, j, new Array() );
				if(completedFlagArray.length > 0) {didSomethingBreak = true;}
				// For each element, remove it from the grid
				for (var count=0; count<completedFlagArray.length; count++) {
					this.gridArray[completedFlagArray[count].row][completedFlagArray[count].col] = 0;
				}												
			}			
		}
	}
	return didSomethingBreak;
};
 		
/**
	Returns true if -thing is in -theArray
	-thing should look like {row: 3, col: 2}
*/
_p.isThingInArray = function(thing, theArray) {
	for(var c=0; c<theArray.length; c++) {
		if(theArray[c].row == thing.row) {
			if(theArray[c].col == thing.col) {
				return true;
			}
		}
	}
	return false;
};

/**
	Function that will build and return an array of all the connected pieces 
	of the same color as the breaker.
**/
_p.breakBlocks = function(color, curPosRow, curPosCol, flag) {
	// Check above
	if( (curPosRow-1 >= 2) && (this.gridArray[curPosRow-1][curPosCol] != 0) ) { 
		if(this.gridArray[curPosRow-1][curPosCol].getColor() == color) {
			var rowAbove = curPosRow-1;
			if ( this.isThingInArray({row:rowAbove, col:curPosCol}, flag) == false ) {
				// Push the above block to the array
				flag.push({row: rowAbove, col: curPosCol});
				this.breakBlocks(color, rowAbove, curPosCol, flag);
			}
			if ( this.isThingInArray({row:curPosRow, col:curPosCol}, flag) == false ) {
				// Push the current block to the array
				flag.push({row: curPosRow, col: curPosCol});
			}
		}
	}
	// Check left
	if( (curPosCol-1 >= 0) && (this.gridArray[curPosRow][curPosCol-1]) ) {
		if(this.gridArray[curPosRow][curPosCol-1].getColor() == color) {
			// The col of the cell to the left
			var colLeft = curPosCol-1;
			if ( this.isThingInArray({row:curPosRow, col:colLeft}, flag) == false ) {
				// Push the left block to the array
				flag.push({row: curPosRow, col: colLeft});
				this.breakBlocks(color, curPosRow, colLeft, flag);
			}
			if ( this.isThingInArray({row:curPosRow, col:curPosCol}, flag) == false ) {
				// Push the current block to the array
				flag.push({row: curPosRow, col: curPosCol});
			}
		}
	}
	// Check right
	if( (curPosCol+1 < LevelOne.NUMCOLS) && (this.gridArray[curPosRow][curPosCol+1]) ) {
		if(this.gridArray[curPosRow][curPosCol+1].getColor() == color) {
			var colRight = curPosCol+1;
			if ( this.isThingInArray({row:curPosRow, col:colRight}, flag) == false ) {
				// Push the right block to the array
				flag.push({row: curPosRow, col: colRight});
				this.breakBlocks(color, curPosRow, colRight, flag);
			}
			// If the current block isn't already in the array, add it
			if ( this.isThingInArray({row:curPosRow, col:curPosCol}, flag) == false ) {
				// Push the current block to the array
				flag.push({row: curPosRow, col: curPosCol});
			}
		}
	}
	// Check below
	if( (curPosRow+1 < LevelOne.NUMROWS) && (this.gridArray[curPosRow+1][curPosCol]) ) {
		if(this.gridArray[curPosRow+1][curPosCol].getColor() == color) {
			var rowBelow = curPosRow+1;
			if ( this.isThingInArray({row:rowBelow, col:curPosCol}, flag) == false ) {
				// Push the block below, to the array
				flag.push({row: rowBelow, col: curPosCol});
				this.breakBlocks(color, rowBelow, curPosCol, flag);
			}
			// If the current block isn't already in the array, add it
			if ( this.isThingInArray({row:curPosRow, col:curPosCol}, flag) == false ) {
				// Push the current block to the array
				flag.push({row: curPosRow, col: curPosCol});
			}				
		}
	}
	
	// return array
	return flag;
};

 													/* Mechanical Functions */
_p.dropBlockOne = function() { // Drop Block One	
	this.gridArray[this.b1_row+1][this.b1_col] = this.activeBlockOne;
	this.gridArray[this.b1_row][this.b1_col] = 0;
	this.b1_row = this.b1_row+1;
};
_p.dropBlockTwo = function() { // Drop Block Two	
	this.gridArray[this.b2_row+1][this.b2_col] = this.activeBlockTwo;
	this.gridArray[this.b2_row][this.b2_col] = 0;
	this.b2_row = this.b2_row+1;
};
_p.upBlockOne = function() { // Move Block One Up
	this.gridArray[this.b1_row-1][this.b1_col] = this.activeBlockOne;
	this.gridArray[this.b1_row][this.b1_col] = 0;
	this.b1_row = this.b1_row-1;
};
_p.upBlockTwo = function() { // Move Block Two Up
	this.gridArray[this.b2_row-1][this.b2_col] = this.activeBlockTwo;
	this.gridArray[this.b2_row][this.b2_col] = 0;
	this.b2_row = this.b2_row-1;
};
_p.leftBlockOne = function() { // Move Block One to the Left	
	this.gridArray[this.b1_row][this.b1_col-1] = this.activeBlockOne;
	this.gridArray[this.b1_row][this.b1_col] = 0;
	this.b1_col = this.b1_col-1;
};
_p.leftBlockTwo = function() { // Move Block Two to the Left	
	this.gridArray[this.b2_row][this.b2_col-1] = this.activeBlockTwo;
	this.gridArray[this.b2_row][this.b2_col] = 0;
	this.b2_col = this.b2_col-1;
};
_p.rightBlockOne = function() { // Move Block One to the Right	 
	this.gridArray[this.b1_row][this.b1_col+1] = this.activeBlockOne;
	this.gridArray[this.b1_row][this.b1_col] = 0;
	this.b1_col = this.b1_col+1;
};
_p.rightBlockTwo = function() { // Move Block Two to the Right	
	this.gridArray[this.b2_row][this.b2_col+1] = this.activeBlockTwo;
	this.gridArray[this.b2_row][this.b2_col] = 0;
	this.b2_col = this.b2_col+1;
};
_p.swapTheTwoBlocks = function() { // Swap the location of the two blocks	
	this.gridArray[this.b2_row][this.b2_col] = this.activeBlockOne;
	this.gridArray[this.b1_row][this.b1_col] = this.activeBlockTwo;
	var tempRow = this.b1_row;
	var tempCol = this.b1_col;
	this.b1_row = this.b2_row;
	this.b1_col = this.b2_col;
	this.b2_row = tempRow;
	this.b2_col = tempCol;
};

													/* Reconnaissance Functions */
_p.canBlockOneDrop = function() {
	if ( (this.b1_row+1 < LevelOne.NUMROWS) &&
		 (this.gridArray[this.b1_row+1][this.b1_col] == 0) ) {
		return true;
	}
	else {	return false;	}
};
_p.canBlockTwoDrop = function() {
	if ( (this.b2_row+1 < LevelOne.NUMROWS) &&
		 (this.gridArray[this.b2_row+1][this.b2_col] == 0) ) {
		return true;
	}
	else {	return false;	}
};
_p.canBlockOneLeft = function() {
	if( (this.b1_col-1 >= 0) && (this.gridArray[this.b1_row][this.b1_col-1] == 0) ) {
		return true;
	}
	else {	return false;	}
	
};
_p.canBlockTwoLeft = function() {
	if( (this.b2_col-1 >= 0) && (this.gridArray[this.b2_row][this.b2_col-1] == 0) ) {
		return true;
	}
	else {	return false;	}
};
_p.canBlockOneRight = function() {
	if( (this.b1_col+1 < LevelOne.NUMCOLS) && (this.gridArray[this.b1_row][this.b1_col+1] == 0) ) {
		return true;
	}
	else {	return false;	}
};
_p.canBlockTwoRight = function() {
	if( (this.b2_col+1 < LevelOne.NUMCOLS) && (this.gridArray[this.b2_row][this.b2_col+1] == 0) ) {
		return true;
	}
	else {	return false;	}
};





/*
		THE CONTROLS
*/
_p.keyPressed = function(e) {	
	// Don't try to modify the block if it doesn't exist
	if ( (this.acceptInputs == true) && (this.activeBlockOne != null) && (this.activeBlockTwo != null) ) {	
		switch(e.keyCode) {
		case 87:// W
		case 38:// Up Arrow			
				this.rotateCCWTheActivePiece();		
			break;
		case 83:// S
		case 40:// D Arrow				
				this.rotateCWTheActivePiece();
			break;
		case 65:// A
		case 37:// L Arrow
				this.leftTheActivePiece();
			break;			
		case 32:// SpaceBar			
				this.dropTheActivePiece();			
			break;
		case 68:// D
		case 39:// R Arrow
				this.rightTheActivePiece();
			break;
		}
	}
};





/**
 * The entry point to the game. 
 */
_p.run = function() {
	this.spawnNewPiece();
};

/** 
 * Initializes the 2d array with all 0's.
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
	if ( this.gridArray[2][LevelOne.STARTCOL] == 0) {
		this.activeBlockOne = this.nextBlockOne;
		this.b1_row = LevelOne.STARTROW_B1;
		this.b1_col = LevelOne.STARTCOL;
		this.gridArray[LevelOne.STARTROW_B1][LevelOne.STARTCOL] = this.activeBlockOne;

		this.activeBlockTwo = this.nextBlockTwo;
		this.b2_row = LevelOne.STARTROW_B2;
		this.b2_col = LevelOne.STARTCOL;
		this.gridArray[LevelOne.STARTROW_B2][LevelOne.STARTCOL] = this.activeBlockTwo;

		// pick the colors of the next piece
		this.nextBlockOne = new Block(false);
		this.nextBlockTwo = new Block(false);

		// set the colors in the preview
		document.getElementById('topPreview').style.backgroundColor= this.numToColor(this.nextBlockOne.getColor(), 
																					 this.nextBlockOne.getBreakerStatus() );
		document.getElementById('bottomPreview').style.backgroundColor= this.numToColor(this.nextBlockTwo.getColor(), 
																						this.nextBlockTwo.getBreakerStatus() );

		this.acceptInputs = true;

		this.pieceDropInterval = setInterval(this.dropTheActivePiece.bind(this), 1000);
	}	
	else {
		console.log("It looks like the game is over?");
	}
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
				var temp = this.gridArray[i][j];
				if (temp.getBreakerStatus() == false) { // If not a breaker
					switch(temp.getColor()) { 
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
				}
				else { // If is a breaker
					switch(temp.getColor()) {
					case 0:
						break;
					case 1: // The blue breaker
						ctx.fillStyle = "#000099";
						ctx.fillRect(j*this.pieceWidth, (i-2)*this.pieceHeight, this.pieceWidth, this.pieceHeight);						
						break;
					case 2: 
						ctx.fillStyle = "#900000";
						ctx.fillRect(j*this.pieceWidth, (i-2)*this.pieceHeight, this.pieceWidth, this.pieceHeight);
						break;
					case 3: 
						ctx.fillStyle = "#003300";
						ctx.fillRect(j*this.pieceWidth, (i-2)*this.pieceHeight, this.pieceWidth, this.pieceHeight);
						break;
					case 4: 
						ctx.fillStyle = "#d8b402";
						ctx.fillRect(j*this.pieceWidth, (i-2)*this.pieceHeight, this.pieceWidth, this.pieceHeight);
						break;
					}// end switch
				}				
			}// end if there is a block at [i][j]
		}// end inner for loop
	}// end outer for loop
};


/**		
 *	This is the ResizeMainCanvas method		
 **/
_p.setViewportSize = function(canvasWidth, canvasHeight) {
	this.pieceWidth = Math.floor( (canvasWidth / 7) );
	this.pieceHeight = Math.floor( (canvasHeight / 13) );
};


/**
	Just a function to help debug stuff
*/
_p.numToColor = function(num, isABreaker) {
	
	if (isABreaker == true) {
		switch(num) {
		case 0:
			break;
		case 1: // The blue breaker
			return "#000099";								
			break;
		case 2: 
			return "#900000";			
			break;
		case 3: 
			return "#003300";			
			break;
		case 4: 
			return "#d8b402";			
			break;
		}// end switch
	}
	else {
		switch(num) { 
		case 1: 
			return "blue";			
			break;
		case 2: 
			return "red";
			break;
		case 3: 
			return "green";
			break;
		case 4: 
			return "yellow";
			break;
		}// end switch
	}

	
};