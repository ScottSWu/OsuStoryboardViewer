WOsu.SliderObject = function(line) {
	WOsu.HitObject.call(this,line);
	
	this.controlX = new Array(0); // Control X coordinates of the slider
	this.controlY = new Array(0); // Control Y coordinates of the slider
	this.repeats = 0; // Repeats
	this.curve = new Array(0); // Generated curve points
	this.sliderSpeed = 0; // Slider speed (osupixels)
	this.sliderLength = 0; // Slider length (pixels)
	this.sliderHitsounds = new Array(0); // Slider hit sounds
	this.endX = 0; // End X coordinate
	this.endY = 0; // End Y coordinate
	
	this.parseSliderObject(line);
}

WOsu.SliderObject.prototype = Object.create( WOsu.HitObject.prototype );

WOsu.SliderObject.prototype.parseSliderObject = function(line) {
	this.parse(line);
	
	var points = this.parseParts[5].split("\\|");
	for (var i=1; i<points.length; i++) {
		this.controlX.push(parseInt(points[i].substring(0,points[i].indexOf(":"))));
		this.controlY.push(parseInt(points[i].substring(points[i].indexOf(":")+1)));
	}
	this.repeats = parseInt(this.parseParts[6]);
	this.sliderSpeed = parseFloat(this.parseParts[7]);
	if (this.parseParts.length>8) {
		points = this.parseParts[8].split("\\|");
		for (var i=0; i<points.length; i++) {
			this.sliderHitsounds.push(parseInt(points[i]));
		}
	}
}