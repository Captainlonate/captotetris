
function GameSP(canvas) {	

	function powerConstructor(cnv) {
		// This will hold the web socket connection
		var connection = null;
		// Initialize the canvas size and bind the resize event listener
		var canvas = cnv;
		var widthToHeightRatio = determineScreenRatio();
		window.addEventListener("resize", resizeMainCanvas);
		window.addEventListener('keydown', onKeyPressed);
		var currentLevel;
		var boundAnimate;
		var ctx = canvas.getContext("2d");	
		// Image Files Stored in /img
		var images = {
			"BlueBlock" : "img/bluePiece.png",
			"RedBlock" : "img/redPiece.png",
			"GreenBlock" : "img/greenPiece.png",
			"YellowBlock" : "img/yellowPiece.png",
			"YellowBreaker" : "img/yellowBreaker.png",
			"BlueBreaker" : "img/blueBreaker.png",
			"GreenBreaker" : "img/greenBreaker.png",
			"RedBreaker" : "img/redBreaker.png"
		}
		var imageManager = new ImageManager();
		    imageManager.load(images, onLoaded);

		/** Called after all images are loaded */
		function onLoaded() {
			// Make the current Level
			currentLevel = new LevelOneSP(ctx, canvas.width, canvas.height, imageManager);
			resizeMainCanvas();
			// Begin the logic render loop
			mainLoop(0);
			// Setup is complete, let the level take over
			currentLevel.run();
		}

		function onKeyPressed(e) {
			currentLevel && currentLevel.keyPressed(e);	
		}

		/** The Parent of the game loop - This keeps the loop going */
		function mainLoop(t) {
			// ---REQUEING PART!!
			requestAnimationFrame(mainLoop); // queue this method again		
			// ---RENDERING PART!! First clear with black then redraw everything
			ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			currentLevel.draw(ctx);
		}


		function resizeMainCanvas() {
			var newWidth = window.innerWidth;
			var newHeight = window.innerHeight-100; // 100 so I can have a margin <3
			var currentWidthToHeightRatio = newWidth / newHeight; 
			var gameArea = document.getElementById('gameArea');

			if (currentWidthToHeightRatio > widthToHeightRatio) {
			  // window width is too wide relative to desired game width
			  // Make the width and height divisible by 7 and 13
			  newHeight = Math.floor(newHeight);
			  while( (newHeight%13) != 0 ) {
			  	newHeight = newHeight + 1;
			  }
			  newWidth = newHeight * widthToHeightRatio;
			  newWidth = Math.floor(newWidth);
			  while( (newWidth%7) != 0 ) {
			  	newWidth = newWidth + 1;
			  }
			  gameArea.style.height = newHeight + 'px';
			  gameArea.style.width = newWidth + 'px';
			} else { // window height is too high relative to desired game height
			  newHeight = newWidth / widthToHeightRatio;
			  gameArea.style.width = newWidth + 'px';
			  gameArea.style.height = newHeight + 'px';
			}

			gameArea.style.marginTop = (-newHeight / 2) + 'px';
			gameArea.style.marginLeft = (-newWidth / 2) + 'px';	

			canvas.width = Math.floor(newWidth);
			canvas.height = Math.floor(newHeight);

			var numRowsToDivide = (7 * window.devicePixelRatio);
			var numColsToDivide = (13 * window.devicePixelRatio);
			
			var hidefCanvasWidth = canvas.width;
		    var hidefCanvasHeight = canvas.height;
		    var hidefCanvasCssWidth = hidefCanvasWidth;
		    var hidefCanvasCssHeight = hidefCanvasHeight;
		    canvas.width = (hidefCanvasWidth * window.devicePixelRatio);
		    canvas.height = (hidefCanvasHeight * window.devicePixelRatio);
		    canvas.style.width = hidefCanvasCssWidth;
		    canvas.style.height = hidefCanvasCssHeight;       
			ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
			
			currentLevel && currentLevel.setViewportSize(canvas.width, canvas.height, numRowsToDivide, numColsToDivide);
		}

		function determineScreenRatio() {
			var whichScreen = undefined;
			if ( screen.width==1440 && screen.height==900 ) {
				whichScreen = "OSXRETINA";
				var widthToHeight = 10/16;
			}		
			else if ( (screen.width==640 && screen.height==360) || 
				      (screen.width==360 && screen.height==640)) {
				whichScreen = "GALAXYS4";
				var widthToHeight = 9/16;
			}
			else if ( screen.width==1920 && screen.height==1080 ) {
				whichScreen = "1920x1080";
				var widthToHeight = 9/16;
			}
			else if ( (screen.width==1024 && screen.height==768) ||
			 	      (screen.width==768 && screen.height==1024)) {
				whichScreen = "IPADRETINA";
				var widthToHeight = 3/4;
			}
			else {
				widthToHeight = 9/16;
			}

			return widthToHeight;
		}	



		return "GameObject";
	}// end powerConstructor



	return powerConstructor(canvas);
} // end Game()