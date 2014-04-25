"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'Nathan-Game';

/** Requires **/
var webSocketServer = require('websocket').server,
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
    res.sendfile(__dirname + '/public/lobby.html');
});

// WebSocket Server
var wsServer = new webSocketServer({
    httpServer: server
});

var pport = process.env.PORT || 5000;

// Set up the http server
server.listen(pport, function(err) {

});


console.log("--------------");
console.log("I'm here at!!!! " + pport);
console.log("--------------");


		/** START SOME GAME LOGIC **/
var lobbyFolk = new Array();
var pendingChallenges = new Array(); // {challenger, challengee}
var activeGames = new Array();
var fallOrder = [0, 6, 1, 5, 2, 4, 3];

wsServer.on('request', function(request) { 
	
    var connection = request.accept(null, request.origin); 
    var playerName = null;
    var uuid = null;
    var personalGameSessionID = null;
    
    connection.on('message', function(message) {
        var parsedMessage = JSON.parse(message.utf8Data);

        /** IF A CLIENT HAS CHALLENGED ANOTHER PLAYER **/
                if( parsedMessage.category == "InitiateChallenge" ) {            
                    handleInitateChallenge(playerName, parsedMessage.challengee);            
                }


        /** WHAT DID THE CHALLENGEE SAY ABOUT THE CHALLENGE **/
                else if ( parsedMessage.category == "ChallengeResponse" ) {
                    if (parsedMessage.willFight == true) { // if they accepted the fight
                        handleEstablishTheMatch(playerName, uuid);                
                    }
                    else  { // else they must have declined to fight
                        notifyChallengerTheyDeclined(playerName);                              
                    }
                }


        /** IF A CLIENT IS TRYING TO REGISTER THEIR NAME **/
                else if( parsedMessage.category == "InitiateConnection" ) {
                    var lobbyGuyInfo = addLobbyGuyToArray(parsedMessage.desiredName, connection);
                    if (lobbyGuyInfo != false) {
                        playerName = lobbyGuyInfo.pname;
                        uuid = lobbyGuyInfo.pguid;
                    }
                }    


        /** WHEN THE USER IS READY TO BEGIN PLAYING THE GAME **/
                else if( parsedMessage.category == "Ready" ) {
                    uuid = parsedMessage.pid;
                    personalGameSessionID = parsedMessage.sessionID;
                    var nameAndLast = setUpGameInArray(parsedMessage.sessionID, connection, uuid); 
                    var last = false;
                    if (nameAndLast != false) {
                        playerName = nameAndLast.pName;
                        last = nameAndLast.last;
                    }     
                    if (last == true) {
                        // var attackArray = new Uint8Array(7);
                        // attackArray[0] = 2;
                        // attackArray[3] = 1;
                        // attackArray[4] = 4;
                        var whatToSend = JSON.stringify({category: "B"});
                        broadcastToActiveGame(personalGameSessionID, whatToSend);
                    }          
                }





        /** WHEN THE PLAYER HAS LOST THE GAME **/
                else if( parsedMessage.category == "Done" ) {                    
                    notifyPlayersGameOver(playerName);
                }

                else if( parsedMessage.category == "DMG" ) {   
                    var attackersArray = parsedMessage.dmgArray;                 
                    //console.log(attackersArray);
                    // calculate how much should be sent
                    var arrayToSend = calculateDmgToSend(attackersArray);
                    //console.log(arrayToSend);
                    var msgToSend = JSON.stringify({category: "DMG", msg: arrayToSend});
                    tellTheOtherGuy(playerName, msgToSend);                    
                }

    }); // end onMessage
    




    // Event Listener for User Disconnected
    connection.on('close', function(connection) {
        console.log("User " + playerName + " has disconnected.");
        for (var count=0; count<lobbyFolk.length; count++) {
            if (lobbyFolk[count].Guid == uuid) {
                lobbyFolk.splice(count, 1);
                break;
            }
        }
        removeChallengeeFromArray(playerName);
        //removeFromActiveGame(playerName);
        var whatToSend = JSON.stringify({category: "RemovePlayer", msg:playerName}); 
        broadcastMessage(whatToSend);        
    });// end onConnectionClosed

}); // end onRequest







/** -------------------------------------------------------------------------------------- **/
//                                      GETTERS, SETTERS, TELLERS


                                    // LOBBY PLAYER FUNCTIONS
