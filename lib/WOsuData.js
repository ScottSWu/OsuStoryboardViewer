// beatmap/Beatmap.js
WOsu.Beatmap = function() {
	this.BeatmapData = new WOsu.BeatmapData();
	this.BeatmapEvents = new WOsu.BeatmapEvents();
	this.BeatmapObjects = new WOsu.BeatmapObjects();
}

WOsu.Beatmap.prototype.constructor = WOsu.Beatmap;

WOsu.Beatmap.stringKeys = [
	"AudioFilename","SampleSet",
	
	"Title","Artist","Creator","Version","Source","Tags",
	
	];
WOsu.Beatmap.arrayKeys = [
	
	"EditorBookmarks",
	
	
	];
WOsu.Beatmap.floatKeys = [
	"StackLeniency",
	
	
	"SliderMultiplier","SliderTickRate",
	];
WOsu.Beatmap.integerKeys = [
	"AudioLeadIn","PreviewTime","Mode",
	"BeatDivisor","GridSize",
	
	"HPDrainRate","CircleSize","OverallDifficulty","ApproachRate",
	];
WOsu.Beatmap.booleanKeys = [
	"Countdown","LetterboxInBreaks","StoryFireInFront",
	"DistanceSnap",
	
	
	];
WOsu.Beatmap.isStringKey =	function(key) { return WOsu.Beatmap.stringKeys.indexOf(key)	>=0; }
WOsu.Beatmap.isArrayKey =		function(key) { return WOsu.Beatmap.arrayKeys.indexOf(key)	>=0; }
WOsu.Beatmap.isFloatKey =		function(key) { return WOsu.Beatmap.floatKeys.indexOf(key)	>=0; }
WOsu.Beatmap.isIntegerKey =	function(key) { return WOsu.Beatmap.integerKeys.indexOf(key)>=0; }
WOsu.Beatmap.isBooleanKey =	function(key) { return WOsu.Beatmap.booleanKeys.indexOf(key)>=0; }

WOsu.Beatmap.prototype.setKey = function(obj,key,value) {
	if (WOsu.Beatmap.isStringKey(key)) obj[key] = value;
	else if (WOsu.Beatmap.isArrayKey(key)) obj[key] = value.split(",");
	else if (WOsu.Beatmap.isFloatKey(key)) obj[key] = parseFloat(value);
	else if (WOsu.Beatmap.isIntegerKey(key)) obj[key] = parseInt(value);
	else if (WOsu.Beatmap.isBooleanKey(key)) obj[key] = (value=="true" || value=="1") ? true : false;
}
	
WOsu.Beatmap.eventLayerTypes = [
	"Background",
	"Break",
	"Storyboard Layer 0",
	"Storyboard Layer 1",
	"Storyboard Layer 2",
	"Storyboard Layer 3",
	"Storyboard Sound",
	"Background Colour",
	];
WOsu.Beatmap.getEventLayerType = function(key) {
	for (var i=0; i<this.eventLayerTypes.length; i++) {
		if (key.indexOf(this.eventLayerTypes[i])==0) return i;
	}
	return -1;
}

