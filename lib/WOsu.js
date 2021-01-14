WOsu = function() {
	this.instance = this;
}

WOsu.prototype.constructor = WOsu;

String.prototype.startsWith = function(str) {
	return this.slice(0,str.length)==str;
}

String.prototype.endsWith = function(str) {
	return this.slice(-str.length)==str;
}