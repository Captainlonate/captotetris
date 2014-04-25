

function GameLobby() {
	
	/** Used for closure **/
	function powerConstructor() {
		var retObject = new Object();
		var websocket;
		retObject.onEstablishCallBack = function(connection) {			
			websocket = connection;			
		};
		retObject.onReceiveMsgCallBack = function(message) {		
			var parsed = JSON.parse(message.data);
			var category = parsed.category;
			var mesg = parsed.msg;
			if (category == "LobbyList") {
				document.getElementById('PlayerNameBox').readOnly = true;
				document.getElementById('PlayerNameBox').style.borderBottom = "0";
				mesg.forEach(function(entry) {
					addPlayerToList(entry);
				});
			}
			else if (category == "RemovePlayer") {
				removePlayerFromList(mesg);
			}
			else if (category == "AddedPlayer") {
				addPlayerToList(mesg);
			}	
			else if (category == "ChallengedBy") {
				console.log("You have been challenged by " + mesg);	
				lightBoxOn(mesg);
			}
			else if (category == "ChallengeResponse") {
				if ( mesg == "Decline" ) {
					console.log("They declined.")
				}
				else if ( mesg == "Busy" ) {
					console.log("They can't be challenged because they are busy.");
				}
			}
			else if (category == "LoadGame") {
				setCookie("GameSession", mesg);	
				window.location.href = "game.html" + "#" + parsed.pid;	
			}
		};
		new WebsocketConnection(retObject.onEstablishCallBack, retObject.onReceiveMsgCallBack);
		var toggleInt = 1; // Toggles the waves
		var waterPeak = document.getElementById('waterPeak');
		var waterLow = document.getElementById('waterLow');
		var sign = document.getElementById('Sign');
		var connectButton = document.getElementById('ConnectButton');
		connectButton.addEventListener('click', connectionInitiated, false);
		var lightBoxDiv = document.getElementById('lightboxDiv');
		lightBoxDiv.getElementsByTagName('input')[0].addEventListener('click', acceptedBattle, false);
		lightBoxDiv.getElementsByTagName('input')[1].addEventListener('click', declinedBattle, false);
		var rotateToggle = false; // Toggles the sign
		// Which type of transformation do I have
		var transformPrefix = whichTransformPrefix();
		// If its night time, then use night time colors for the sky, otherwise a sunny day			
		var d = new Date();
		if ( (d.getHours() >= 19) || (d.getHours() < 6) ) {
			getCssValuePrefix('linear-gradient(#009fcb, #020000)');
			document.body.style.backgroundColor = "#020000";
		}
		else {
			getCssValuePrefix('backgroundImage', 'linear-gradient(#ffff89, #00ccff)');
			document.body.style.backgroundColor = "#00ccff";
		}

		// Kick off the water animation
		moveWaves();

		// Make the water animation interval begin
		window.setInterval(moveWaves, 4000);

		// Make the sign start doing its thing	
		window.setInterval(function() {				
			if (rotateToggle == false) {
				sign.style[transformPrefix] = "rotate(5deg) translate(0%, 650px)";
				rotateToggle = true;
			}
			else {
				sign.style[transformPrefix] = "rotate(-5deg) translate(0%, 650px)";
				rotateToggle = false;
			}			
		}, 3000);	
		

		/** Splashes the waves back and forth **/
		function moveWaves() {
			if (toggleInt == 1) {
				toggleInt = 2;
				waterPeak.style[transformPrefix] = "translate(30px, -5px)";
				waterLow.style[transformPrefix] = "translate(-30px, -2px)";
			}
			else if(toggleInt == 2) {
				toggleInt = 1;
				waterPeak.style[transformPrefix] = "translate(-30px, 5px)";
				waterLow.style[transformPrefix] = "translate(30px, 2px)";
			}		
		}

		/** Provides the browser compatible type of transform **/
		function whichTransformPrefix(){
			var options = ['transform', 'MozTransform', 'WebkitTransform', 'msTransform', 'OTransform'];
		    var root=document.documentElement 
		    for (var i=0; i<options.length; i++){ 
		        if (options[i] in root.style){ 
		            return options[i] ;
		        }
		    }
		}

		/** Updates the  backgroundImage with "value" **/
		function getCssValuePrefix(value) {
		    var prefixes = ['', '-o-', '-ms-', '-moz-', '-webkit-'];
		    var thingToChange = 'backgroundImage';
		    // Create a temporary DOM object for testing
		    var bg = document.getElementById("contentDiv");
		    for (var i = 0; i < prefixes.length; i++) {
		        // Attempt to set the style
		        bg.style[thingToChange] = prefixes[i] + value;
		        // Detect if the style was successfully set
		        if (bg.style[thingToChange]) {
		            return prefixes[i];
		        }
		        bg.style[thingToChange] = '';   // Reset the style
		    }
		}

		function connectionInitiated() {
			var desiredPlayerName = document.getElementById('PlayerNameBox').value;
			var jsonMsg = JSON.stringify( {category: "InitiateConnection", desiredName:desiredPlayerName} );
			websocket.send(jsonMsg);
		}

		function addPlayerToList(player) {
			var templateLI = document.getElementById('templateLI').cloneNode(true);
			templateLI.getElementsByTagName("span")[0].innerHTML = player;
			templateLI.setAttribute("id", player + "LIELEMENT");
			var playerName = templateLI.getElementsByTagName("span")[0].innerHTML;
			templateLI.addEventListener('click', function(){initiateChallenge(playerName);}, false);
			document.getElementById("Challengers").appendChild(templateLI);
			// var li = document.createElement("li");
			// li.innerHTML = player;
			// li.setAttribute("id", player + "LIELEMENT");
			// li.addEventListener('click', function(){initiateChallenge(this.innerHTML);}, false);
			// document.getElementById("Challengers").appendChild(li);
		}
		function removePlayerFromList(player) {
			var playerToRemove = document.getElementById(player + 'LIELEMENT');
			playerToRemove.parentNode.removeChild(playerToRemove);
		}
		function initiateChallenge(player) {
			var challengedOpponent = document.getElementById(player + 'LIELEMENT').getElementsByTagName("span")[1];
			challengedOpponent.innerHTML = "Challenged";
			challengedOpponent.style.backgroundColor = "green";
			var jsonMsg = JSON.stringify( {category: "InitiateChallenge", challengee:player} );
			websocket.send(jsonMsg);
		}		
		function lightBoxOn(playerName) {
			lightBoxDiv.getElementsByTagName('p')[0].innerHTML = playerName + " challenges YOU!";
			lightBoxDiv.style.display='block';
			document.getElementById('dimDiv').style.display='block';
		}
		function lightBoxOff() {
			lightBoxDiv.style.display='none';
			document.getElementById('dimDiv').style.display='none';
		}
		function acceptedBattle() {
			console.log("Accepted Battle");
			var jsonMsg = JSON.stringify( {category: "ChallengeResponse", willFight:true} );
			websocket.send(jsonMsg);
			lightBoxOff();
		}
		function declinedBattle() {
			console.log("Declined Battle");
			var jsonMsg = JSON.stringify( {category: "ChallengeResponse", willFight:false} );
			websocket.send(jsonMsg);
			lightBoxOff();
		}
		function setCookie(cname, cvalue) {
			document.cookie = cname + "=" + cvalue;
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
		return retObject;

	} // end powerConstructor

	return powerConstructor();

} // end GameLobby()

