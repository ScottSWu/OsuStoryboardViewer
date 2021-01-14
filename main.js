/*
	Web Osu!
	
	Scott Wu (funnytrees)
*/

// DOM Elements
var audio,options;

// ===== Interface functions =====

// body.onload
function init() {
	// Display size
	WOsu.width = window.innerWidth;
	WOsu.height = window.innerHeight;
	
	// Initialize a blank jPlayer instance
	initialize_options();
	
	// Get a list of songs
	initialize_songs();
}

// Create and set up the options panel
function initialize_options() {
	options = document.getElementById("optionsContainer")
	
	audio = $("#jquery_jplayer_1");
	audio.jPlayer({
		ready: function(event) {
			console.log("jPlayer loaded");
			options.selections = document.getElementById("optionsLeft");
			options.slider = document.getElementById("optionsSlider");
			options.slider.style.height = options.selections.offsetHeight + "px";
			options.slider.onclick = options_expand;
			options.isHidden = true;
			options.style.left = (-options.slider.offsetLeft) + "px";
		},
		swfPath: "ext/jquery.jplayer.swf",
		volume: 0.5
    });
}

function options_expand(event) {
	if (options.isHidden) {
		options.style.left = (-options.slider.offsetLeft) + "px";
		options.isHidden= false;
	}
	else {
		options.style.left = "10px";
		options.isHidden = true;
	}
}

// Gameplay options
function options_change_gameplay(event) {
	var check = document.getElementById("option_gameplay");
	if (check.checked) {
		document.getElementById("option_auto").disabled = false;
		document.getElementById("option_replay").disabled = false;
	}
	else {
		document.getElementById("option_auto").disabled = true;
		document.getElementById("option_replay").disabled = true;
	}
}

function options_change_auto(event) {
	var check = document.getElementById("option_auto");
	if (check.checked) {
		document.getElementById("option_replay").disabled = true;
	}
	else {
		document.getElementById("option_replay").disabled = false;
	}
}

// Upload replay
function options_upload_replay(event) {
	var form = document.getElementById("optionsForm");
	form.submit();
}

var replaydata = null;
function options_check_replay() {
	var data = document.getElementById("fileSubmit").contentDocument.body.innerHTML;
	if (data.length>1 && data[0]!="0") {
		document.getElementById("fileInfo").innerHTML = "<span class=\"info_good\">Replay successfully read.</span>";
		replaydata = data.substring(1,data.indexOf("~~\\e\\~~"));
	}
	else {
		document.getElementById("fileInfo").innerHTML = "<span class=\"info_error\">" + data.substring(1,data.indexOf("~~\\e\\~~")) + "</span>";
	}
}

// Generate the song list menu
function initialize_menu() {
	var menu = document.createElement("div");
	menu.setAttribute("id","menu");
	
	var out = "";
	out += "<div class=\"title\">List of beatmaps:</div><hr />\n";
	for (var i=0; i<songs.length; i++) {
		out += "<div class=\"tree_indicator\" id=\"ti" + i + "\">&gt;</div>\n";
		out += "<div class=\"song_item\" id=\"si" + i + "\" onclick=\"javascript: song_expand(" + i + ");\">" + songs[i][0] + "</div>\n";
		out += "<div class=\"group_item\" id=\"gi" + i + "\">\n";
		for (var j=1; j<songs[i].length; j++) {
			out += "<div class=\"map_item\" onclick=\"javascript: launch_storyboard(" + i + "," + j + ");\">" + songs[i][j] + "</div>\n";
		}
		out += "</div>\n";
	}
	
	menu.innerHTML = out;
	document.getElementById("selectionContainer").appendChild(menu);
}

// Expand/contract a song entry
function song_expand(k) {	
	var group = document.getElementById("gi" + k);
	if (group.offsetHeight==0) {
		document.getElementById("ti" + k).innerHTML = "&or;";
		song_anim_expand(group,0);
	}
	else {
		document.getElementById("ti" + k).innerHTML = "&gt;";
		song_anim_contract(group,group.offsetHeight);
	}
}

// Animation callback for expanding
function song_anim_expand(group,k) {
	group.style.maxHeight = k + "px";
	if (group.offsetHeight!=k) return;
	setTimeout(function() { song_anim_expand(group,k+5); },10);
}

