

function LevelOneSP(ctx, canvasWidth, canvasHeight, imageManager) {	


	function powerConstructor(theCTX, canvWidth, canvHeight, imgMgr) {
		var LEVELONE = {
			NUMROWS: 15,
			NUMCOLS: 7,
			STARTCOL: 3,
			STARTROW_B1: 0,
			STARTROW_B2: 1
		}
		var retObject = new Object();
		var websocket;
		var tink = new SoundPool(5);
		    tink.init("tink");	
		var success = new SoundPool(5);
		    success.init("success");	
		document.getElementById("leftButton").addEventListener("click", leftButton, false);
		document.getElementById("rightButton").addEventListener("click", rightButton, false);	
		var ctx = theCTX;    
		// The canvas's width and height - used in setViewportSize()
		var canvasWidth = canvWidth;
		var canvasHeight = canvHeight;
		// The imageManager from Game.js - used to create spriteSheets
		var imageManager = imgMgr;
		// Make and initialize the 2d array with all 0's
		var gridArray = initialize2DArray();
		// Block One stuff
		var activeBlockOne;
		var b1_row;
		var b1_col;
		var b1_x;
		var b1_y;
		// Block Two stuff
		var activeBlockTwo;
		var b2_row;
		var b2_col;
		var b2_x;
		var b2_y;
		// The interval that drops the pieces
		var pieceDropInterval;
		var droppableBlockInterval;
		var acceptInputs = false;	
		// The color of the blocks that is next to drop
		var nextBlockOne = new Block(false);
		var nextBlockTwo = new Block(false);
		//
		var arrayOfStuffToDrop = new Array();
		var alreadyDroppingStuff = false;




														
		function dropTheActivePiece() {
			if ( b1_row > b2_row ) { // If Block 1 is below Block 2
					// Will moving block 1 cause it to go out of bounds?
					// Is there a pieceDropInterval active?
					// Finally, is there a block under block 1? ( where block 1 is trying to move)
					if ( (b1_row+1 < LEVELONE.NUMROWS) &&
						 (pieceDropInterval != null) &&
						 (gridArray[b1_row+1][b1_col] == 0) ) {

						dropBlockOne();
						dropBlockTwo();
					}
					else {
						// If the piece can't drop anymore, get rid of the dropping interval, 
						// and try to spawn a new piece
						endTheTurn();
					}
			}
			else if( b2_row > b1_row ) { // If Block 2 is below Block 1
					// Will moving block 2 cause it to go out of bounds?
					// Is there a pieceDropInterval active?
					// Finally, is there a block under block 2? ( where block 2 is trying to move)
					if ( (b2_row+1 < LEVELONE.NUMROWS) &&
						 (pieceDropInterval != null) &&
						 (gridArray[b2_row+1][b2_col] == 0) ) {

						dropBlockTwo();
						dropBlockOne();
					}
					else {
						// If the piece can't drop anymore, get rid of the dropping interval, 
						// and try to spawn a new piece
						endTheTurn();				
					}
			}
			else { // If both blocks are side by side
					// Can block one move? AND Can block two move?
					if ( canBlockOneDrop() && canBlockTwoDrop() ) {
						// If both can move, then move them
						dropBlockOne();
						dropBlockTwo();
					}
					else { // else if even one of them can't move, end the turn
						// If the piece can't drop anymore, get rid of the dropping interval, 
						// and try to spawn a new piece
						endTheTurn();				
					} 		
			}
		}


		function leftTheActivePiece() {
			if ( b1_col < b2_col ) { // If Block 1 is left of Block 2
					if ( canBlockOneLeft() ) {
						leftBlockOne();
						leftBlockTwo();
					}			
			}
			else if( b2_col < b1_col ) { // If Block 2 is left of Block 1
					if ( canBlockTwoLeft() ) {
						leftBlockTwo();
						leftBlockOne();
					}			
			}
			else if ( b1_col == b2_col ) { // If both blocks are vertical
					if ( canBlockOneLeft() && canBlockTwoLeft() ) {
						leftBlockOne();
						leftBlockTwo();
					}			
			}
		}



		function rightTheActivePiece() {
			if ( b1_col < b2_col ) { // If Block 2 is right of Block 1
					if ( canBlockTwoRight() ) {				
						rightBlockTwo();
						rightBlockOne();
					}			
			}
			else if( b2_col < b1_col ) { // If Block 1 is right of Block 2
					if ( canBlockOneRight() ) {				
						rightBlockOne();
						rightBlockTwo();
					}			
			}
			else if ( b1_col == b2_col ) { // If both blocks are vertical
					if ( canBlockOneRight() && canBlockTwoRight() ) {
						rightBlockOne();
						rightBlockTwo();
					}			
			}
		}



		function rotateCWTheActivePiece() {
			// If the other block is above the pivot ( default starting position )
			if ( (b1_row == (b2_row-1)) && (b1_col == b2_col) ) {
					// See if the cell to the Right of the pivot block is empty
					if ( gridArray[b2_row][b2_col+1] == 0 ) {
						// Move the other block to the right of the pivot
						// First, move the other block ( there will end up being two )
						gridArray[b2_row][b2_col+1] = activeBlockOne;
						// Then remove the previously existing one ( so that there is 1 again )
						gridArray[b1_row][b1_col] = 0;
						// Then update the location of the other block
						b1_row = b2_row;
						b1_col = b2_col+1;
					}
					// If not, is the cell to the Left of the pivot empty?
					else if( gridArray[b2_row][b2_col-1] == 0 ) {
						// Move the pivot block, left one cell
						leftBlockTwo();
						// Move the other block, down to the location of the pivot block.
						dropBlockOne();				
					}
					// otherwise, just swap the position of the two blocks
					else {
						swapTheTwoBlocks();
					}
				
			}
			// If the other block is to the right of the pivot
			else if( (b1_col == (b2_col+1)) && (b1_row == b2_row) ) {
					// See if the cell below the pivot block is empty
					if ( (b2_row+1 < LEVELONE.NUMROWS) && (gridArray[b2_row+1][b2_col] == 0) ) {
						// Move the other block (to) below the pivot
						// First, move the other block ( there will end up being two )
						gridArray[b2_row+1][b2_col] = activeBlockOne;
						// Then remove the previously existing one ( so that there is 1 again )
						gridArray[b1_row][b1_col] = 0;
						// Then update the location of the other block
						b1_row = b2_row+1;
						b1_col = b2_col;
					}
					// If not, is the cell above the pivot empty?
					else if ( gridArray[b2_row-1][b2_col] == 0 ) {
						// Move the pivot up one cell
						upBlockTwo();
						// Move the other block left one cell
						leftBlockOne();
					}
					// otherwise, just swap the position of the two blocks
					else {
						swapTheTwoBlocks();
					}
			}
			// If the other block is below the pivot
			else if( (b1_row == (b2_row+1)) && (b1_col == b2_col) ) {
					// See if the cell to the left of the pivot block is empty
					if ( (gridArray[b2_row][b2_col-1] == 0) ) {
						// Move the other block to the left of the pivot
						// First, move the other block ( there will end up being two )
						gridArray[b2_row][b2_col-1] = activeBlockOne;
						// Then remove the previously existing one ( so that there is 1 again )
						gridArray[b1_row][b1_col] = 0;
						// Then update the location of the other block
						b1_row = b2_row;
						b1_col = b2_col-1;
					}
					// If not, is the cell to the right of the pivot empty?
					else if( gridArray[b2_row][b2_col+1] == 0 ) {
						// Pivot block right one cell
						rightBlockTwo();				
						// Other block up one cell
						upBlockOne();
					}
					// otherwise, just swap the position of the two blocks
					else {
						swapTheTwoBlocks();
					}
			}
			// If the other block is to the left of the pivot
			else if( (b1_col == (b2_col-1)) && (b1_row == b2_row) ) {
					// See if the cell above the pivot block is empty
					if ( gridArray[b2_row-1][b2_col] == 0 ) {
						// Move the other block (to) above of the pivot
						// First, move the other block ( there will end up being two )
						gridArray[b2_row-1][b2_col] = activeBlockOne;
						// Then remove the previously existing one ( so that there is 1 again )
						gridArray[b1_row][b1_col] = 0;
						// Then update the location of the other block
						b1_row = b2_row-1;
						b1_col = b2_col;
					}
					// If not, is the cell below the pivot empty?
					else if ( gridArray[b2_row+1][b2_col] == 0 ) {
						// Pivot down one cell
						dropBlockTwo();
						// Other right one cell
						rightBlockOne();
					}
					// otherwise, just swap the position of the two blocks
					else {
						swapTheTwoBlocks();
					}
			}
		}



		function rotateCCWTheActivePiece() {
			// If the other block is above the pivot ( default starting position )
			if ( (b1_row == (b2_row-1)) && (b1_col == b2_col) ) {
					// See if the cell to the Left of the pivot block is empty
					if ( (gridArray[b2_row][b2_col-1] == 0)  ) {
						// Move the other block to the left of the pivot
						// First, move the other block ( there will end up being two )
						gridArray[b2_row][b2_col-1] = activeBlockOne;
						// Then remove the previously existing one ( so that there is 1 again )
						gridArray[b1_row][b1_col] = 0;
						// Then update the location of the other block
						b1_row = b2_row;
						b1_col = b2_col-1;
					}
					// If not, is the cell to the right of the pivot empty?
					else if( gridArray[b2_row][b2_col+1] == 0 ) {
						// Move the pivot block, right one cell
						rightBlockTwo();
						// Move the other block, down to the location of the pivot block.
						dropBlockOne();				
					}
					// otherwise, just swap the position of the two blocks
					else {
						swapTheTwoBlocks();
					}
				
			}
			// If the other block is to the right of the pivot
			else if( (b1_col == (b2_col+1)) && (b1_row == b2_row) ) {
					// See if the cell above the pivot block is empty
					if ( gridArray[b2_row-1][b2_col] == 0 ) {
						// Move the other block (to) above the pivot
						// First, move the other block ( there will end up being two )
						gridArray[b2_row-1][b2_col] = activeBlockOne;
						// Then remove the previously existing one ( so that there is 1 again )
						gridArray[b1_row][b1_col] = 0;
						// Then update the location of the other block
						b1_row = b2_row-1;
						b1_col = b2_col;
					}
					// If not, is the cell below the pivot empty?
					else if ( gridArray[b2_row+1][b2_col] == 0 ) {
						// Move the pivot down one cell
						dropBlockTwo();
						// Move the other block left one cell
						leftBlockOne();
					}
					// otherwise, just swap the position of the two blocks
					else {
						swapTheTwoBlocks();
					}
			}
			// If the other block is below the pivot
			else if( (b1_row == (b2_row+1)) && (b1_col == b2_col) ) {
					// See if the cell to the right of the pivot block is empty
					if ( gridArray[b2_row][b2_col+1] == 0 ) {
						// Move the other block to the right of the pivot
						// First, move the other block ( there will end up being two )
						gridArray[b2_row][b2_col+1] = activeBlockOne;
						// Then remove the previously existing one ( so that there is 1 again )
						gridArray[b1_row][b1_col] = 0;
						// Then update the location of the other block
						b1_row = b2_row;
						b1_col = b2_col+1;
					}
					// If not, is the cell to the left of the pivot empty?
					else if( gridArray[b2_row][b2_col-1] == 0 ) {
						// Pivot block left one cell
						leftBlockTwo();
						// Other block up one cell
						upBlockOne();
					}
					// otherwise, just swap the position of the two blocks
					else {
						swapTheTwoBlocks();
					}
			}
			// If the other block is to the left of the pivot
			else if( (b1_col == (b2_col-1)) && (b1_row == b2_row) ) {
					// See if the cell below the pivot block is empty
					if ( (b2_row+1 < LEVELONE.NUMROWS) && (gridArray[b2_row+1][b2_col] == 0) ) {
						// Move the other block (to) below of the pivot
						// First, move the other block ( there will end up being two )
						gridArray[b2_row+1][b2_col] = activeBlockOne;
						// Then remove the previously existing one ( so that there is 1 again )
						gridArray[b1_row][b1_col] = 0;
						// Then update the location of the other block
						b1_row = b2_row+1;
						b1_col = b2_col;
					}
					// If not, is the cell above the pivot empty?
					else if ( gridArray[b2_row-1][b2_col] == 0 ) {
						// Pivot up one cell
						upBlockTwo();
						// Other right one cell
						rightBlockOne();
					}
					// otherwise, just swap the position of the two blocks
					else {
						swapTheTwoBlocks();
					}
			}
		}

		/**
			The end of the line for a falling piece
			Once a piece falls, I check if anything should break
			and then fall again correspondingly before spawning
			a new piece.
		**/
		function endTheTurn() {
			tink.get();
			//pieceIsFalling = false;
			clearInterval(pieceDropInterval);
			pieceDropInterval = null;
			acceptInputs = false;
			// Make the hanging blocks fall
			handleBreaksAndDropsAfterTurn();
			//spawnNewPiece();
		}

		/**
		*	Function that runs a do-while loop over and over.
			Loop makes everything drop, then everything break, then drop, then break.
			Only stops running when nothing fell AND nothing broke
		*/
		function handleBreaksAndDropsAfterTurn() {
			// Setting these to true in case stuff is dropping and it's never set at all
			var isThereStuffToDrop = true;
			var shouldCheckBreaks = true;

			if ( alreadyDroppingStuff == false ) { // If nothing is currently dropping
				// If it return true, there is stuff in the array
				isThereStuffToDrop = makeDroppableBlocksDrop(); // Drop
				if (isThereStuffToDrop == true) {
					alreadyDroppingStuff = true;
					droppableBlockInterval = setInterval(dropBlocks, 100); 
				}
			}
			
			// Not an accident that I have the same check twice
			if ( alreadyDroppingStuff == false ) { // If nothing is currently dropping
				shouldCheckBreaks = checkAndHandleBreaks(); // Break
				if ( shouldCheckBreaks == true) {
					alreadyDroppingStuff = true;
					droppableBlockInterval = setInterval(dropBlocks, 100); 
				}
			}
			
			if ((isThereStuffToDrop == false) && (shouldCheckBreaks == false) ) {
				spawnNewPiece();
			}
		   
		}


		function dropBlocks() {
			var didAnythingDrop = false;

			for (var j=0; j<arrayOfStuffToDrop.length; j++) {
				// Can it move anymore?
					// If so, move it down x amount
					// and make sure didAnythingDrop = true	
					if ( (arrayOfStuffToDrop[j].row+1 < LEVELONE.NUMROWS) && (gridArray[arrayOfStuffToDrop[j].row+1][arrayOfStuffToDrop[j].col] == 0) ) {
						gridArray[arrayOfStuffToDrop[j].row+1][arrayOfStuffToDrop[j].col] = gridArray[arrayOfStuffToDrop[j].row][arrayOfStuffToDrop[j].col];
						gridArray[arrayOfStuffToDrop[j].row][arrayOfStuffToDrop[j].col] = 0;	
						arrayOfStuffToDrop[j].row = arrayOfStuffToDrop[j].row+1;
						// 
						didAnythingDrop = true;
					}						
			}

			// If done dropping everything, then set the flag to not dropping anymore
			if ( didAnythingDrop == false ) {
				clearInterval(droppableBlockInterval);
				droppableBlockInterval = null;
				alreadyDroppingStuff = false;
				// This is going to get me in trouble
				handleBreaksAndDropsAfterTurn();
			}
			
		}



		/** 
			Function that goes through the entire grid and makes everything 
			that can drop, drop by 1 block.
		*/
		function makeDroppableBlocksDrop() {
			var droppedCounter = 0;
			// Build an array of blocks that need to fall ( at the same time )
			for (var i=2; i<LEVELONE.NUMROWS; i++) {		
				for (var j=0; j<LEVELONE.NUMCOLS; j++) {	
					// If there is something at this spot
					if ( gridArray[i][j] != 0 ) {
						// If this thing that we found can drop one cell
						if ( (i+1 < LEVELONE.NUMROWS) && (gridArray[i+1][j] == 0) ) {
							arrayOfStuffToDrop.push({row: i,col: j});
							droppedCounter++;
						}
					}			
				}
			}
			// Returns false if nothing dropped
			// Returns true if this should be ran again
			if ( droppedCounter == 0 ) { // Nothing to drop	
				arrayOfStuffToDrop = new Array();
				return false;
			}
			else { // There is stuff to drop
				return true;
			}
		}
		 		










		/**
			Function that checks each cell to determine if it's a breaker.
			When it finds a breaker, it calls breakBlocks() on it, which will
			build an array of all the connected pieces of the same color as the breaker.
			When the array is built, checkAndHandleBreaks() will remove the elements.
			Returns True if something was removed "broken"
			Returns False if nothign was
		*/
		function checkAndHandleBreaks() {
			var didSomethingBreak = false;
			for (var i=2; i<LEVELONE.NUMROWS; i++) {		
				for (var j=0; j<LEVELONE.NUMCOLS; j++) {	
					// If there is a block at this spot which is a breaker
					if ( (gridArray[i][j] != 0) && (gridArray[i][j].getBreakerStatus() == true) ) {	
						// Get an array of elements which should be removed
						var completedFlagArray = breakBlocks( gridArray[i][j].getColor(), i, j, new Array() );
						if(completedFlagArray.length > 0) {didSomethingBreak = true; success.get();}
						// For each element, remove it from the grid
						for (var count=0; count<completedFlagArray.length; count++) {
							gridArray[completedFlagArray[count].row][completedFlagArray[count].col] = 0;
						}												
					}			
				}
			}
			return didSomethingBreak;
		}
		 		
		/**
			Returns true if -thing is in -theArray
			-thing should look like {row: 3, col: 2}
		*/
		function isThingInArray(thing, theArray) {
			for(var c=0; c<theArray.length; c++) {
				if(theArray[c].row == thing.row) {
					if(theArray[c].col == thing.col) {
						return true;
					}
				}
			}
			return false;
		}

		/**
			Function that will build and return an array of all the connected pieces 
			of the same color as the breaker.
		**/
		function breakBlocks(color, curPosRow, curPosCol, flag) {
			// Check above
			if( (curPosRow-1 >= 2) && (gridArray[curPosRow-1][curPosCol] != 0) ) { 
				if(gridArray[curPosRow-1][curPosCol].getColor() == color) {
					var rowAbove = curPosRow-1;
					if ( isThingInArray({row:rowAbove, col:curPosCol}, flag) == false ) {
						// Push the above block to the array
						flag.push({row: rowAbove, col: curPosCol});
						breakBlocks(color, rowAbove, curPosCol, flag);
					}
					if ( isThingInArray({row:curPosRow, col:curPosCol}, flag) == false ) {
						// Push the current block to the array
						flag.push({row: curPosRow, col: curPosCol});
					}
				}
			}
			// Check left
			if( (curPosCol-1 >= 0) && (gridArray[curPosRow][curPosCol-1]) ) {
				if(gridArray[curPosRow][curPosCol-1].getColor() == color) {
					// The col of the cell to the left
					var colLeft = curPosCol-1;
					if ( isThingInArray({row:curPosRow, col:colLeft}, flag) == false ) {
						// Push the left block to the array
						flag.push({row: curPosRow, col: colLeft});
						breakBlocks(color, curPosRow, colLeft, flag);
					}
					if ( isThingInArray({row:curPosRow, col:curPosCol}, flag) == false ) {
						// Push the current block to the array
						flag.push({row: curPosRow, col: curPosCol});
					}
				}
			}
			// Check right
			if( (curPosCol+1 < LEVELONE.NUMCOLS) && (gridArray[curPosRow][curPosCol+1]) ) {
				if(gridArray[curPosRow][curPosCol+1].getColor() == color) {
					var colRight = curPosCol+1;
					if ( isThingInArray({row:curPosRow, col:colRight}, flag) == false ) {
						// Push the right block to the array
						flag.push({row: curPosRow, col: colRight});
						breakBlocks(color, curPosRow, colRight, flag);
					}
					// If the current block isn't already in the array, add it
					if ( isThingInArray({row:curPosRow, col:curPosCol}, flag) == false ) {
						// Push the current block to the array
						flag.push({row: curPosRow, col: curPosCol});
					}
				}
			}
			// Check below
			if( (curPosRow+1 < LEVELONE.NUMROWS) && (gridArray[curPosRow+1][curPosCol]) ) {
				if(gridArray[curPosRow+1][curPosCol].getColor() == color) {
					var rowBelow = curPosRow+1;
					if ( isThingInArray({row:rowBelow, col:curPosCol}, flag) == false ) {
						// Push the block below, to the array
						flag.push({row: rowBelow, col: curPosCol});
						breakBlocks(color, rowBelow, curPosCol, flag);
					}
					// If the current block isn't already in the array, add it
					if ( isThingInArray({row:curPosRow, col:curPosCol}, flag) == false ) {
						// Push the current block to the array
						flag.push({row: curPosRow, col: curPosCol});
					}				
				}
			}
			
			// return array
			return flag;
		}

		 													/* Mechanical Functions */
		function dropBlockOne() { // Drop Block One	
			gridArray[b1_row+1][b1_col] = activeBlockOne;
			gridArray[b1_row][b1_col] = 0;
			b1_row = b1_row+1;
		}
		function dropBlockTwo() { // Drop Block Two	
			gridArray[b2_row+1][b2_col] = activeBlockTwo;
			gridArray[b2_row][b2_col] = 0;
			b2_row = b2_row+1;
		}
		function upBlockOne() { // Move Block One Up
			gridArray[b1_row-1][b1_col] = activeBlockOne;
			gridArray[b1_row][b1_col] = 0;
			b1_row = b1_row-1;
		}
		function upBlockTwo() { // Move Block Two Up
			gridArray[b2_row-1][b2_col] = activeBlockTwo;
			gridArray[b2_row][b2_col] = 0;
			b2_row = b2_row-1;
		}
		function leftBlockOne() { // Move Block One to the Left	
			gridArray[b1_row][b1_col-1] = activeBlockOne;
			gridArray[b1_row][b1_col] = 0;
			b1_col = b1_col-1;
		}
		function leftBlockTwo() { // Move Block Two to the Left	
			gridArray[b2_row][b2_col-1] = activeBlockTwo;
			gridArray[b2_row][b2_col] = 0;
			b2_col = b2_col-1;
		}
		function rightBlockOne() { // Move Block One to the Right	 
			gridArray[b1_row][b1_col+1] = activeBlockOne;
			gridArray[b1_row][b1_col] = 0;
			b1_col = b1_col+1;
		}
		function rightBlockTwo() { // Move Block Two to the Right	
			gridArray[b2_row][b2_col+1] = activeBlockTwo;
			gridArray[b2_row][b2_col] = 0;
			b2_col = b2_col+1;
		}
		function swapTheTwoBlocks() { // Swap the location of the two blocks	
			gridArray[b2_row][b2_col] = activeBlockOne;
			gridArray[b1_row][b1_col] = activeBlockTwo;
			var tempRow = b1_row;
			var tempCol = b1_col;
			b1_row = b2_row;
			b1_col = b2_col;
			b2_row = tempRow;
			b2_col = tempCol;
		}

															/* Reconnaissance Functions */
		function canBlockOneDrop() {
			if ( (b1_row+1 < LEVELONE.NUMROWS) &&
				 (gridArray[b1_row+1][b1_col] == 0) ) {
				return true;
			}
			else {	return false;	}
		}
		function canBlockTwoDrop() {
			if ( (b2_row+1 < LEVELONE.NUMROWS) &&
				 (gridArray[b2_row+1][b2_col] == 0) ) {
				return true;
			}
			else {	return false;	}
		}
		function canBlockOneLeft() {
			if( (b1_col-1 >= 0) && (gridArray[b1_row][b1_col-1] == 0) ) {
				return true;
			}
			else {	return false;	}
			
		}
		function canBlockTwoLeft() {
			if( (b2_col-1 >= 0) && (gridArray[b2_row][b2_col-1] == 0) ) {
				return true;
			}
			else {	return false;	}
		}
		function canBlockOneRight() {
			if( (b1_col+1 < LEVELONE.NUMCOLS) && (gridArray[b1_row][b1_col+1] == 0) ) {
				return true;
			}
			else {	return false;	}
		}
		function canBlockTwoRight() {
			if( (b2_col+1 < LEVELONE.NUMCOLS) && (gridArray[b2_row][b2_col+1] == 0) ) {
				return true;
			}
			else {	return false;	}
		}





		/*
				THE CONTROLS
		*/
		retObject.keyPressed = function(e) {	
			// Don't try to modify the block if it doesn't exist
			if ( (acceptInputs == true) && (activeBlockOne != null) && (activeBlockTwo != null) ) {	
				switch(e.keyCode) {
				case 87:// W
				case 38:// Up Arrow			
						rotateCCWTheActivePiece();		
					break;
				case 83:// S
				case 40:// D Arrow				
						rotateCWTheActivePiece();
					break;
				case 65:// A
				case 37:// L Arrow
						leftTheActivePiece();
					break;			
				case 32:// SpaceBar			
						dropTheActivePiece();			
					break;
				case 68:// D
				case 39:// R Arrow
						rightTheActivePiece();
					break;
				}
			}
		}

		function leftButton() {
			if ( (acceptInputs == true) && (activeBlockOne != null) && (activeBlockTwo != null) ) {
				leftTheActivePiece();
			}	
		}

		function rightButton() {
			if ( (acceptInputs == true) && (activeBlockOne != null) && (activeBlockTwo != null) ) {
				rightTheActivePiece();
			}	
		}


		/**
		 * The entry point to the game. 
		 */
		retObject.run = function() {
			spawnNewPiece();
			// var self = this;
			// retObject.onEstablishCallBack = function(connection) {	
			// 	console.log("Connection Established");		
			// 	self.websocket = connection;
			// 	// Let the server know that we are ready to begin when they are
			// 	var intendedGSID = self.getCookie("GameSession");
			// 	var oldPID;
			// 	// If the window has a hash
			// 	if(window.location.hash) {
			// 		// extract the users pid
			// 	  	oldPID = window.location.hash.split('#')[1];
			// 	  	// empty out the hash
			// 	  	window.location.hash = "";
			// 	} else {
			// 		// This should never hit, but just in case
			// 	  	console.log("Hash doesn't exist?");
			// 	}
			// 	var jsonMsg = JSON.stringify( {category: "Ready", sessionID: intendedGSID, pid: oldPID} );
			// 	self.websocket.send(jsonMsg);		
			// };
			// retObject.onReceiveMsgCallBack = function(message) {	
			// 	var parsed = JSON.parse(message.data);
			// 	var category = parsed.category;
			// 	var mesg = parsed.msg;
			// 	if (category == "Begin") {
			// 		console.log("Was told to start the game.");
			// 		//self.startTheGame();
			// 	}
				
			// };
			// new WebsocketConnection(retObject.onEstablishCallBack, retObject.onReceiveMsgCallBack);
		}

		function startTheGame() {
			spawnNewPiece();
		}

		function getCookie(cname) {
			var name = cname + "=";
			var ca = document.cookie.split(';');
			for(var i=0; i<ca.length; i++) {
				var c = ca[i].trim();
				if (c.indexOf(name)==0) return c.substring(name.length,c.length);
			}
			return "";
		}


		/** 
		 * Initializes the 2d array with all 0's.
		 */
		function initialize2DArray() {
			var board = [];
			for (var i=0; i<LEVELONE.NUMROWS; i++) {
				board[i] = [];
				for (var j=0; j<LEVELONE.NUMCOLS; j++) {
					board[i][j] = 0;
				}
			} 
			return board;
		}







		/**
		 * Make a new Piece starting at the top of the grid 
		 *  ( outside the bounds where you can't see )
		 *  A piece consists of Block 1 and Block 2
		 */
		function spawnNewPiece() {
			// Make sure that the initial spawn point is empty
			if ( gridArray[2][LEVELONE.STARTCOL] == 0) {
				activeBlockOne = nextBlockOne;
				b1_row = LEVELONE.STARTROW_B1;
				b1_col = LEVELONE.STARTCOL;
				gridArray[LEVELONE.STARTROW_B1][LEVELONE.STARTCOL] = activeBlockOne;

				activeBlockTwo = nextBlockTwo;
				b2_row = LEVELONE.STARTROW_B2;
				b2_col = LEVELONE.STARTCOL;
				gridArray[LEVELONE.STARTROW_B2][LEVELONE.STARTCOL] = activeBlockTwo;

				// pick the colors of the next piece
				nextBlockOne = new Block(false);
				nextBlockTwo = new Block(false);

				// set the images in the preview
				var topName = "../img/" + imageManager.get( numToImageName(nextBlockOne.getColor(), nextBlockOne.getBreakerStatus()) ).src.split("/")[4];
				document.getElementById('topPreview').style.backgroundImage = "url("+topName+")";
				var bottomName = "../img/" + imageManager.get( numToImageName(nextBlockTwo.getColor(), nextBlockTwo.getBreakerStatus()) ).src.split("/")[4];
				document.getElementById('bottomPreview').style.backgroundImage = "url("+bottomName+")";

				acceptInputs = true;

				pieceDropInterval = setInterval(dropTheActivePiece, 1000); 
			}	
			else {
				console.log("It looks like the game is over?");
			}
		}









		/*
				THE LOOP
		*/

		/**
		 * Game.js calls this
		 */
		retObject.draw = function(ctx) {
		 	// Draw each element on the grid the appropriate color
		 	for (var i=2; i<LEVELONE.NUMROWS; i++) {		
				for (var j=0; j<LEVELONE.NUMCOLS; j++) {				
					if ( gridArray[i][j] != 0 ) { // If there is a block object there
						var temp = gridArray[i][j];
						if (temp.getBreakerStatus() == false) { // If not a breaker
							switch(temp.getColor()) { 
							case 0:
								break;
							case 1: 
								ctx.drawImage(imageManager.get("BlueBlock"), 0, 0, 120, 120, 
																			j*pieceWidth, (i-2)*pieceHeight, pieceWidth, pieceHeight);						
								break;
							case 2: 
								ctx.drawImage(imageManager.get("RedBlock"), 0, 0, 180, 180, 
																			j*pieceWidth, (i-2)*pieceHeight, pieceWidth, pieceHeight);
								break;
							case 3: 
								ctx.drawImage(imageManager.get("GreenBlock"), 0, 0, 120, 120, 
																			j*pieceWidth, (i-2)*pieceHeight, pieceWidth, pieceHeight);
								break;
							case 4: 
								ctx.drawImage(imageManager.get("YellowBlock"), 0, 0, 120, 120, 
																			j*pieceWidth, (i-2)*pieceHeight, pieceWidth, pieceHeight);
								break;
							}// end switch
						}
						else { // If is a breaker
							switch(temp.getColor()) {
							case 0:
								break;
							case 1: // The blue breaker	
								ctx.drawImage(imageManager.get("BlueBreaker"), 0, 0, 120, 120, 
																			j*pieceWidth, (i-2)*pieceHeight, pieceWidth, pieceHeight);					
								break;
							case 2: 
								ctx.drawImage(imageManager.get("RedBreaker"), 0, 0, 120, 120, 
																			j*pieceWidth, (i-2)*pieceHeight, pieceWidth, pieceHeight);
								break;
							case 3: 
								ctx.drawImage(imageManager.get("GreenBreaker"), 0, 0, 120, 120, 
																			j*pieceWidth, (i-2)*pieceHeight, pieceWidth, pieceHeight);
								break;
							case 4: 
								ctx.drawImage(imageManager.get("YellowBreaker"), 0, 0, 120, 120, 
																			j*pieceWidth, (i-2)*pieceHeight, pieceWidth, pieceHeight);
								break;
							}// end switch
						}				
					}// end if there is a block at [i][j]
				}// end inner for loop
			}// end outer for loop
		}


		/**		
		 *	This is the ResizeMainCanvas method		
		 **/
		retObject.setViewportSize = function(canvasWidth, canvasHeight, numRow, numCol) {
			pieceWidth = Math.floor( (canvasWidth / numRow) );
			pieceHeight = Math.floor( (canvasHeight / numCol) );
		}


		/**
			Just a function to help debug stuff
		*/
		function numToColor(num, isABreaker) {
			
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
		}

		function numToImageName(num, isABreaker) {
			
			if (isABreaker == true) {
				switch(num) {
				case 0:
					break;
				case 1: // The blue breaker
					return "BlueBreaker";								
					break;
				case 2: 
					return "RedBreaker";			
					break;
				case 3: 
					return "GreenBreaker";			
					break;
				case 4: 
					return "YellowBreaker";			
					break;
				}// end switch
			}
			else {
				switch(num) { 
				case 1: 
					return "BlueBlock";			
					break;
				case 2: 
					return "RedBlock";
					break;
				case 3: 
					return "GreenBlock";
					break;
				case 4: 
					return "YellowBlock";
					break;
				}// end switch
			}
		} // end numToImageName




		return retObject;
	}// end powerConstructor()




	return powerConstructor(ctx, canvasWidth, canvasHeight, imageManager);	
} // end LevelOne




