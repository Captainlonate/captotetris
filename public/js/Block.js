


function Block(isAStone) {

	function powerConstructor(isAStone) {
		var retObject = new Object();
		// Set a random color
		var color = Math.floor((Math.random()*4)+1);
		// Set the stone status
		var isCementStone = isAStone;
		var isGreyStone = false;
		var usable = !isAStone;
		var imageName = null;
		// Stones cannot be breakers
		var isBreaker = false;
		// If it's not stone, determine if it's a breaker
		if ( isAStone == false ) { 
			isBreaker = (Math.floor((Math.random()*10)+1) >= 9) ? true : false;
		}


		retObject.getColor = function() { return color; }
		retObject.getBreakerStatus = function() { return isBreaker; }
		retObject.isStone = function() { return isCementStone; }
		retObject.isGrey = function() { return isGreyStone; }
		retObject.isUsable = function(){ return usable };
		retObject.getImageName = function() { return imageName;	}
		retObject.updateStoneStatus = function() {
			if (isCementStone == true) {isCementStone = false; isGreyStone = true; retObject.updateImageName();}
			else if(isGreyStone == true) {isGreyStone = false; usable = true; retObject.updateImageName();}
		}		
		retObject.updateImageName = function() {
			if (isBreaker == false) { 
					if (isCementStone == true) { imageName = "CementBlock";	}
					else if(isGreyStone == true) { 
						switch(color) { 
						case 1:  imageName = "BlueGreyBlock"; break;
						case 2:  imageName = "RedGreyBlock"; break;
						case 3:  imageName = "GreenGreyBlock"; break;
						case 4:  imageName = "YellowGreyBlock"; break;
						}
					}
					else  { // If regular block
						switch(color) { 
						case 1:  imageName = "BlueBlock"; break;
						case 2:  imageName = "RedBlock"; break;
						case 3:  imageName = "GreenBlock"; break;
						case 4:  imageName = "YellowBlock"; break;
						}
					}							
			} 
			else { // If breaker
					switch(color) {							
					case 1:  imageName = "BlueBreaker"; break;
					case 2:  imageName = "RedBreaker"; break;
					case 3:  imageName = "GreenBreaker"; break;
					case 4:  imageName = "YellowBreaker"; break;
					}
			}
		}
		
		retObject.updateImageName();

		return retObject;
	} // end powerConstructor



	return powerConstructor(isAStone);
} // end Block()