// Animation callback for contracting
function song_anim_contract(group,k) {
	if (k<0) k = 0;
	group.style.maxHeight = k + "px";
	if (group.offsetHeight<=0) return;
	setTimeout(function() { song_anim_contract(group,k-5); },10);
}

var songs;
// Get the list of songs
function initialize_songs() {
	var req = new XMLHttpRequest();
	req.open("GET","GetSongs.php",true);
	req.onreadystatechange = function() {
		if (req.readyState==4 && req.status==200) {
			if (req.responseText[0]!="0") {
				songs = eval(req.responseText.substring(0,req.responseText.indexOf("~~\\e\\~~")));
				for (var i=0; i<songs.length; i++) {
					if (songs[i].length==1) {
						songs.splice(i--,1);
					}
				}
				initialize_menu();
			}
		}
	};
	req.send();
}

// ===== Setup functions =====

var running,stage,map,storyboard,replay;
// Initialize a storyboard with song(i), map(j)
function launch_storyboard(i,j) {
	init_storyboard(songs[i][0],songs[i][j]);
	frame();
	running = true;
}

// Make a copy of the storyboard
function deepCopyStoryboard(events) {
	var newEvents = new WOsu.BeatmapEvents();
	newEvents.BackgroundEvents = events.BackgroundEvents;
	newEvents.BreakPeriods = events.BreakPeriods;
	newEvents.StoryboardObjects = new Array(); // Requires deeper copy
	newEvents.hasExternalStoryboard = events.hasExternalStoryboard;
	newEvents.hasStoryboardBackground = events.hasStoryboardBackground;
	newEvents.TimingPoints = events.TimingPoints;
	newEvents.Colours = events.Colours;
	
	for (var i=0; i<events.StoryboardObjects.length; i++) {
		newEvents.StoryboardObjects.push(events.StoryboardObjects[i].clone());
	}
	
	newEvents.SBOStates = new Array(newEvents.StoryboardObjects.length);
	for (var i=0; i<newEvents.SBOStates.length; i++) {
		newEvents.SBOStates[i] = {
			visible: false,
			loaded: newEvents.StoryboardObjects[i].getNumberImages(),
			processed: null,
			element: null
		};
	}
	
	return newEvents;
}