function broadcastMessage(notification) {
    for (var count=0; count<lobbyFolk.length; count++) {        
        lobbyFolk[count].conn.send(notification, 'utf8', function(){});
    }
}
function tellPlayer(player, notification) {
    for (var count=0; count<lobbyFolk.length; count++) {        
        if (lobbyFolk[count].name == player) {            
            lobbyFolk[count].conn.send(notification, 'utf8', function(){});
        }
    }
}
function getAllLobbyPlayerNames(except) {
    except = except || -1;
    var pNames = new Array();
    for (var count=0; count<lobbyFolk.length; count++) {
        if (lobbyFolk[count].name != except) {
            pNames.push(lobbyFolk[count].name);
        }        
    }
    return pNames;
}
function getPlayeruuid(player) {
    var foundUUID = null;
    for (var count=0; count<lobbyFolk.length; count++) {        
        if (lobbyFolk[count].name == player) {            
            foundUUID = lobbyFolk[count].Guid;
            break;
        }
    }
    return foundUUID;
}
function broadcastMessageExcept(notification, except) {
    for (var count=0; count<lobbyFolk.length; count++) {
        if (lobbyFolk[count].name != except) {            
            lobbyFolk[count].conn.send(notification, 'utf8', function(){});
        }       
    }
}


                                    // PENDING PLAYER FUNCTIONS
function isChallengeeInArray(challengee) {
    var isFound = false;
    for (var count=0; count<pendingChallenges.length; count++) {
        if (pendingChallenges[count].challengee == challengee) {
            isFound = true;
            break;
        }
    }
    return isFound;
}
function removeChallengeeFromArray(challengee) {
    for (var count=0; count<pendingChallenges.length; count++) {
        if (pendingChallenges[count].challengee == challengee) {
            pendingChallenges.splice(count, 1);
            break;
        }
    }
}
function getChallengerWithChallengee(challengee) {
    var challenger = null;
    for (var count=0; count<pendingChallenges.length; count++) {
        if (pendingChallenges[count].challengee == challengee) {
            challenger = pendingChallenges[count].challenger;
            break;
        }
    }    
    return challenger;
}


                                    // ACTIVE PLAYER FUNCTIONS
function broadcastToActiveGame(sessID, notification) {
    for (var count=0; count<activeGames.length; count++) {        
        if (activeGames[count].sessionID == sessID) {            
            activeGames[count].player1Conn.send(notification, 'utf8', function(){});
            activeGames[count].player2Conn.send(notification, 'utf8', function(){});
        }
    }
}
function removeFromActiveGame(challengee) {
    for (var count=0; count<activeGames.length; count++) {
        if ( (activeGames[count].player1 == challengee) ||
             (activeGames[count].player2 == challengee) ) {
            activeGames.splice(count, 1);
            break;
        }
    }
}
function notifyPlayersGameOver(loser) {
    for (var count=0; count<activeGames.length; count++) {
        if (activeGames[count].player1 == loser) { // player 1 is the loser
            console.log("Player " + loser + " has lost to " + activeGames[count].player2);
            var winMSG = JSON.stringify({category: "W"});
            var loseMSG = JSON.stringify({category: "L"});
            activeGames[count].player1Conn.send(loseMSG, 'utf8');
            activeGames[count].player2Conn.send(winMSG, 'utf8');
        }
        else if (activeGames[count].player2 == loser) { // player 2 is the loser
            console.log("Player " + loser + " has lost to " + activeGames[count].player1);
            var winMSG = JSON.stringify({category: "W"});
            var loseMSG = JSON.stringify({category: "L"});
            activeGames[count].player1Conn.send(winMSG, 'utf8');
            activeGames[count].player2Conn.send(loseMSG, 'utf8');
        }
    }
}
function tellTheOtherGuy(givenGuy, thingToTellHim) {    
    for (var count=0; count<activeGames.length; count++) {
        if (activeGames[count].player1 == givenGuy) { 
            activeGames[count].player2Conn.send(thingToTellHim, 'utf8'); 
        }
        else if (activeGames[count].player2 == givenGuy) {  
            activeGames[count].player1Conn.send(thingToTellHim, 'utf8');
        }
    }
}

// UTILITY FUNCTIONS
function guid() {
    function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
}

function getAmountBasedOnRange(numBroken) {
    if (numBroken < 6) { return 1; }
    else if(numBroken < 12) { return 3; }
    else if(numBroken < 20) { return 4; }
    else if(numBroken < 30) { return 5; }
    else { return 6; }
}

function calculateDmgToSend(arrayOfDamage) {
    var total = 0;
    for (var count=0; count<arrayOfDamage.length; count++) {
        total += getAmountBasedOnRange(arrayOfDamage[count]);
        if (count != 0) {total += (count+1);}
    }
    return buildArrayToSend(total);
}

function buildArrayToSend(numOfBlocks) {
    var damageArray = new Uint8Array(7);
    var currentCol = 0;
    for (var c=0; c<numOfBlocks; c++) {
       damageArray[fallOrder[currentCol]] += 1;
       if (currentCol+1 == 7) {currentCol = 0;}
       else { currentCol++; }
    }
    return damageArray;
}



