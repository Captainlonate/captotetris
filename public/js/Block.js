


function Block(isAStone) {
	// Set a random color
	this.color = Math.floor((Math.random()*4)+1);
	// Set the stone status
	this.isStone = isAStone;
	// Based on whether or not it's stone, determine if it is a breaker
	this.isBreaker = false;
	if ( isAStone == false ) { // If it's not stone, determine if it's a breaker
		this.isBreaker = (Math.floor((Math.random()*10)+1) >= 9) ? true : false;
	}
}

_p = Block.prototype;

_p.getColor = function() {
	return this.color;
};
_p.getBreakerStatus = function() {
	return this.isBreaker;
};
_p.isStone = function() {
	return this.isStone;
};
