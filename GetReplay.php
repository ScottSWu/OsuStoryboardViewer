<?php
	header('Content-type: text/html; charset=utf-8');
	
	if (isset($_FILES["options_form_replay"])) {
		if (strtoupper(substr($_FILES["options_form_replay"]["name"],-4))==".OSR") {
			$fin = $_FILES["options_form_replay"]["tmp_name"];
			$fo = fopen($fin,"rb");
			if (!$fo) $fo = file_get_contents($fin);
			if (!$fo) $fo = file_get_contents($fin,true);
			if (!$fo) $fo = file_get_contents($fin,FILE_USE_INCLUDE_PATH);
			if (!$fo) echo "0Error: Failed to read replay.";
			
			echo "1";
			if ($fo) {
				while (!feof($fo)) {
					echo bin2hex(fread($fo,1024));
				}
				fclose($fo);
			}
		}
		else {
			echo "0Error: Not an .osr file.";
		}
	}
	else {
		echo "0Error: No replay.";
	}
	echo "~~\\e\\~~";
?>