/** ----------------------------------------------------------------------------------- **/
//                                      ONMESSAGE CALLBACKS






/** the person sending this is the person who is challenging another **/
function handleInitateChallenge(challer, challee) {
    // If the challengee is already being challenged by another, don't let this guy
    //      challenge them right now
    if ( isChallengeeInArray(challee) ) {
        console.log(challee + " is already in the array.");
        var whatToSend = JSON.stringify({category: "ChallengeResponse", msg:"Busy"});
        tellPlayer(challer, whatToSend);
    }
    else { // If the challengee is not already being challenged, then proceed
        console.log(challer + " is challenging " + challee);
        pendingChallenges.push({challenger:challer, challengee:challee});
        var whatToSend = JSON.stringify({category: "ChallengedBy", msg:challer});
        tellPlayer(challee, whatToSend);
    }
}

function notifyChallengerTheyDeclined(challee) {
    // Tell the initiator that the challengee has declined
    var whatToSend = JSON.stringify({category: "ChallengeResponse", msg:"Decline"});
    var playerToTell = getChallengerWithChallengee(challee);
    tellPlayer(playerToTell, whatToSend);
    // The game is no longer pending since its not going to ever occur
    removeChallengeeFromArray(challee); 
}

function handleEstablishTheMatch(challee, challeeGuid) {
    // Who initiated the challenge
    var challer = getChallengerWithChallengee(challee);
    var challerUID = getPlayeruuid(challer);
    // Make a session ID for the soon-to-be match
    var gameGuid = guid();
    // Create an entry in active games for this game
    activeGames.push( {player1: challer, 
                       player1Conn: null, 
                       player1uuid: challerUID,
                       player2: challee, 
                       player2Conn: null, 
                       player2uuid: challeeGuid,
                       sessionID: gameGuid} );
    // The pending game is no longer pending, remove it from the array
    removeChallengeeFromArray(challee);
    // Tell the two players to get ready - Expect them to disconnect soon
    var whatToSend = JSON.stringify({category: "LoadGame", msg: gameGuid, pid:challerUID}); 
    tellPlayer(challer, whatToSend); 
    var whatToSend = JSON.stringify({category: "LoadGame", msg: gameGuid, pid:challeeGuid});               
    tellPlayer(challee, whatToSend);
}

function addLobbyGuyToArray(desiredName, wsConn) {
    if (desiredName != "") {
        var nameAlreadyInUse = false;
        // Find out if the name is already in the array
        for (var count=0; count<lobbyFolk.length; count++) {
            if (lobbyFolk[count].name == desiredName) {
                nameAlreadyInUse = true;
            }
        }
        // If it is not in the array, add it
        if (nameAlreadyInUse == false) { // Player Name is not already in the array
            var uuid = guid();
            lobbyFolk.push({name:desiredName, conn:wsConn, Guid:uuid});
            // Tell this guy about everyone else
            var everyoneExceptHim = getAllLobbyPlayerNames(desiredName);
            var whatToSend = JSON.stringify({category: "LobbyList", msg:everyoneExceptHim});
            wsConn.send(whatToSend, 'utf8', function(){});
            // Tell everyone else about this guy
            whatToSend = JSON.stringify({category: "AddedPlayer", msg:desiredName});
            broadcastMessageExcept(whatToSend, desiredName);  
            return {pname: desiredName, pguid: uuid};   
        }
        else { // else if it is in the array, do not add it
            console.log("Player >" + desiredName + "< is already in the array.");
            return false;
        }             
    } 
    else { // else they didn't type a name
        console.log("playerName was empty. They need to type something");
        return false;
    }
}

function setUpGameInArray(gameSessionID, conn, pid) {
    var playerAndLast = false;
    for (var count=0; count<activeGames.length; count++) {    
        if (activeGames[count].sessionID == gameSessionID) {          
            if (activeGames[count].player1uuid == pid) {
                activeGames[count].player1Conn = conn;
                if (activeGames[count].player2Conn != null) { playerAndLast = {pName: activeGames[count].player1, last: true}; }
                else { playerAndLast = {pName: activeGames[count].player1, last: false}; }
            }
            else if (activeGames[count].player2uuid == pid){
                activeGames[count].player2Conn = conn;
                if (activeGames[count].player1Conn != null) { playerAndLast = {pName: activeGames[count].player2, last: true}; }
                else { playerAndLast = {pName: activeGames[count].player2, last: false}; }
            }
            else { console.log("Error: The players PID equaled nobodies?"); }            
            break;
        }// end outer if
    }// end for
    return playerAndLast;
}