var globalData;
WOsu.Beatmap.readBeatmapQuick = function(folder,map) {
	var req = new XMLHttpRequest();
	req.open("GET","GetBeatmap.php?folder=" + folder + "&map=" + map,false);
	req.send();
	var res = req.responseText;
	
	if (res.startsWith("Error")) {
		return false;
	}
	var data = eval(res.substring(0,res.indexOf("~~\\e\\~~")));
	globalData = data;
	
	var map = new WOsu.Beatmap();
	map.BeatmapData.head = data.Head;
	
	// Mapped variables
	var line,key,value;
	
	// General
	for (var i=0; i<data.General.length; i++) {
		line = data.General[i].trim();
		if (line.indexOf(":")>0) {
			key = line.substring(0,line.indexOf(":")).trim();
			value = line.substring(line.indexOf(":")+1).trim();
			map.setKey(map.BeatmapData,key,value);
		}
	}
	
	// Editor
	// Unnecessary data
	
	// Metadata
	for (var i=0; i<data.Metadata.length; i++) {
		line = data.Metadata[i].trim();
		if (line.indexOf(":")>0) {
			key = line.substring(0,line.indexOf(":")).trim();
			value = line.substring(line.indexOf(":")+1).trim();
			map.setKey(map.BeatmapData,key,value);
		}
	}
	
	// Difficulty
	for (var i=0; i<data.Difficulty.length; i++) {
		line = data.Difficulty[i].trim();
		if (line.indexOf(":")>0) {
			key = line.substring(0,line.indexOf(":")).trim();
			value = line.substring(line.indexOf(":")+1).trim();
			map.setKey(map.BeatmapData,key,value);
		}
	}
	
	// Events
	var place = -1;
	var link = 0;
	for (var i=0; i<data.Events.length; i++) {
		line = data.Events[i];
		if (line.startsWith("//")) {
			place = WOsu.Beatmap.getEventLayerType(line.substring(2));
		}
		else {
			switch (place) {
				case 0:
					map.BeatmapEvents.BackgroundEvents.push(new WOsu.BackgroundEvent(line)); break;
				case 1:
					// Unnecessary data
				case 2: case 3: case 4: case 5:
					// Unnecessary data
					break;
				case 6:
				case 7:
				default: break;
			}
		}
	}
	
	// Timing Points
	for (var i=0; i<data.TimingPoints.length; i++) {
		line = data.TimingPoints[i];
		map.BeatmapEvents.TimingPoints.push(new WOsu.TimingPoint(line));
	}
	
	// Colours
	// Unnecessary data
	
	// Hit Objects
	// Unnecessary data
	
	return map;
}

WOsu.Beatmap.readBeatmap = function(folder,map) {
	var req = new XMLHttpRequest();
	req.open("GET","GetBeatmap.php?folder=" + folder + "&map=" + map,false);
	req.send();
	var res = req.responseText;
	
	if (res.startsWith("Error")) {
		return false;
	}
	res = res.substring(0,res.indexOf("~~\\e\\~~"));
	globalData = res;
	var data = eval(res);
	globalData = data;
	
	var map = new WOsu.Beatmap();
	map.BeatmapData.head = data.Head;
	
	// Mapped variables
	var line,key,value;
	
	// General
	for (var i=0; i<data.General.length; i++) {
		line = data.General[i].trim();
		if (line.indexOf(":")>0) {
			key = line.substring(0,line.indexOf(":")).trim();
			value = line.substring(line.indexOf(":")+1).trim();
			map.setKey(map.BeatmapData,key,value);
		}
	}
	
	// Editor
	for (var i=0; i<data.Editor.length; i++) {
		line = data.Editor[i].trim();
		if (line.indexOf(":")>0) {
			key = line.substring(0,line.indexOf(":")).trim();
			value = line.substring(line.indexOf(":")+1).trim();
			map.setKey(map.BeatmapData,key,value);
		}
	}
	
	// Metadata
	for (var i=0; i<data.Metadata.length; i++) {
		line = data.Metadata[i].trim();
		if (line.indexOf(":")>0) {
			key = line.substring(0,line.indexOf(":")).trim();
			value = line.substring(line.indexOf(":")+1).trim();
			map.setKey(map.BeatmapData,key,value);
		}
	}
	
	// Difficulty
	for (var i=0; i<data.Difficulty.length; i++) {
		line = data.Difficulty[i].trim();
		if (line.indexOf(":")>0) {
			key = line.substring(0,line.indexOf(":")).trim();
			value = line.substring(line.indexOf(":")+1).trim();
			map.setKey(map.BeatmapData,key,value);
		}
	}
	
	// Events
	var place = -1;
	var link = 0;
	for (var i=0; i<data.Events.length; i++) {
		line = data.Events[i];
		if (line.startsWith("//")) {
			place = WOsu.Beatmap.getEventLayerType(line.substring(2));
		}
		else {
			switch (place) {
				case 0:
					map.BeatmapEvents.BackgroundEvents.push(new WOsu.BackgroundEvent(line)); break;
				case 1:
					map.BeatmapEvents.BreakPeriods.push(new WOsu.BreakPeriod(line)); break;
				case 2:
					map.BeatmapEvents.hasStoryboardBackground = true;
				case 3: case 4: case 5:
					if (line.startsWith(" ")) {
						map.BeatmapEvents.StoryboardObjects[map.BeatmapEvents.StoryboardObjects.length-1].addCommand(line);
					}
					else {
						map.BeatmapEvents.StoryboardObjects.push(new WOsu.StoryboardObject(line));
					}
					break;
				case 6:
				case 7:
				default: break;
			}
		}
	}
	
	// External storyboard
	place = -1;
	link = 0;
	if (data.Storyboard!=undefined) {
		for (var i=0; i<data.Storyboard.length; i++) {
			line = data.Storyboard[i];
			if (line.startsWith("//")) {
				place = WOsu.Beatmap.getEventLayerType(line.substring(2));
			}
			else {
				switch (place) {
					case 0:
						map.BeatmapEvents.BackgroundEvents.push(new WOsu.BackgroundEvent(line)); break;
					case 1:
						map.BeatmapEvents.BreakPeriods.push(new WOsu.BreakPeriod(line)); break;
					case 2:
						map.BeatmapEvents.hasStoryboardBackground = true;
					case 3: case 4: case 5:
						if (line.startsWith(" ")) {
							map.BeatmapEvents.StoryboardObjects[map.BeatmapEvents.StoryboardObjects.length-1].addCommand(line);
						}
						else {
							map.BeatmapEvents.StoryboardObjects.push(new WOsu.StoryboardObject(line));
						}
						break;
					case 6:
					case 7:
					default: break;
				}
			}
		}
		map.BeatmapEvents.hasExternalStoryboard = true;
	}
	
	// Timing Points
	for (var i=0; i<data.TimingPoints.length; i++) {
		line = data.TimingPoints[i];
		map.BeatmapEvents.TimingPoints.push(new WOsu.TimingPoint(line));
	}
	
	/*
	// Colours
	for (var i=0; i<data.Colours.length; i++) {
		line = data.Colours[i];
		if (line.indexOf(":")>0) {
			value = line.substring(line.indexOf(":")+1).trim().split(",");
			map.BeatmapEvents.Colours.push([parseInt(value[0]),parseInt(value[1]),parseInt(value[2])]);
		}
	}
	*/
	
	// Hit Objects
	for (var i=0; i<data.HitObjects.length; i++) {
		line = data.HitObjects[i];
		map.BeatmapObjects.push(WOsu.HitObject.getObject(line));
	}
	
	return map;
}

