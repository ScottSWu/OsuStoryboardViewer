<?php
	/*
	GetBeatmap.php
	
	Reads a beatmap file (.osu) and returns its data in JSON format.
	The returned JSON object will contain arrays of lines grouped by section (General, Editor, etc.).
	Executing the javascript function eval on the echoed data will generate that JSON object without special JSON requirements.
	
	Setting the field "part" to "meta" in the URL will ignore any storyboards within the folder.
	*/
	
	// Test data
	// folder=66221%20Suzuki%20Konomi%20-%20DAYS%20of%20DASH&map=Suzuki%20Konomi%20-%20DAYS%20of%20DASH%20(Rotte)%20%5BInsane%5D.osu
	// folder=18841%20HTT%20-%20NO,%20Thank%20You!%20(Full%20Ver)&map=HTT%20-%20NO,%20Thank%20You!%20(Full%20Ver.)%20(S%20i%20R%20i%20R%20u)%20%5B31's%20Taiko%5D.osu
	
	header('Content-type: text/html; charset=utf-8');
	
	$folder = "Songs/" . $_GET["folder"];
	$map = $folder . "/" . $_GET["map"];
	$part = "";
	if (isset($_GET["part"])) {
		$part = $_GET["part"];
	}
	
	if (!is_dir($folder)) {
		die("Error: Folder path is not a folder.");
	}
	if (!is_file($map) || strtoupper(substr($map,-3))!="OSU") {
		die("Error: Map file does not exist.");
	}
	
	$fin = fopen($map,"r");
	if (!$fin) {
		die("Error: Failed to open map file.");
	}
	
	// Note:
	// The object will be wrapped in an array to bypass JSON requirements
	echo "[{";
	
	// Read the file
	$firstline = true;
	echo "Head:[";
	while (!feof($fin)) {
		$line = rtrim(fgets($fin));
		if (substr($line,0,1)=="[") {
			echo "],";
			
			echo substr($line,1,-1) . ":[";
			$firstline = true;
		}
		else if (strlen($line)>0) {
			if (!$firstline) echo ",";
			else $firstline = false;
			echo "'" . addslashes($line) . "'";
		}
	}
	echo "]";
	fclose($fin);
	
	// Include storyboard file if it exists
	$flist = scandir($folder);
	$sb = "";
	for ($i=0; $i<count($flist); $i++) {
		if (strtoupper(substr($flist[$i],-3))=="OSB") {
			$sb = $flist[$i];
			break;
		}
	}
	if ($sb!="" && $part!="meta") {
		$fin = fopen($folder . "/" . $sb,"r");
		if ($fin) {
			echo ",";
			echo "'Storyboard':[";
			$firstline = true;
			while (!feof($fin)) {
				$line = rtrim(fgets($fin));
				if (!$firstline) echo ",";
				else $firstline = false;
				echo "'" . addslashes($line) . "'";
			}
			echo "]";
		}
	}
	echo "}][0]";
	// End signature to weed out web hosting insertions
	echo "~~\\e\\~~";
?>