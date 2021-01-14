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