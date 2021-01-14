WOsu.HitObject = function(line) {
	this.parseParts = null;
	
	this.x = 0; // X coordinate (0-512)
	this.y = 0; // Y coordinate (0-392)
	this.time = 0; // Milliseconds after the beginning of the song
	this.type; // Bit (3,2,1,0) -> (Spinner,New combo,Slider,Beat)
	this.combo = 0; // Combo color
	this.comboNumber = 1; // Combo number
	this.hitsound = 0; // Hit sound; Bit (3,2,1,0) -> (Clap,Finish,Whistle,Normal)
	
	this.parse(line);
}

WOsu.HitObject.getObject = function(line) {
	var t = new WOsu.HitObject(line);
	if ((t.type & 8)==8) {
		t = new WOsu.SpinnerObject(line);
	}
	else if ((t.type & 2)==2) {
		t = new WOsu.SliderObject(line);
	}
	return t;
}

WOsu.HitObject.prototype.constructor = WOsu.HitObject;

WOsu.HitObject.prototype.parse = function(line) {
	this.parseParts = line.split(",");
	this.x = parseInt(this.parseParts[0]);
	this.y = parseInt(this.parseParts[1]);
	this.time = parseInt(this.parseParts[2]);
	this.type = parseInt(this.parseParts[3]);
	this.hitsound = parseInt(this.parseParts[4]);
}