var audioLoaded;
// Read the map and format the object variables
function init_storyboard(folder,m) {
	console.log("Initializing storyboard: " + folder + ", " + m);
	
	stage = -10;
	
	map = new WOsu.Beatmap.readBeatmap(folder,m);
	storyboard = deepCopyStoryboard(map.BeatmapEvents);
	
	storyboard.element = document.getElementById("storyboardContainer");
	storyboard.paused = false;
	
	// Black background
	storyboard.element.style.backgroundColor = "black";
	storyboard.element.style.width = WOsu.width + "px";
	storyboard.element.style.height = WOsu.height + "px";
	document.getElementById("selectionContainer").style.display = "none";
	document.getElementById("loading").style.top = "80px";
	document.getElementById("loading").style.left = (WOsu.width/2-64) + "px";
	
	// General transformation
	storyboard.baseMatrix = new WOsu.Matrix3();
	var t1,t2;
	if (WOsu.width/WOsu.height>=4.0/3.0) { // Widescreen
		// Scale
		t1 = WOsu.height/480;
		// Translate
		t2 = (WOsu.width/t1-640)/2;
		
		storyboard.baseMatrix.multiply(WOsu.Matrix3.getScale(t1,t1));
		storyboard.baseMatrix.multiply(WOsu.Matrix3.getTranslation(t2,0));
	}
	else { // Up down
		// Scale
		
		// Translate (needed?)
		
	}
	
	// Background
	storyboard.background = null;
	storyboard.hasBackgroundSprite = false;
	for (var i=0; i<storyboard.BackgroundEvents.length; i++) {
		if (storyboard.BackgroundEvents[i].type==WOsu.Event.TYPE_BACKGROUND) {
			path = "Songs/" + folder + "/" + storyboard.BackgroundEvents[i].media;
			storyboard.background = {};
			loader = new Image();
			loader.src = path;
			loader.style.position = "absolute";
			loader.style.top = "0px";
			loader.style.left = "0px";
			loader.style.display = "none";
			loader.style.zIndex = 1;
			loader.onload = function() {
				t = WOsu.height/storyboard.background.element[0].height;
				storyboard.background.tMatrix = new WOsu.Matrix3();
				storyboard.background.tMatrix.multiply(WOsu.Matrix3.getScale(t,t));
				t = (WOsu.width/t-storyboard.background.element[0].width)/2;
				storyboard.background.tMatrix.multiply(WOsu.Matrix3.getTranslation(t,0));
			};
			storyboard.background.path = path;
			storyboard.background.element = [loader];
			setOrigin(storyboard.background.element[0],"0% 0%");
			storyboard.element.appendChild(storyboard.background.element[0]);
			break;
		}
	}
	
	// Storyboard objects
	var loader,object,event,subevent,path,last;
	for (var i=0; i<storyboard.StoryboardObjects.length; i++) {
		object = storyboard.StoryboardObjects[i];
		storyboard.SBOStates[i].processed = new Array(object.events.length);
		for (var j=0; j<storyboard.SBOStates[i].processed.length; j++) {
			storyboard.SBOStates[i].processed[j] = false;
		}
		
		if (object.type==WOsu.Event.TYPE_SPRITE) {
			path = "Songs/" + folder + "/" + object.getImageFile(0);
			if (path==storyboard.background.path) {
				storyboard.hasBackgroundSprite = true;
			}
			loader = new Image();
			loader.src = path;
			loader.onload = function (i,object) { return function() {
				storyboard.SBOStates[i].loaded--;
				setOrigin(storyboard.SBOStates[i].element[0],object);
			} }(i,object);
			loader.onerror = function (i) { return function() {
				storyboard.SBOStates[i].loaded--;
				storyboard.SBOStates[i].element[0] = null;
			} }(i);
			loader.style.position = "absolute";
			loader.style.top = "0px";
			loader.style.left = "0px";
			loader.style.display = "none";
			loader.style.zIndex = i+10;
			storyboard.SBOStates[i].element = [loader];
			//setOrigin(storyboard.SBOStates[i].element[0],"0% 0%");
		}
		else {
			storyboard.SBOStates[i].element = new Array();
			for (var j=0; j<object.frameCount; j++) {
				path = "Songs/" + folder + "/" + object.getImageFile(j);
				loader = new Image();
				loader.src = path;
				loader.onload = function (i,j,object) { return function() {
					storyboard.SBOStates[i].loaded--;
					setOrigin(storyboard.SBOStates[i].element[j],object);
				} }(i,j,object);
				loader.onerror = function (i,j) { return function() {
					storyboard.SBOStates[i].loaded--;
					storyboard.SBOStates[i].element[j] = null;
				} }(i,j);
				loader.style.position = "absolute";
				loader.style.top = "0px";
				loader.style.left = "0px";
				loader.style.display = "none";
				loader.style.zIndex = i+2;
				storyboard.SBOStates[i].element.push(loader);
				setOrigin(storyboard.SBOStates[i].element[j],object);
			}
		}
		storyboard.SBOStates[i].tMatrix = storyboard.baseMatrix.clone();
		
		if (object.type==WOsu.Event.TYPE_SPRITE) {
			last = object.startTime;
			for (var j=0; j<object.events.length; j++) {
				event = object.events[j];
				if (event.endTime>last) {
					last = event.endTime;
				}
			}
			object.endTime = last;
		}
		else if (object.type==WOsu.Event.TYPE_ANIMATION) {
			if (object.loopType==0) {
				object.endTime = Number.POSITIVE_INFINITY;
			}
			else if (object.loopType==1) {
				object.endTime = object.startTime + object.frameCount*object.frameDelay;
			}
		}
	}
	
	// Normalize loops
	for (var i=0; i<storyboard.StoryboardObjects.length; i++) {
		object = storyboard.StoryboardObjects[i];
		for (var j=0; j<object.events.length; j++) {
			event = object.events[j];
			if (event.eventType==WOsu.StoryboardEvent.TYPE_L) {
				last = object.events[j+1].startTime;
				for (var k=j+1; k<object.events.length && object.events[k].compound; k++) {
					subevent = object.events[k];
					subevent.startTime -= last;
					subevent.endTime -= last;
				}
				event.startTime += last;
			}
		}
	}
	
	// Set object start times
	for (var i=0; i<storyboard.StoryboardObjects.length; i++) {
		object = storyboard.StoryboardObjects[i];
		if (object.events.length==0) {
			object.startTime = 0;
		}
		else {
			object.startTime = object.events[0].startTime;
		}
	}
	
	// Add all the images to the container element
	for (var i=0; i<storyboard.SBOStates.length; i++) {
		for (var j=0; j<storyboard.SBOStates[i].element.length; j++) {
			storyboard.element.appendChild(storyboard.SBOStates[i].element[j]);
		}
	}
	
	audioLoaded = false;
	storyboard.time = -map.BeatmapData.AudioLeadIn;
	storyboard.startTime = Date.now();
	storyboard.pauseTime = Date.now();
	
	var audiofile = "Songs/" + folder + "/" + map.BeatmapData.AudioFilename;
	var ext = audiofile.substring(audiofile.length-3);
	console.log("Loading audio file " + audiofile + " (" + ext + ")");
	audio.jPlayer("destroy");
	audio.jPlayer({
		ready: function(event) {
			console.log("Audio ready: " + audiofile + " (" + ext + ")");
			var media = {};
			media[ext] = audiofile;
			audio.jPlayer("setMedia",media);
			audio.jPlayer("load");
			document.getElementById("optionsContainer").style.top = "10px";
			storyboard.player = audio.data('jPlayer');
		},
		loadstart: function(event) {
			audioLoaded = true;
		},
		play: time_start_storyboard,
		pause: time_stop_storyboard,
		timeupdate: time_update_storyboard,
		swfPath: "ext/jquery.jplayer.swf",
		supplied: ext,
		volume: 0.5
    });
	console.log("Finished initializing storyboard.");
}

