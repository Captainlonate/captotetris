

function LevelOne(ctx, canvasWidth, canvasHeight, imageManager) {	


	function powerConstructor(theCTX, canvWidth, canvHeight, imgMgr) {
		var LEVELONE = {
			NUMROWS: 15,
			NUMCOLS: 7,
			STARTCOL: 3,
			STARTROW_B1: 0,
			STARTROW_B2: 1
		}
		// Public Function Holder
		var retObject = new Object();
		// Networking
		var websocket;
		// Sound effects
		var tink = new SoundPool(5);
		    tink.init("tink");	
		var success = new SoundPool(5);
		    success.init("success");	
		// Registering Event Listeners
		document.getElementById("leftButton").addEventListener("click", leftButton, false);
		document.getElementById("rightButton").addEventListener("click", rightButton, false);	
		// Storing parameters locally
		var ctx = theCTX;  
		var canvasWidth = canvWidth;
		var canvasHeight = canvHeight;
		var imageManager = imgMgr;
		// Arrays
		var gridArray = initialize2DArray();
		var arrayOfStuffToDrop = new Array();
		var attackArray = new Array(7);
		var brokenTotalArray = new Array();
		// Blocks
		var activeBlockOne;
		var b1_row, b1_col, b1_x, b1_y;
		var activeBlockTwo;
		var b2_row, b2_col, b2_x, b2_y;
		var nextBlockOne = new Block(false);
		var nextBlockTwo = new Block(false);
		// Intervals
		var pieceDropInterval;
		// Booleans	
		var acceptInputs = false;
		var gameOver = false;
		var alreadyDroppingStuff = false;
		var shouldMakeCement = false;
		var handleAttackStuff = false;
		// Ints
		var quantityBroken = 0;
		var multiplier = 0;
		
		

		/** WEBSOCKET STUFF **/
		var onEstablishCallBack = function(connection) {	
			console.log("Connection Established");		
			websocket = connection;
			var oldPID;
			var intendedGSID = getCookie("GameSession");	
			if(window.location.hash) {
			  	oldPID = window.location.hash.split('#')[1];
			  	window.location.hash = "";
			} else {
			  	console.log("Hash doesn't exist?");
			}
			var jsonMsg = JSON.stringify( {category: "Ready", sessionID: intendedGSID, pid: oldPID} );
			websocket.send(jsonMsg);		
		};

		var onReceiveMsgCallBack = function(message) {	
			var parsed = JSON.parse(message.data);
			var category = parsed.category;

			if (category == "B") {
				console.log("Told to begin.");	
				attackArray = parsed.msg;
				spawnNewPiece();
			}
			else if (category == "L") {
				
				acceptInputs = false;
				gameOver = true;
				console.log("YOU LOST!");
				alert("You Lost! Too bad.")
			}
			else if (category == "W") {
				
				acceptInputs = false;
				gameOver = true;
				console.log("YOU WON!");
				alert("YOU WON! Heeck yah!")
			}
			else if (category == "DMG") {	
				var cementArray = parsed.msg;
				attackArray = new Array(7);
				for (var c=0; c<cementArray.length; c++) {
					attackArray[c] = cementArray[c];
				}
				handleAttackStuff = true;
			}
		};

		/**
		 * The entry point to the game. 
		 */
		retObject.run = function() {			
			new WebsocketConnection(onEstablishCallBack, onReceiveMsgCallBack);
		}

		function spawnNewPiece() {
			if ( gameOver == false ) {
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

					// Pick the colors of the next piece
					nextBlockOne = new Block(false);
					nextBlockTwo = new Block(false);

					// Update the preview images					
					var topName = "../img/" + imageManager.get( nextBlockOne.getImageName() ).src.split("/")[4];
					document.getElementById('topPreview').style.backgroundImage = "url("+topName+")";					
					var bottomName = "../img/" + imageManager.get( nextBlockTwo.getImageName() ).src.split("/")[4];
					document.getElementById('bottomPreview').style.backgroundImage = "url("+bottomName+")";

					acceptInputs = true;

					pieceDropInterval = setInterval(dropTheActivePiece, 1000); 
				}	
				else {
					console.log("It looks like the game is over?");
					gameOver = true;
					var jsonMsg = JSON.stringify( {category: "Done"} );
					websocket.send(jsonMsg);
				}
			}
		}

		/**
			Called after a piece has fallen to the bottom
		**/
		function endTheTurn() {
			tink.get();
			clearInterval(pieceDropInterval);
			pieceDropInterval = null;
			acceptInputs = false;
			// Begin Chain Stg 1
			finishDroppingActivePiece();		
		}

		/** CHAIN STG 1 **/
		function finishDroppingActivePiece() {
			var didDropOne=false, didDropTwo=false;
			if (canBlockOneDrop() == true) { dropBlockOne(); didDropOne=true;}
			if (canBlockTwoDrop() == true) { dropBlockTwo(); didDropTwo=true;}
			if ( (didDropOne==false) && (didDropTwo==false) ) {updateCementStatuses();}
			else {setTimeout(finishDroppingActivePiece, 100);}
		}

		/** CHAIN STG 2 **/
		function updateCementStatuses() {	
			// Update the status of every stone and grey block				
			for (var i=2; i<LEVELONE.NUMROWS; i++) {		
				for (var j=0; j<LEVELONE.NUMCOLS; j++) {
					if (gridArray[i][j] != 0) {
						if (gridArray[i][j].isUsable() == false) {
							gridArray[i][j].updateStoneStatus();
						}
					}			
				}
			}
			// Reset the number of blocks broken
			quantityBroken = 0;
			multiplier = 0;
			brokenTotalArray = new Array();
			// Move to stage 3
			handleBreaksAndDropsAfterTurn();
		}

		/**
			CHAIN STG 3
			DROP-BREAK-MANAGER
			First, check if anything can be dropped. If it can, a flag is set
			and nothing else will execute in this function until dropBlocks() says
			that this batch has been completely dropped.
			When this happens, dropBlocks() will change alreadyDroppingStuff to false and
			call this function again.
			This time, checkAndHandleBreaks() will check and remove any blocks that need
			to be removed. If anything breaks, it will return True which indicates that
			the board is "dirty" and we need to try to drop stuff again.
		*/
		function handleBreaksAndDropsAfterTurn() {
			// Setting these to true in case stuff is dropping and it's never set at all
			var isThereStuffToDrop = true;
			var shouldCheckBreaks = true;

			// DROPS
			if ( alreadyDroppingStuff == false ) { // If nothing is currently dropping
				// Build the array of droppable blocks, returns true if there was anything
				isThereStuffToDrop = makeDroppableBlocksDrop(); 
				// If there was stuff to drop, first flag that stuff is currently dropping.
				// Then begin the setInterval that drops the blocks. This flag will
				// prevent anything else in this function from executing until everything has dropped.
				if (isThereStuffToDrop == true) {
					alreadyDroppingStuff = true;
					dropBlocks();
				}
			}
			
			// BREAKS			
			if ( alreadyDroppingStuff == false ) { // If nothing is currently dropping
				// Check if anything can be broken and then break it. If anything ends up
				// being broken, then shouldCheckBreaks will be true. 
				shouldCheckBreaks = checkAndHandleBreaks(); 
				// True indicates that the grid is "dirty" and we need to 
				// check if anything can drop again. So just like last time, set the 
				// flag to indicate stuff is currently dropping, and start the drop interval.
				if (shouldCheckBreaks == true) {
					brokenTotalArray.push(quantityBroken);
					alreadyDroppingStuff = true;
					dropBlocks();
				}
			}
			
			// Only when both makeDroppableBlocksDrop() and checkAndHandleBreaks() both
			// return false should stage 4 begin
			if ((isThereStuffToDrop == false) && (shouldCheckBreaks == false) ) {
				// Move to stage 4
				// console.log("Breaker report for this turn is as follows: ");
				// if (brokenTotalArray.length > 0) {
				// 	for (var c=0; c<brokenTotalArray.length; c++)  {
				// 		console.log("Batch " + c + " broke " + brokenTotalArray[c] + " blocks.");
				// 	}
				// }
				if (brokenTotalArray.length > 0) {
					var jsonMsg = JSON.stringify( {category: "DMG", dmgArray: brokenTotalArray} );
					websocket.send(jsonMsg);
				}					
				handleEnemyAttack();
			}		   
		}

		/** CHAIN STG 4 **/
		function handleEnemyAttack() { 
			if ( handleAttackStuff == true ) {
				var runAgain = false;
				var shouldRunAgain = false;

				for (var count=0; count<attackArray.length; count++) {
					if (attackArray[count] != 0) {
						runAgain = true;
						attackArray[count] = attackArray[count]-1;
						spawnCementBlock(count);					
					}				
				}

				shouldRunAgain = makeDroppableBlocksDrop();
				dropCementBlocks();

				if (runAgain==true || shouldRunAgain==true) {
					setTimeout(handleEnemyAttack, 100);
				}
				else { 
					attackArray = new Array(7);
					handleAttackStuff = false;
					spawnNewPiece(); 
				}
			}
			else {
				spawnNewPiece(); 
			}			
		}

		/** 
			Checks if anything can drop - Builds an array
		*/
		function makeDroppableBlocksDrop() {
			var droppedCounter = 0;
			// Build an array of blocks that need to fall ( at the same time )
			for (var i=2; i<LEVELONE.NUMROWS; i++) {		
				for (var j=0; j<LEVELONE.NUMCOLS; j++) {	
					// If there is something at this spot
					if ( gridArray[i][j] != 0 ) {
						// If this thing that we found can drop one cell, put it in the array
						if ( (i+1 < LEVELONE.NUMROWS) && (gridArray[i+1][j] == 0) ) {							
							arrayOfStuffToDrop.push({row: i,col: j});
							droppedCounter++;
						}
					}			
				}
			}				
			if ( droppedCounter == 0 ) {
				// There is nothing to drop this time. Return false because
				// there is no need to check again unless something breaks
				// Clear out the array just in case something was still there.	
				arrayOfStuffToDrop = new Array();
				return false;
			}			
			else { 
				// There is stuff to drop, return true because we should 
				// check again after dropping this bunch
				return true;
			}
		}


		/**
			Makes blocks in array drop by 1
		**/
		function dropBlocks() {
			var didAnythingDrop = false;
			for (var j=arrayOfStuffToDrop.length-1; j>=0; j--) {
				if ( (arrayOfStuffToDrop[j].row+1 < LEVELONE.NUMROWS) && 
					 (gridArray[arrayOfStuffToDrop[j].row+1][arrayOfStuffToDrop[j].col] == 0) ) {
					//
					gridArray[arrayOfStuffToDrop[j].row+1][arrayOfStuffToDrop[j].col] = gridArray[arrayOfStuffToDrop[j].row][arrayOfStuffToDrop[j].col];
					gridArray[arrayOfStuffToDrop[j].row][arrayOfStuffToDrop[j].col] = 0;	
					arrayOfStuffToDrop[j].row = arrayOfStuffToDrop[j].row+1;
					// 
					didAnythingDrop = true;
				}						
			}
			// If done dropping everything, then set the flag to not dropping anymore
			if ( didAnythingDrop == false ) {
				alreadyDroppingStuff = false;
				// This is going to get me in trouble
				handleBreaksAndDropsAfterTurn();
			}
			else {
				setTimeout(dropBlocks, 100);
			}			
		}
		 		


		function dropCementBlocks() {
			for (var j=arrayOfStuffToDrop.length-1; j>=0; j--) {			
				if ( (arrayOfStuffToDrop[j].row+1 < LEVELONE.NUMROWS) && 
					 (gridArray[arrayOfStuffToDrop[j].row+1][arrayOfStuffToDrop[j].col] == 0) ) {
					//
					gridArray[arrayOfStuffToDrop[j].row+1][arrayOfStuffToDrop[j].col] = gridArray[arrayOfStuffToDrop[j].row][arrayOfStuffToDrop[j].col];
					gridArray[arrayOfStuffToDrop[j].row][arrayOfStuffToDrop[j].col] = 0;	
					arrayOfStuffToDrop[j].row = arrayOfStuffToDrop[j].row+1;
				}						
			}			
		}



		/**
			Function that checks each cell to determine if it's a breaker.
			When it finds a breaker, it calls breakBlocks() on it, which will
			build an array of all the connected pieces of the same color as the breaker.
			When the array is built, checkAndHandleBreaks() will remove the elements.
			Returns True if something was removed "broken"
			Returns False if nothing was removed
		*/
		function checkAndHandleBreaks() {
			quantityBroken = 0;
			var didSomethingBreak = false;
			for (var i=2; i<LEVELONE.NUMROWS; i++) {		
				for (var j=0; j<LEVELONE.NUMCOLS; j++) {	
					// If there is a breaker at this spot
					if ( (gridArray[i][j] != 0) && (gridArray[i][j].getBreakerStatus() == true) ) {	
						// BUILD ARRAY OF BLOCKS TO REMOVE
						var completedFlagArray = breakBlocks( gridArray[i][j].getColor(), i, j, new Array() );
						if(completedFlagArray.length > 0) {
							didSomethingBreak = true; 
							success.get(); 
							quantityBroken += completedFlagArray.length;
						}
						// REMOVE BLOCKS FROM ARRAY
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
					if (gridArray[curPosRow-1][curPosCol].isUsable() == true) {
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
			}
			// Check left
			if( (curPosCol-1 >= 0) && (gridArray[curPosRow][curPosCol-1]) ) {
				if(gridArray[curPosRow][curPosCol-1].getColor() == color) {
					if (gridArray[curPosRow][curPosCol-1].isUsable() == true) {
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
			}
			// Check right
			if( (curPosCol+1 < LEVELONE.NUMCOLS) && (gridArray[curPosRow][curPosCol+1]) ) {
				if(gridArray[curPosRow][curPosCol+1].getColor() == color) {
					if (gridArray[curPosRow][curPosCol+1].isUsable() == true) {
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
			}
			// Check below
			if( (curPosRow+1 < LEVELONE.NUMROWS) && (gridArray[curPosRow+1][curPosCol]) ) {
				if(gridArray[curPosRow+1][curPosCol].getColor() == color) {
					if (gridArray[curPosRow+1][curPosCol].isUsable() == true) {
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
			}
			
			// return array
			return flag;
		}


		function spawnCementBlock(col) {
			if(gridArray[2][col] == 0) {
				var newCementBlock = new Block(true);
				gridArray[2][col] = newCementBlock;
			}
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
		 * Game.js calls this
		 */
		retObject.draw = function(ctx) {
		 	for (var i=2; i<LEVELONE.NUMROWS; i++) {		
				for (var j=0; j<LEVELONE.NUMCOLS; j++) {				
					if ( gridArray[i][j] != 0 ) { // If there is SOMETHING there
						var imageName = gridArray[i][j].getImageName();
						ctx.drawImage(imageManager.get(imageName), 0, 0, 120, 120, j*pieceWidth, (i-2)*pieceHeight, pieceWidth, pieceHeight);
					}
				}
			}
		}


		/**		
		 *	This is the ResizeMainCanvas method		
		 **/
		retObject.setViewportSize = function(canvasWidth, canvasHeight, numRow, numCol) {
			pieceWidth = Math.floor( (canvasWidth / numRow) );
			pieceHeight = Math.floor( (canvasHeight / numCol) );
		}




















		/** TURN MOVE LEFT RIGHT - MECHANICAL FUNCTIONS **/

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
					else { 
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



		return retObject;
	}// end powerConstructor()




	return powerConstructor(ctx, canvasWidth, canvasHeight, imageManager);	
} // end LevelOne




