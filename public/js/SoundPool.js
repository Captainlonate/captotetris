/**
 * A sound pool to use for the sound effects
 */
function SoundPool(maxSize) {
	var size = maxSize; // Max sounds allowed in the pool
	var pool = [];
	this.pool = pool;
	var currSound = 0;
	/*
	 * Populates the pool array with the given sound
	 */
	this.init = function(object) {
		if (object == "tink") {
			for (var i = 0; i < size; i++) {
				// Initalize the sound
				tink = new Audio("../audio/tink.wav");
				tink.volume = .12;
				tink.load();
				pool[i] = tink;
			}
		}		
		else if (object == "success") {
			for (var i = 0; i < size; i++) {
				var success = new Audio("../audio/success.wav");
				success.volume = .1;
				success.load();
				pool[i] = success;
			}
		}
	};
	/*
	 * Plays a sound
	 */
	this.get = function() {
		if(pool[currSound].currentTime == 0 || pool[currSound].ended) {
			pool[currSound].play();
		}
		currSound = (currSound + 1) % size;
	};
}