// ===== Display function =====

// Compute and process storyboard objects
function frame() {
	requestAnimFrame(frame);
	switch (stage) {
	case -10: // Pre-loading images
		var allLoaded = true;
		for (var i=0; i<storyboard.SBOStates.length; i++) {
			if (storyboard.SBOStates[i].loaded>0) {
				allLoaded = false;
				break;
			}
		}
		if (allLoaded && audioLoaded) {
			stage = -5;
		}
		break;
	case -5: // Setup the rest of the storyboard
		document.getElementById("loading").style.display = "none";
		storyboard.startTime = Date.now() + map.BeatmapData.AudioLeadIn;
		storyboard.pauseTime = Date.now() + map.BeatmapData.AudioLeadIn;
		stage = -2;
		break;
	case -2: // Audio lead in time
		if (storyboard.time>=0) {
			audio.jPlayer("play");
			storyboard.startTime = Date.now();
			storyboard.pauseTime = Date.now();
			stage = 0;
		}
	case 0: // Storyboard
		var currentTime = getCurrentTime();
		
		var state,object,event,subevent;
		var relativeTime,allProcessed;
		for (var i=0; i<storyboard.StoryboardObjects.length; i++) {
			object = storyboard.StoryboardObjects[i];
			state = storyboard.SBOStates[i];
			if (object.type==WOsu.Event.TYPE_SPRITE || object.type==WOsu.Event.TYPE_ANIMATION) {
				for (var j=0; j<object.events.length; j++) {
					event = object.events[j];
					if (!state.processed[j] && !event.compound) {
						if (currentTime>=event.startTime) {
							if (event.isInstant()) {
								endEvent(object,event);
								state.processed[j] = true;
							}
							else if (event.eventType==WOsu.StoryboardEvent.TYPE_L) {
								// Process loops
								allProcessed = true;
								relativeTime = (currentTime-event.startTime)%(event.loopEndTime-event.loopStartTime);
								for (var k=j+1; k<=event.endX; k++) {
									subevent = object.events[k];
									if (!state.processed[k]) {
										if (relativeTime>=subevent.startTime) {
											if (subevent.isInstant()) {
												endEvent(object,subevent);
												state.processed[k] = true;
											}
											else {
												processEvent(relativeTime,object,subevent);
											}
										}
										if (relativeTime>subevent.endTime) {
											endEvent(object,subevent);
											state.processed[k] = true;
										}
										allProcessed = false;
									}
								}
								if (allProcessed) {
									for (var k=j+1; k<=event.endX; k++) {
										state.processed[k] = false;
									}
								}
							}
							else {
								processEvent(currentTime,object,event);
							}
						}
						if (currentTime>event.endTime) {
							endEvent(object,event);
							state.processed[j] = true;
						}
					}
				}
			}
		}
		
		render();
	default:
		break;
	}
}

