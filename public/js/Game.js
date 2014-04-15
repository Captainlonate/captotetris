/**  Primary constructor   */
function Game(canvas) {	
	// This will hold the web socket connection
	this.connection = null;
	// Initialize the canvas size and bind the resize event listener
	this._canvas = canvas;
	this.widthToHeightRatio = this.determineScreenRatio();
	var self = this;
	window.addEventListener("resize", function() {
		self.resizeMainCanvas();
	});
	this._ctx = this._canvas.getContext("2d");	
	// Image Files Stored in /img - I want to get this going as soon as possible
	this.images = {
		"BlueBlock" : "img/bluePiece.png",
		"RedBlock" : "img/redPiece.png",
		"GreenBlock" : "img/greenPiece.png",
		"YellowBlock" : "img/yellowPiece.png",
		"YellowBreaker" : "img/yellowBreaker.png",
		"BlueBreaker" : "img/blueBreaker.png",
		"GreenBreaker" : "img/greenBreaker.png",
		"RedBreaker" : "img/redBreaker.png"
	};
	this.imageManager = new ImageManager();
	this.imageManager.load(this.images, this.onLoaded.bind(this));
	// Bind the Input Handlers
	this.inputHandler = new InputHandler(this._canvas);
	this.inputHandler.on("up", this.onUp.bind(this));
	window.addEventListener('keydown', this.onKeyPressed.bind(this));
	
	// Establish a connection to the server
	//this.runConnection();
}

_p = Game.prototype;





/** Called once all images are loaded */
_p.onLoaded = function() {
	// Make the current Level
	this._currentLevel = new LevelOne(this._ctx, this._canvas.width, this._canvas.height, this.imageManager);
	this.resizeMainCanvas();
	// make sure that "this" always refers to the instance of the game
	this._boundAnimate = this.mainLoop.bind(this);
	// Begin the logic render loop
	this._boundAnimate(0);
	// Setup is complete, let the level take over
	this._currentLevel.run();
};




/**
 				EVENT LISTENERS / HANDLERS
 */

/**  CLICK Listener - e.x and e.y are where your mouse clicked ON THE SCREEN, ignorant of the world */
_p.onUp = function(e) {	
	var canvasClickX = Math.floor((e.x-this._canvas.getBoundingClientRect().left));
	var canvasClickY = e.y;
	//this._currentLevel && this._currentLevel.clicked(canvasClickX, canvasClickY);
};

_p.onKeyPressed = function(e) {
	this._currentLevel && this._currentLevel.keyPressed(e);	
};



/**
 * 				THE GAME'S MAIN LOOP
 */

/** The Parent of the game loop - This keeps the loop going */
_p.mainLoop = function(t) {
	// ---REQUEING PART!!
	requestAnimationFrame(this._boundAnimate); // queue this method again
	// ---LOGIC PART!!
	this._currentLevel.updateLogic(); // update game logic
	// ---RENDERING PART!! First clear with black then redraw everything
	this._ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
	this._ctx.clearRect(0,0,canvas.width,canvas.height);
	this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
	this._currentLevel.draw(this._ctx);
};























/**
 * 				CONNECT TO THE SERVER
 */

// Initialize the connection and sets up the event listeners
_p.runConnection = function() {
	// To allow event listeners to have access to the correct scope
	var self = this;
	// if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        content.html($('<p>', { text: 'Sorry, but your browser doesn\'t ' + 'support WebSockets.'} ));
        return;
    }
 	/** Where to look for a connection **/
	this.connection = new WebSocket('ws://192.168.1.119:8000');
    /** Once the connection is established **/
    this.connection.onopen = function () {
    	console.log("Connection Established.");
    };
    /** If there was a problem with the connection */
	this.connection.onerror = function (error) {
        console.log("ERROR with the connection *sadface*");
    };
    /** Incoming messages - How the client should handle the different types of incoming messages**/
    this.connection.onmessage = function (message) {
    };
}; // end runConnection


_p.resizeMainCanvas = function() {
	var newWidth = window.innerWidth;
	var newHeight = window.innerHeight-100; // 100 so I can have a margin <3
	var currentWidthToHeightRatio = newWidth / newHeight; 
	var gameArea = document.getElementById('gameArea');

	if (currentWidthToHeightRatio > this.widthToHeightRatio) {
	  // window width is too wide relative to desired game width
	  // Make the width and height divisible by 7 and 13
	  newHeight = Math.floor(newHeight);
	  while( (newHeight%13) != 0 ) {
	  	newHeight = newHeight + 1;
	  }
	  newWidth = newHeight * this.widthToHeightRatio;
	  newWidth = Math.floor(newWidth);
	  while( (newWidth%7) != 0 ) {
	  	newWidth = newWidth + 1;
	  }
	  gameArea.style.height = newHeight + 'px';
	  gameArea.style.width = newWidth + 'px';
	} else { // window height is too high relative to desired game height
	  newHeight = newWidth / this.widthToHeightRatio;
	  gameArea.style.width = newWidth + 'px';
	  gameArea.style.height = newHeight + 'px';
	}

	gameArea.style.marginTop = (-newHeight / 2) + 'px';
	gameArea.style.marginLeft = (-newWidth / 2) + 'px';	

	this._canvas.width = Math.floor(newWidth);
	this._canvas.height = Math.floor(newHeight);

	var numRowsToDivide = 7;
	var numColsToDivide = 13;
	if (window.devicePixelRatio == 2) {
		var hidefCanvasWidth = this._canvas.width;
        var hidefCanvasHeight = this._canvas.height;
        var hidefCanvasCssWidth = hidefCanvasWidth;
        var hidefCanvasCssHeight = hidefCanvasHeight;
        this._canvas.width = (hidefCanvasWidth * window.devicePixelRatio);
        this._canvas.height = (hidefCanvasHeight * window.devicePixelRatio);
        this._canvas.style.width = hidefCanvasCssWidth;
        this._canvas.style.height = hidefCanvasCssHeight;
        //$(hidefCanvas).css('width', hidefCanvasCssWidth);
        //$(hidefCanvas).css('height', hidefCanvasCssHeight);        
		this._ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
		numRowsToDivide = 14;
		numColsToDivide = 26;
	} 		

	this._currentLevel && this._currentLevel.setViewportSize(this._canvas.width, this._canvas.height, numRowsToDivide, numColsToDivide);


	// if (window.devicePixelRatio) {

	// 	var hidefCanvas = $("#mainCanvas")[0];
	// 	console.log(hidefCanvas);
 //        var hidefCanvasWidth = $(hidefCanvas).width();
 //        var hidefCanvasHeight = $(hidefCanvas).height();
 //        console.log(hidefCanvasHeight);
 //        var hidefCanvasCssWidth = hidefCanvasWidth;
 //        var hidefCanvasCssHeight = hidefCanvasHeight;
 //    	debugger;
 //        $(hidefCanvas).attr('width', hidefCanvasWidth * window.devicePixelRatio);
 //        $(hidefCanvas).attr('height', hidefCanvasHeight * window.devicePixelRatio);
 //        $(hidefCanvas).css('width', hidefCanvasCssWidth);
 //        $(hidefCanvas).css('height', hidefCanvasCssHeight);
 //        this._ctx.scale(window.devicePixelRatio, window.devicePixelRatio);             
 //      }

};



_p.determineScreenRatio = function() {
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
};

