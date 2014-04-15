/**
 * Image manager is responsible for loading multiple images and
 * notifying about load progress, errors and the end of current
 * download queue.
 * 
 * Really there is nothing complicated about an ImageManager. It performs TWO basic functions:
 * 		1) it holds an array of all the images and lets you retrieve them by using the get() function
 * 		2) It allows you to use a "key" to access the images, such as "tree" to access "img/palmTree1.png"
 */
function ImageManager(placeholderDataUri) {
	this._images = {};
	if (placeholderDataUri) {
		this._placeholder = new Image();
		this._placeholder.src = placeholderDataUri;
	}
}

_p = ImageManager.prototype;



/**
 * This is sorta like the init method for an ImageManager
 * Basically, after an ImageManager is created, load is called on an array of images.
 * These images come in a Key - Value pair.
 * It might have actually made more sense to just include this in the constructor :/ 
 */
_p.load = function(images, onDone, onProgress) {
    // The images queue
    var queue = []; // Make an empty array
    // Make a "dictionary" object for each of the images sent in, then put each dictionary object into the array
    for (var im in images) {
        queue.push({
            key: im,
            path: images[im]
        });
    }
	
	// If there weren't actually any images passed in, then just go ahead and be done
	if (queue.length == 0) {
		onProgress && onProgress(0, 0, null, null, true);
        onDone && onDone();
		return;
	}
	
	// Item counter knows two things: How many items have been loaded, and how many items there are total to load
	var itemCounter = {
		loaded: 0,
		total: queue.length
	};

	// For every item that we have to load, call loadItem() on it
	for (var i = 0; i < queue.length; i++) {
		this._loadItem(queue[i], itemCounter, onDone, onProgress);
	}
};



/**
 * load() calls this method for every item in the queue
 *  
 */
_p._loadItem = function(queueItem, itemCounter, onDone, onProgress) {
	var self = this;
	var img = new Image(); // this is actually an HTML5 Dom object. Not part of this framework
	// register this callback for when the image finishes loading
	img.onload = function() {
		self._images[queueItem.key] = img; // add the recently loaded image object to the global variable this._images, which is queried in get()
		self._onItemLoaded(queueItem, itemCounter, onDone, onProgress, true);
	};
	// If an error occurs when loading the image
	img.onerror = function() {
		self._images[queueItem.key] = self._placeholder ? self._placeholder : null;
		self._onItemLoaded(queueItem, itemCounter, onDone, onProgress, false);
	};
	// img.src will look something like this: http://localhost:8000/img/PalmTree1.png 
	img.src = queueItem.path;
};



/**
 * loadItem calls this method once an image has been finished loading and has been added to the global array variable, this._images
 * This function basically just increases itemCounter.loaded since the only way to get here is to successfully load an image
 * It also checks to see if this was the last image needing to be loaded. If it was the last image to load, then call the onDone() method
 * 			that was passed in to load()
 */
_p._onItemLoaded = function(queueItem, itemCounter, onDone, onProgress, success) {
	itemCounter.loaded++; // recall that item counter has: loaded and total
	onProgress && onProgress(itemCounter.loaded, itemCounter.total, queueItem.key, queueItem.path, success);
    if (itemCounter.loaded == itemCounter.total) {
        onDone && onDone();
    }
};

/**
 * Returms the loaded image by the given value
 * @param key image alias
 * For instance, in Game.js we declare images like this:     "tree": "img/PalmTree1.png"
 * 		So in this case "tree" is the alias... or the "key"
 * What it's actually returning is something like this: <img src="img/PalmTree1.png">
 */
_p.get = function(key) {
	return this._images[key];
};






