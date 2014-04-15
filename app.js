"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'Nathan-Game';

/** Requires **/
var  webSocketServer = require('websocket').server,
		expr = require("express"),
		xpress = expr(),
		server = require('http').createServer(xpress),
		fs = require('fs');

// Configure express
xpress.configure(function() {
     xpress.use(expr.static(__dirname + "/public"));
     xpress.set("view options", {layout: false});
});

// Handle GET requests to root directory
xpress.get('/', function(req, res) {
    res.sendfile(__dirname + '/public/game.html');
});

// WebSocket Server
var wsServer = new webSocketServer({
    httpServer: server
});

var pport = process.env.PORT || 5000;

// Set up the http server
server.listen(pport, function(err) {
	if(!err) { console.log("Listening on port " + pport); }
});


console.log("--------------");
console.log("I'm here at!!!!");
console.log(pport);
console.log("--------------");



		/** START SOME GAME LOGIC **/
var clients = [ ]; // list of currently connected clients (users)



/**
 * This callback function is called every time someone tries to establish a connection to the WebSocket server
 */
wsServer.on('request', function(request) { // initial connection to server from a client
	// Accept connection - you should check 'request.origin' to make sure that client is connecting from your website
    var connection = request.accept(null, request.origin); 
	var self = this;
	
	// We need to know client index to remove them on 'close' event
    var index = clients.push(connection) - 1;
   
    // Event Listener for when Clients send a message to the Server
    connection.on('message', function(message) {
    });
    
    // Event Listener for User Disconnected
    connection.on('close', function(connection) {
        console.log((new Date()) + " Client: " + connection.remoteAddress + " disconnected.");
        // remove user from the list of connected clients
        clients.splice(index, 1);
    });
    
});



/** Update a cell that the user has clicked on the server side, then broadcast the change to all clients **/
function updateWorldCell(x, y) {
};

/** Send the up to date list of message to every client **/
function broadcastMessage() {
}

function broadcastUpdateWorld() {
}

/** Helper function for escaping input strings */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Read the array in from a file **/
function readWorldIn() {
	// var tempWorld = fs.readFileSync('./data/WORLD.txt', 'utf8', function (err,data) {
  		// if (err) { return console.log(err); }
	// });
	// return tempWorld;
};





