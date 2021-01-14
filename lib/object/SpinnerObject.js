WOsu.SpinnerObject = function(line) {
	WOsu.HitObject.call(this,line);
	
	this.spinnerTime = 0; // Spinner time
	
	this.parseSpinnerObject(line);
}

WOsu.SpinnerObject.prototype = Object.create( WOsu.HitObject.prototype );

WOsu.SpinnerObject.prototype.parseSpinnerObject = function(line) {
	this.parse(line);
	
	this.spinnerTime = parseInt(this.parseParts[5]);
}