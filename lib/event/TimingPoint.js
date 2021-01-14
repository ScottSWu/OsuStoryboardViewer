WOsu.TimingPoint = function(line) {
	this.parseParts = null;
	
	this.time = 0;
	this.bpm = 0;
	this.meter = 4;
	this.sampletype = 0;
	this.sampleset = 0;
	this.volume = 0;
	this.inherited = false;
	this.ki = false;
	
	this.parse(line);
}

WOsu.TimingPoint.prototype.constructor = WOsu.TimingPoint;

WOsu.TimingPoint.prototype.parse = function(line) {
	this.parseParts = line.split(",");
	
	this.time = parseInt(this.parseParts[0]);
	this.bpm = parseFloat(this.parseParts[1]);
	this.meter = parseInt(this.parseParts[2]);
	this.sampletype = parseInt(this.parseParts[3]);
	this.sampleset = parseInt(this.parseParts[4]);
	this.volume = parseFloat(this.parseParts[5]);
	this.inherited = (this.parseParts[6]=="0") ? true : false;
	this.ki = (this.parseParts[7]=="0") ? true : false;
}