// Render the storyboard
function render() {
	switch (stage) {
	case -10:
		break;
	case -2:
	case 0:
		var currentTime = getCurrentTime();
		
		document.getElementById("jp-custominfo").innerHTML = currentTime/1000;
		
		if (storyboard.background==null || (storyboard.hasStoryboardBackground && storyboard.hasBackgroundSprite)) {
			setVisibility(storyboard.background,0,false);
		}
		else {
			setVisibility(storyboard.background,0,true);
			setTransform(storyboard.background,0);
		}
		
		var object,cur_frame;
		for (var i=0; i<storyboard.StoryboardObjects.length; i++) {
			try {
				object = storyboard.StoryboardObjects[i];
				if (object.type==WOsu.Event.TYPE_SPRITE) {
					if (object.isVisible(currentTime)) {
						setMatrix(object,storyboard.SBOStates[i]);
						setTransform(storyboard.SBOStates[i],0);
						setProperties(object,storyboard.SBOStates[i],0);
						setVisibility(storyboard.SBOStates[i],0,true);
					}
					else {
						setVisibility(storyboard.SBOStates[i],0,false);
					}
				}
				else if (object.type==WOsu.Event.TYPE_ANIMATION) {
					if (currentTime>=object.startTime && currentTime<=object.endTime) {
						cur_frame = ~~(((currentTime-object.startTime)%(object.frameCount*object.frameDelay))/object.frameDelay);
						setMatrix(object,storyboard.SBOStates[i]);
						setTransform(storyboard.SBOStates[i],cur_frame);
						setProperties(object,storyboard.SBOStates[i],cur_frame);
						setVisibility(storyboard.SBOStates[i],cur_frame,true);
					}
					else {
						setVisibility(storyboard.SBOStates[i],j,false);
					}
				}
			}
			catch (err) {
				// Missing images
			}
		}
	default:
		break;
	}
}

// Set the css3 transform-origin property of an element given an object
function setOrigin(elem,obj) {
	var x = ~~(obj.origin%3);
	var y = ~~(obj.origin/3);
	
	// Transform origin
	var t = (x*50) + "% " + (y*50) + "%";
	elem.style["transformOrigin"] = t;
	elem.style["WebkitTransformOrigin"] = t;
	elem.style["MozTransformOrigin"] = t;
	
	// Match (0px,0px) to origin
	x = x/2;
	y = y/2;
	elem.style.top = (-y*elem.height) + "px";
	elem.style.left = (-x*elem.width) + "px";
}

// Set the transform matrix of an object given a storyboard obejct
function setMatrix(sobj,obj) {
	obj.tMatrix = storyboard.baseMatrix.clone();
	// Translate
	obj.tMatrix.multiply(WOsu.Matrix3.getTranslation(sobj.x,sobj.y));
	// Rotate
	obj.tMatrix.multiply(WOsu.Matrix3.getRotation(sobj.rotation));
	// Scale
	obj.tMatrix.multiply(WOsu.Matrix3.getScale(sobj.scaleX,sobj.scaleY));
}

// Set the css3 transform property of an element given an object
function setTransform(obj,ind) {
	var t = obj.tMatrix.getCSS3Transform();
	obj.element[ind].style["transform"] = t;
	obj.element[ind].style["WebkitTransform"] = t;
	obj.element[ind].style["MozTransform"] = t;
}

// Set the css opacity property of an element given an object
function setProperties(sobj,obj,ind) {
	obj.element[ind].style.opacity = sobj.fade;
}

// Set the visibility of an object
function setVisibility(obj,ind,vis) {
	if (vis!=obj.visibility) {
		if (vis) {
			for (var i=0; i<obj.element.length; i++) {
				if (i==ind) {
					obj.element[i].style.display = "block";
				}
				else {
					obj.element[i].style.display = "none";
				}
			}
		}
		else {
			for (var i=0; i<obj.element.length; i++) {
				obj.element[i].style.display = "none";
			}
		}
		obj.visibility = vis;
	}
}

function getCurrentTime() {
	var ct;
	if (storyboard.paused) ct = storyboard.pauseTime - storyboard.startTime;
	else ct = storyboard.time = Date.now() - storyboard.startTime;
	return ct;
}