// beatmap/BeatmapData.js
WOsu.BeatmapData = function() {
	// Program variables
	this.head = "";
	this.AudioElement = null;
	this.BeatMapFileName = "";
	this.SongFileName = "";
	
	// General
	this.AudioFilename = "";
	this.AudioLeadIn = 0;
	this.PreviewTime = 0;
	this.Countdown = false;
	this.SampleSet = "";
	this.StackLeniency = 1;
	this.Mode = 0;
	this.LetterboxInBreaks = false;
	
	// Editor
	this.EditorBookmarks = null;
	this.DistanceSpacing = 1;
	this.BeatDivisor = 4;
	this.GridSize = 4;
	
	// Metadata
	this.Title = "";
	this.Artist = "";
	this.Creator = "";
	this.Version = "";
	this.Source = "";
	this.Tags = "";
	
	// Difficulty
	this.HPDrainRate = 5;
	this.CircleSize = 5;
	this.OverallDifficulty = 5;
	this.ApproachRate = 5;
	this.SliderMultiplier = 1;
	this.SliderTickRate = 1;
}


// beatmap/BeatmapEvents.js
WOsu.BeatmapEvents = function() {
	// Events
	this.BackgroundEvents = new Array();
	this.BreakPeriods = new Array();
	this.StoryboardObjects = new Array();
	this.hasExternalStoryboard = false;
	this.hasStoryboardBackground = false;
	
	// Timing Points
	this.TimingPoints = new Array();
	
	// Colours
	this.Colours = new Array();
}


// beatmap/BeatmapObjects.js
WOsu.BeatmapObjects = function() {
	Array.call(this);
}

WOsu.BeatmapObjects.prototype = Object.create( Array.prototype );


// event/Event.js
WOsu.Event = function(line) {
	this.parseParts = null;
	
	this.type = 0;
	this.time = 0;
	
	this.parse(line);
}

WOsu.Event.prototype.constructor = WOsu.Event;

