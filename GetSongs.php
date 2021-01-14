<?php
	header('Content-type: text/html; charset=utf-8');
	
	$folder = "Songs";
	
	if (!is_dir($folder)) {
		die("Error: No Songs folder.");
	}
	
	echo "[";
	$first = true;
	$flist = scandir($folder);
	for ($i=0; $i<count($flist); $i++) {
		if ($first) $first = false;
		else echo ",";
		echo "['" . addslashes($flist[$i]) . "'";
		$slist = scandir("Songs/" . $flist[$i]);
		$firstline = true;
		for ($j=0; $j<count($slist); $j++) {
			if (strtoupper(substr($slist[$j],-3))=="OSU") {
				echo ",";
				echo "'" . addslashes($slist[$j]) . "'";
			}
		}
		echo "]";
	}
	echo "]";
	// End signature to weed out web hosting insertions
	echo "~~\\e\\~~";
?>