// Calculate the state of a storyboard object given a time and the event
function processEvent(currentTime,so,se) {
	var portion = (currentTime - se.startTime)/(se.endTime - se.startTime);
	if (se.eventType==WOsu.StoryboardEvent.TYPE_F) {
		so.fade = se.startX + portion*(se.endX - se.startX);
	}
	else if (se.eventType==WOsu.StoryboardEvent.TYPE_M) {
		so.x = se.startX + portion*(se.endX - se.startX);
		so.y = se.startY + portion*(se.endY - se.startY);
	}
	else if (se.eventType==WOsu.StoryboardEvent.TYPE_MX) {
		so.x = se.startX + portion*(se.endX - se.startX);
	}
	else if (se.eventType==WOsu.StoryboardEvent.TYPE_MY) {
		so.y = se.startY + portion*(se.endY - se.startY);
	}
	else if (se.eventType==WOsu.StoryboardEvent.TYPE_S) {
		so.scaleX = se.startX + portion*(se.endX - se.startX);
		so.scaleY = se.startX + portion*(se.endX - se.startX);
	}
	else if (se.eventType==WOsu.StoryboardEvent.TYPE_V) {
		so.scaleX = se.startX + portion*(se.endX - se.startX);
		so.scaleY = se.startY + portion*(se.endY - se.startY);
	}
	else if (se.eventType==WOsu.StoryboardEvent.TYPE_R) {
		so.rotation = se.startX + portion*(se.endX - se.startX);
	}
	else if (se.eventType==WOsu.StoryboardEvent.TYPE_C) {
		so.r = (se.startX + portion*(se.endX - se.startX))/255;
		so.g = (se.startY + portion*(se.endY - se.startY))/255;
		so.b = (se.startZ + portion*(se.endZ - se.startZ))/255;
	}
	else if (se.eventType==WOsu.StoryboardEvent.TYPE_P) {
		if (se.startX==0) {
			so.parameterH = true;
		}
		if (se.startX==1) {
			so.parameterV = true;
		}
		if (se.startX==2) {
			so.parameterA = true;
		}
	}
}

// Calculate the end state of a storyboard object given the last event
function endEvent(so,se) {
	if (se.eventType==WOsu.StoryboardEvent.TYPE_F) {
		so.fade = se.endX;
	}
	else if (se.eventType==WOsu.StoryboardEvent.TYPE_M) {
		so.x = se.endX;
		so.y = se.endY;
	}
	else if (se.eventType==WOsu.StoryboardEvent.TYPE_MX) {
		so.x = se.endX;
	}
	else if (se.eventType==WOsu.StoryboardEvent.TYPE_MY) {
		so.y = se.endY;
	}
	else if (se.eventType==WOsu.StoryboardEvent.TYPE_S) {
		so.scaleX = se.endX;
		so.scaleY = se.endX;
	}
	else if (se.eventType==WOsu.StoryboardEvent.TYPE_V) {
		so.scaleX = se.endX;
		so.scaleY = se.endY;
	}
	else if (se.eventType==WOsu.StoryboardEvent.TYPE_R) {
		so.rotation = se.endX;
	}
	else if (se.eventType==WOsu.StoryboardEvent.TYPE_C) {
		so.r = se.endX/255;
		so.g = se.endY/255;
		so.b = se.endZ/255;
	}
	else if (se.eventType==WOsu.StoryboardEvent.TYPE_P) {
		if (se.startX==0) {
			so.parameterH = false;
		}
		if (se.startX==1) {
			so.parameterV = false;
		}
		if (se.startX==2) {
			so.parameterA = false;
		}
	}
}

// jPlayer.play callback
function time_start_storyboard(event) {
	storyboard.startTime = Date.now() - ~~(storyboard.player.status.currentTime*1000);
	storyboard.paused = false;
}

// jPlayer.pause callback
function time_stop_storyboard(event) {
	storyboard.pauseTime = Date.now();
	storyboard.paused = true;
}

// jPlayer.timeupdate callback
function time_update_storyboard(event) {
	//console.log(event.jPlayer.status.currentTime);
}

window.requestAnimFrame = (function() { return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(f) { window.setTimeout(f,1000/60); }; })();