WOsu.Event.prototype.parse = function(line) {
	this.parseParts = line.split(",");
	
	if (!isNaN(parseInt(this.parseParts[0]))) {
		this.type = parseInt(this.parseParts[0]);
		this.time = parseInt(this.parseParts[1]);
	}
	else {
		if (this.parseParts[0].startsWith("Video")) {
			this.type = WOsu.Event.TYPE_VIDEO;
			this.time = parseInt(this.parseParts[1]);
		}
		else if (this.parseParts[0].startsWith("Sprite")) {
			this.type = WOsu.Event.TYPE_SPRITE;
		}
		else if (this.parseParts[0].startsWith("Animation")) {
			this.type = WOsu.Event.TYPE_ANIMATION;
		}
	}
}

WOsu.Event.TYPE_BACKGROUND		= 0;
WOsu.Event.TYPE_VIDEO			= 1;
WOsu.Event.TYPE_BREAKPERIOD		= 2;
WOsu.Event.TYPE_COLORTRANSFORM	= 3;
WOsu.Event.TYPE_SPRITE			= 4;
WOsu.Event.TYPE_ANIMATION		= 5;


// event/BackgroundEvent.js
WOsu.BackgroundEvent = function(line) {
	WOsu.Event.call(this,line);
	
	this.media = "";
	
	this.parseBackgroundEvent(line);
}

WOsu.BackgroundEvent.prototype = Object.create( WOsu.Event.prototype );

