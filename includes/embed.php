<?php 
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if(isset($_GET['url'])){
	$url = htmlspecialchars(trim(urldecode($_GET['url'])),ENT_QUOTES,'ISO-8859-1',TRUE);
	
	$url_data = parse_url($url);
	
	$host = $url_data['host'];
	
	$tags=get_meta_tags($url);
	
	$desc = '';
        
	if(array_key_exists('description',$tags)){
		$desc = $tags['description'];
	}
	else if(array_key_exists('og:description',$tags)){
		$desc = $tags['og:description'];
	}
	else if(array_key_exists('twitter:description',$tags)){
		$desc = $tags['twitter:description'];
	}
	else{
		$desc = 'Description not found!';
	}
	$desc = ucfirst($desc);
	
	$content = '';
	$file = fopen($url,'r');
	while(!feof($file)){
		$content .= fgets($file,1024);
	}
	
	$title = '';

	if(array_key_exists('og:title',$tags)&&strlen($tags['og:title'])>1){
		$title = $tags['og:title'];
	}
	else if(array_key_exists('twitter:title',$tags)){
		$title = $tags['twitter:title'];
	}else{
		$title_pattern = '/<title>(.+)<\/title>/i';
		preg_match_all($title_pattern,$content,$title,PREG_PATTERN_ORDER);

		if(!is_array($title[1])) $title = $title[1];
		else{
			if(count($title[1]) > 0) $title = $title[1][0];
			else $title = 'Title not found!';
		}
	}
	$title = ucfirst($title);
	
	$img_url = '';
	if(array_key_exists('og:image',$tags)){
		$img_url = $tags['og:image'];
	}
	else if(array_key_exists('og:image:src',$tags)){
		$img_url = $tags['og:image:src'];
	}
	else if(array_key_exists('twitter:image',$tags)){
		$img_url = $tags['twitter:image'];
	}
	else if(array_key_exists('twitter:image:src',$tags)){
		$img_url = $tags['twitter:image:src'];
	}
	else{
		// Image not found in meta tags so find it from content
		$img_pattern = '/<img[^>]*'.'src=[\"|\'](.*)[\"|\']/Ui';
		$images = '';
		preg_match_all($img_pattern,$content,$images,PREG_PATTERN_ORDER);

		$total_images = count($images[1]);
		if( $total_images > 0 ) $images = $images[1];

		for($i=0; $i<$total_images; $i++){
			if(getimagesize($images[$i])){
				list($width,$height,$type,$attr) = getimagesize($images[$i]);
				
				if( $width > 600 ) // Select an image of width greater than 600px
				{
					$img_url = $images[$i];
					break;
				}
			}
		}
	}
	
	echo "<a href='$url' target='_blank'>";
	echo "<div><img src='$img_url' alt='Preview image'></div>";
	echo "<h4>$title</h4>";
	echo "<p>$desc</p>";
	echo "<sub>$host</sub>";
	echo "</a>";
}else{
	die('Invalid request!');
}
?>