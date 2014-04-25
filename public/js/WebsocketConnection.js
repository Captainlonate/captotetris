
function WebsocketConnection(connectionInitiatedCallBack, receivedMessageCallback) {

	function runConnection(onConnectCallback, onReceiveMessage) {
		var connectCallback = onConnectCallback;			
		// Not for heroku
		//var address = "192.168.1.119";
		//var port = "5000";
		//var websocketAddress = "ws://" + address + ":" + port;
			// For Heroku
			var websocketAddress = location.origin.replace(/^http/, 'ws');
		// if user is running mozilla then use it's built-in WebSocket
	    window.WebSocket = window.WebSocket || window.MozWebSocket;
	    // if browser doesn't support WebSocket, just show some notification and exit
	    if (!window.WebSocket) {
        	document.getElementById('ConnectionStatus').innerHTML = "Browser does not support Websockets";
	        return;
	    }
	 	/** Where to look for a connection **/
		var connection = new WebSocket(websocketAddress);
	    /** Once the connection is established **/
	    connection.onopen = function () {
	    	if (document.getElementById('ConnectionStatus') != null) {
	    		document.getElementById('ConnectionStatus').innerHTML = "*Connection Established*";
	    	}	
	    	connectCallback(this);
	    };
	    /** If there was a problem with the connection */
		connection.onerror = function (error) {
			if (document.getElementById('ConnectionStatus') != null) {
				document.getElementById('ConnectionStatus').innerHTML = "*ERROR with the connection sadface*";
			}
	        //console.log("ERROR with the connection *sadface*");
	    };
	    /** Incoming messages - How the client should handle the different types of incoming messages**/
	    connection.onmessage = function (message) {
	    	onReceiveMessage(message);
	    };
	    return connection;
	}

	return runConnection(connectionInitiatedCallBack, receivedMessageCallback);

}