WOsu.BackgroundEvent.prototype.parseBackgroundEvent = function(line) {
	this.parse(line);
	
	this.media = this.parseParts[2].replace(/\"/g,"").replace(/\\/g,"/");
}

// event/BreakPeriod.js
WOsu.BreakPeriod = function(line) {
	WOsu.Event.call(this,line);
	
	this.endTime = 0;
	
	this.parseBreakPeriod(line);
}

WOsu.BreakPeriod.prototype = Object.create( WOsu.Event.prototype );

WOsu.BreakPeriod.prototype.parseBreakPeriod = function(line) {
	this.parse(line);
	
	this.endTime = parseInt(this.parseParts[2]);
}

// event/StoryboardEvent.js
WOsu.StoryboardEvent = function(line,link,comp) {
	this.parseParts = null;
	
	this.eventType = 0;
	this.compound = false;
	this.easing = 0;
	this.startTime = 0;
	this.endTime = 0;
	this.loopLink = -1;
	this.loopStartTime = -1;
	this.loopEndTime = -1;
	this.startX = 0;
	this.startY = 0;
	this.startZ = 0;
	this.endX = 0;
	this.endY = 0;
	this.endZ = 0;
	
	this.parseStoryboardEvent(line,link,comp);
}

WOsu.StoryboardEvent.prototype.constructor = WOsu.StoryboardEvent;

WOsu.StoryboardEvent.prototype.parseStoryboardEvent = function(line,link,comp) {
	this.parseParts = line.split(",");
	
	if (link!==undefined && link!=null) this.loopLink = link;
	if (comp!==undefined && comp!=null) this.compound = comp;
	
	if (this.parseParts[0]=="L") {
		this.eventType = WOsu.StoryboardEvent.TYPE_L;
		this.startTime = parseInt(this.parseParts[1]);
		this.loopStartTime = -1;
		this.loopEndTime = -1;
		this.startX = parseInt(this.parseParts[2]);
	}
	else if (this.parseParts[0]=="T") {
		this.eventType = WOsu.StoryboardEvent.TYPE_T;
	}
	else {
		this.easing = parseInt(this.parseParts[1]);
		this.startTime = parseInt(this.parseParts[2]);
		if (this.parseParts[3]=="") this.endTime = this.startTime;
		else this.endTime = parseInt(this.parseParts[3]);
		
		if (this.parseParts[0]=="F") {
			this.eventType = WOsu.StoryboardEvent.TYPE_F;
			this.startX = parseFloat(this.parseParts[4]);
			if (this.parseParts.length>5) {
				this.endX = parseFloat(this.parseParts[5]);
			}
			else {
				this.endX = this.startX;
			}
		}
		else if (this.parseParts[0]=="M") {
			this.eventType = WOsu.StoryboardEvent.TYPE_M;
			this.startX = parseInt(this.parseParts[4]);
			this.startY = parseInt(this.parseParts[5]);
			if (this.parseParts.length>6) {
				this.endX = parseInt(this.parseParts[6]);
				this.endY = parseInt(this.parseParts[7]);
			}
			else {
				this.endX = this.startX;
				this.endY = this.startY;
			}
		}
		else if (this.parseParts[0]=="MX") {
			this.eventType = WOsu.StoryboardEvent.TYPE_MX;
			this.startX = parseInt(this.parseParts[4]);
			if (this.parseParts.length>5) {
				this.endX = parseInt(this.parseParts[5]);
			}
			else {
				this.endX = this.startX;
			}
		}
		else if (this.parseParts[0]=="MY") {
			this.eventType = WOsu.StoryboardEvent.TYPE_MY;
			this.startY = parseInt(this.parseParts[4]);
			if (this.parseParts.length>5) {
				this.endY = parseInt(this.parseParts[5]);
			}
			else {
				this.endY = this.startY;
			}
		}
		else if (this.parseParts[0]=="S") {
			this.eventType = WOsu.StoryboardEvent.TYPE_S;
			this.startX = parseFloat(this.parseParts[4]);
			if (this.parseParts.length>5) {
				this.endX = parseFloat(this.parseParts[5]);
			}
			else {
				this.endX = this.startX;
			}
		}
		else if (this.parseParts[0]=="V") {
			this.eventType = WOsu.StoryboardEvent.TYPE_V;
			this.startX = parseFloat(this.parseParts[4]);
			this.startY = parseFloat(this.parseParts[5]);
			if (this.parseParts.length>6) {
				this.endX = parseFloat(this.parseParts[6]);
				this.endY = parseFloat(this.parseParts[7]);
			}
			else {
				this.endX = this.startX;
				this.endY = this.startY;
			}
		}
		else if (this.parseParts[0]=="R") {
			this.eventType = WOsu.StoryboardEvent.TYPE_R;
			this.startX = parseFloat(this.parseParts[4]);
			if (this.parseParts.length>5) {
				this.endX = parseFloat(this.parseParts[5]);
			}
			else {
				this.endX = this.startX;
			}
		}
		else if (this.parseParts[0]=="C") {
			this.eventType = WOsu.StoryboardEvent.TYPE_C;
			this.startX = parseInt(this.parseParts[4]);
			this.startY = parseInt(this.parseParts[5]);
			this.startZ = parseInt(this.parseParts[6]);
			if (this.parseParts.length>7) {
				this.endX = parseInt(this.parseParts[6]);
				this.endY = parseInt(this.parseParts[7]);
				this.endZ = parseInt(this.parseParts[8]);
			}
			else {
				this.endX = this.startX;
				this.endY = this.startY;
				this.endZ = this.startZ;
			}
		}
		else if (this.parseParts[0]=="P") {
			this.eventType = WOsu.StoryboardEvent.TYPE_P;
			if (this.parseParts[4][0]=="H") {
				this.startX = 0;
			}
			else if (this.parseParts[4][0]=="V") {
				this.startX = 1;
			}
			else if (this.parseParts[4][0]=="A") {
				this.startX = 2;
			}
		}
	}
}

WOsu.StoryboardEvent.prototype.isInstant = function() { return this.startTime==this.endTime; }

WOsu.StoryboardEvent.TYPE_F		= 0;
WOsu.StoryboardEvent.TYPE_M		= 1;
WOsu.StoryboardEvent.TYPE_MX	= 2;
WOsu.StoryboardEvent.TYPE_MY	= 3;
WOsu.StoryboardEvent.TYPE_S		= 4;
WOsu.StoryboardEvent.TYPE_V		= 5;
WOsu.StoryboardEvent.TYPE_R		= 6;
WOsu.StoryboardEvent.TYPE_C		= 7;
WOsu.StoryboardEvent.TYPE_P		= 8;
WOsu.StoryboardEvent.TYPE_L		= 9;
WOsu.StoryboardEvent.TYPE_T		= 10;

// event/StoryboardObject.js
WOsu.StoryboardObject = function(line) {
	WOsu.Event.call(this,line);
	
	this.startTime = 0;
	this.endTime = 0;
	this.layer = 0;
	this.origin = 0;
	this.filePath = "";
	this.x = 0;
	this.y = 0;
	this.offsetX = 0;
	this.offsetY = 0;
	this.frameCount = 0;
	this.frameDelay = 0;
	this.loopType = 0;
	this.events = new Array(0);
	this.hasCompound = false;
	
	this.fade = 1;
	this.scaleX = 1;
	this.scaleY = 1;
	this.rotation = 0;
	this.r = 1;
	this.g = 1;
	this.b = 1;
	this.parameterH = false;
	this.parameterV = false;
	this.parameterA = false;
	
	this.parseStoryboardObject(line);
}

WOsu.StoryboardObject.prototype = Object.create( WOsu.Event.prototype );

WOsu.StoryboardObject.prototype.clone = function() {
	var original = this;
	clone = {};
	for (var i in original) {
		clone[i] = original[i];
	}
	return clone;
}

WOsu.StoryboardObject.prototype.parseStoryboardObject = function(line) {
	this.parse(line);
	
	if (this.parseParts[1]=="Background") {
		this.layer = 0;
	}
	else if (this.parseParts[1]=="Fail") {
		this.layer = 1;
	}
	else if (this.parseParts[1]=="Pass") {
		this.layer = 2;
	}
	else if (this.parseParts[1]=="Foreground") {
		this.layer = 3;
	}
	else {
		this.layer = parseInt(this.parseParts[1]);
		if (isNaN(this.layer)) this.layer = 0;
	}
	
	if (this.parseParts[2]=="TopLeft") {
		this.origin = 0;
	}
	else if (this.parseParts[2]=="TopCentre") {
		this.origin = 1;
	}
	else if (this.parseParts[2]=="TopRight") {
		this.origin = 2;
	}
	else if (this.parseParts[2]=="CentreLeft") {
		this.origin = 3;
	}
	else if (this.parseParts[2]=="Centre") {
		this.origin = 4;
	}
	else if (this.parseParts[2]=="CentreRight") {
		this.origin = 5;
	}
	else if (this.parseParts[2]=="BottomLeft") {
		this.origin = 6;
	}
	else if (this.parseParts[2]=="BottomCentre") {
		this.origin = 7;
	}
	else if (this.parseParts[2]=="BottomRight") {
		this.origin = 8;
	}
	else {
		this.origin = parseInt(this.parseParts[2]);
		if (isNaN(this.origin)) {
			this.origin = 0;
		}
	}
	
	this.filepath = this.parseParts[3].replace(/\"/g,"").replace(/\\/g,"/");
	this.x = parseInt(this.parseParts[4]);
	this.y = parseInt(this.parseParts[5]);
	
	if (this.type==WOsu.Event.TYPE_ANIMATION) {
		this.frameCount = parseInt(this.parseParts[6]);
		this.frameDelay = parseInt(this.parseParts[7]);
		if (this.parseParts[8]=="LoopForever") {
			this.loopType = 0;
		}
		else if (this.parseParts[8]=="LoopOnce") {
			this.loopType = 1;
		}
		else {
			this.loopType = parseInt(this.parseParts[8]);
			if (isNaN(this.loopType)) this.loopType = 1;
		}
	}
}

WOsu.StoryboardObject.prototype.isVisible = function(time) {
	if (time>this.endTime || time<this.startTime) return false;
	return true;
	
	/*
	var relativeTime;
	if (this.time>this.endTime) return false;
	for (var i=this.events.length-1; i>=0; i--) {
		if (!this.events[i].compound) {
			if (this.events[i].type==WOsu.StoryboardEvent.TYPE_L) {
				if (this.time>this.events[i].endTime) return false;
				else if (this.time>=this.events[i].startTime+this.events[i].loopStartTime) return true;
			}
			else {
				if (this.events[i].startTime<=this.time) {
					return true;
				}
			}
		}
	}
	return false;
	*/
}

WOsu.StoryboardObject.prototype.addCommand = function(line) {
	var event,newEvent;
	if (line.startsWith("  ")) {
		for (var i=this.events.length-1; i>=0; i--) {
			event = this.events[i];
			if (event.eventType==WOsu.StoryboardEvent.TYPE_L || event.eventType==WOsu.StoryboardEvent.TYPE_T) {
				this.hasCompound = true;
				newEvent = new WOsu.StoryboardEvent(line.substring(2),i,true);
				this.events.push(newEvent);
				event.endX = this.events.length-1;
				if (event.loopStartTime==-1 || newEvent.startTime<event.loopStartTime) {
					event.loopStartTime = newEvent.startTime;
				}
				if (event.loopEndTime==-1 || newEvent.endTime>event.loopEndTime) {
					event.loopEndTime = newEvent.endTime;
					event.endTime = event.startTime + event.loopStartTime + (newEvent.endTime-event.loopStartTime)*event.startX;
				}
				break;
			}
		}
	}
	else {
		this.events.push(new WOsu.StoryboardEvent(line.substring(1)));
	}
}

WOsu.StoryboardObject.prototype.getImageFile = function(n) {
	if (this.type==WOsu.Event.TYPE_SPRITE) {
		return this.filepath;
	}
	else if (this.type==WOsu.Event.TYPE_ANIMATION) {
		return this.filepath.substring(0,this.filepath.lastIndexOf(".")) + n + this.filepath.substring(this.filepath.lastIndexOf("."));
	}
	return this.filepath;
}

WOsu.StoryboardObject.prototype.getNumberImages = function() {
	if (this.type==WOsu.Event.TYPE_SPRITE) {
		return 1;
	}
	else if (this.type==WOsu.Event.TYPE_ANIMATION) {
		return this.frameCount;
	}
	return this.frameCount;
}


// event/TimingPoint.js
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

// event/ColourEvent.js
WOsu.ColourEvent = function(line) {
	WOsu.Event.call(this,line);
	
	this.r = 255;
	this.g = 255;
	this.b = 255;
	
	this.parseColourEvent(line);
}

WOsu.ColourEvent.prototype = Object.create( WOsu.Event.prototype );

WOsu.ColourEvent.prototype.parseColourEvent = function(line) {
	this.parse(line);
	
	this.r = parseInt(this.parseParts[2]);
	this.g = parseInt(this.parseParts[3]);
	this.b = parseInt(this.parseParts[4]);
}

// object/HitObject.js
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

// object/SliderObject.js
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

// object/SpinnerObject.js
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

// math/Matrix3.js
WOsu.Matrix3 = function(args) {
	this.matrix = new Array(9);
	try {
		this.matrix = [ 1,0,0, 0,1,0, 0,0,1 ];
		if (args.length==1 && args[0]==0) {
			this.matrix = [ 0,0,0, 0,0,0, 0,0,0 ];
		}
		else if (args.length==4) {
			this.matrix[0] = args[0];
			this.matrix[1] = args[1];
			this.matrix[3] = args[2];
			this.matrix[4] = args[3];
		}
		else if (args.length>=6) {
			for (var i=0; i<args.length; i++) this.matrix[i] = args[i];
		}
	}
	catch (err) {
		this.matrix = [ 1,0,0, 0,1,0, 0,0,1 ];
	}
}

WOsu.Matrix3.prototype.constructor = WOsu.Matrix3;

WOsu.Matrix3.getRotation = function(theta) {
	return new WOsu.Matrix3([Math.cos(theta),-Math.sin(theta),Math.sin(theta),Math.cos(theta)]);
}

WOsu.Matrix3.getScale = function(x,y) {
	return new WOsu.Matrix3([ x,0,0, 0,y,0, 0,0,1 ]);
}

WOsu.Matrix3.getTranslation = function(x,y) {
	return new WOsu.Matrix3([ 1,0,x, 0,1,y, 0,0,1 ]);
}

WOsu.Matrix3.prototype.clone = function() {
	return new WOsu.Matrix3(this.matrix);
}

WOsu.Matrix3.prototype.reset = function() {
	this.matrix = [ 1,0,0, 0,1,0, 0,0,1 ];
}

WOsu.Matrix3.prototype.multiply = function(mat2) {
	this.matrix = [
		this.matrix[0]*mat2.matrix[0] + this.matrix[1]*mat2.matrix[3] + this.matrix[2]*mat2.matrix[6],
		this.matrix[0]*mat2.matrix[1] + this.matrix[1]*mat2.matrix[4] + this.matrix[2]*mat2.matrix[7],
		this.matrix[0]*mat2.matrix[2] + this.matrix[1]*mat2.matrix[5] + this.matrix[2]*mat2.matrix[8],
		this.matrix[3]*mat2.matrix[0] + this.matrix[4]*mat2.matrix[3] + this.matrix[5]*mat2.matrix[6],
		this.matrix[3]*mat2.matrix[1] + this.matrix[4]*mat2.matrix[4] + this.matrix[5]*mat2.matrix[7],
		this.matrix[3]*mat2.matrix[2] + this.matrix[4]*mat2.matrix[5] + this.matrix[5]*mat2.matrix[8],
		this.matrix[6]*mat2.matrix[0] + this.matrix[7]*mat2.matrix[3] + this.matrix[8]*mat2.matrix[6],
		this.matrix[6]*mat2.matrix[1] + this.matrix[7]*mat2.matrix[4] + this.matrix[8]*mat2.matrix[7],
		this.matrix[6]*mat2.matrix[2] + this.matrix[7]*mat2.matrix[5] + this.matrix[8]*mat2.matrix[8]
	];
}

WOsu.Matrix3.prototype.multiplyB = function(mat2) {
	this.matrix = [
		mat2.matrix[0]*this.matrix[0] + mat2.matrix[1]*this.matrix[3] + mat2.matrix[2]*this.matrix[6],
		mat2.matrix[0]*this.matrix[1] + mat2.matrix[1]*this.matrix[4] + mat2.matrix[2]*this.matrix[7],
		mat2.matrix[0]*this.matrix[2] + mat2.matrix[1]*this.matrix[5] + mat2.matrix[2]*this.matrix[8],
		mat2.matrix[3]*this.matrix[0] + mat2.matrix[4]*this.matrix[3] + mat2.matrix[5]*this.matrix[6],
		mat2.matrix[3]*this.matrix[1] + mat2.matrix[4]*this.matrix[4] + mat2.matrix[5]*this.matrix[7],
		mat2.matrix[3]*this.matrix[2] + mat2.matrix[4]*this.matrix[5] + mat2.matrix[5]*this.matrix[8],
		mat2.matrix[6]*this.matrix[0] + mat2.matrix[7]*this.matrix[3] + mat2.matrix[8]*this.matrix[6],
		mat2.matrix[6]*this.matrix[1] + mat2.matrix[7]*this.matrix[4] + mat2.matrix[8]*this.matrix[7],
		mat2.matrix[6]*this.matrix[2] + mat2.matrix[7]*this.matrix[5] + mat2.matrix[8]*this.matrix[8]
	];
}

WOsu.Matrix3.multiply = function(mat1,mat2) {
	return new WOsu.Matrix3([
		mat1.matrix[0]*mat2.matrix[0] + mat1.matrix[1]*mat2.matrix[3] + mat1.matrix[2]*mat2.matrix[6],
		mat1.matrix[0]*mat2.matrix[1] + mat1.matrix[1]*mat2.matrix[4] + mat1.matrix[2]*mat2.matrix[7],
		mat1.matrix[0]*mat2.matrix[2] + mat1.matrix[1]*mat2.matrix[5] + mat1.matrix[2]*mat2.matrix[8],
		mat1.matrix[3]*mat2.matrix[0] + mat1.matrix[4]*mat2.matrix[3] + mat1.matrix[5]*mat2.matrix[6],
		mat1.matrix[3]*mat2.matrix[1] + mat1.matrix[4]*mat2.matrix[4] + mat1.matrix[5]*mat2.matrix[7],
		mat1.matrix[3]*mat2.matrix[2] + mat1.matrix[4]*mat2.matrix[5] + mat1.matrix[5]*mat2.matrix[8],
		mat1.matrix[6]*mat2.matrix[0] + mat1.matrix[7]*mat2.matrix[3] + mat1.matrix[8]*mat2.matrix[6],
		mat1.matrix[6]*mat2.matrix[1] + mat1.matrix[7]*mat2.matrix[4] + mat1.matrix[8]*mat2.matrix[7],
		mat1.matrix[6]*mat2.matrix[2] + mat1.matrix[7]*mat2.matrix[5] + mat1.matrix[8]*mat2.matrix[8]
	]);
}

WOsu.Matrix3.prototype.getCSS3Transform = function() {
	return "matrix(" + [this.matrix[0],this.matrix[3],this.matrix[1],this.matrix[4],this.matrix[2],this.matrix[5]].join() + ")";
}

