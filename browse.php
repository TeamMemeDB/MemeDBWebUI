<?php 
/*
	Base browsing page
*/
require_once(dirname(__FILE__).'/../meme.conn.php');
require_once(dirname(__FILE__).'/includes/template.php');

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

global $conn;
global $header;
$header=false;
global $filters;
$filters='Hidden = 0 AND CollectionParent IS NULL';
global $limit;
$limit = '0,50';
global $memevote;
$memevote='0 AS MemeVote,0 AS MemeFav,(SELECT COUNT(*) FROM meme child WHERE CollectionParent = meme.Id) AS Children';
global $memes;
global $memepreview;
$memepreview=false;

if(isset($_GET['get'])){
	if(!isset($_GET['scroll'])&&!isset($_GET['q'])) header('Content-Type: application/json');
}


//Setup universal filters for memes.
if(isset($_SESSION['access_token'])){
	$memevote='(SELECT Value FROM memevote WHERE memeId=meme.Id AND userId='.$_SESSION['user']->id.') AS MemeVote,
						 (SELECT 1 FROM favourites WHERE memeId=meme.Id AND userId='.$_SESSION['user']->id.') AS MemeFav,
						 (SELECT COUNT(*) FROM meme child WHERE CollectionParent = meme.Id) AS Children';
}

// $memevote.=',(SELECT )' WIP - add CollectionChild property

/*class Meme{
	public $id = NULL;
	public 
	public function __construct(){

	}
}*/

/*
function thumburl($id,$url=Null){
	$result=apcu_fetch('thumburls');
	if($result===false){
		$thumburls=[];
	}else $thumburls=$result->getArrayCopy();
	if($url!=Null){
		$thumburls[$id]=$url;
		apcu_store('thumburls',new ArrayObject($thumburls));
		return $url;
	}else{
		if(array_key_exists($id,$thumburls)){
			return $thumburls[$id];
		}
		else{
			return '';
		}
	}
}
*/

if(!isset($_SESSION['spice'])){
	$_SESSION['spice']='0';
}else{
	if(ctype_digit($_SESSION['spice'])){
		$edge=intval($_SESSION['spice']);
		if(!($edge>=0&&$edge<=(isset($_SESSION['admin'])?4:1))){
			$_SESSION['spice']='0';
		}
	}else{
		$_SESSION['spice']='0';
	}
}
if($_SESSION['spice']=='0'){
	$filters.=' and Nsfw = 0';
}

if(isset($_GET['scroll'])){
	$scroll = $conn->real_escape_string($_GET['scroll']);
	if(!ctype_digit($scroll)){
		$conn->close();
		die(json_encode(['success'=>0,'msg'=>'Invalid request!']));
	}
	$limit = $scroll.',50';
}

function embed($url){
	if(strpos($url,'youtube.com/watch')){
		$url="https://www.youtube.com/embed/".substr($url,strpos($url,'youtube.com/watch?v=')+20,11);
		return '<iframe class="youtube" src="'.$url.'" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
	}
	else if(strpos($url,'youtu.be')){
		$url="https://www.youtube.com/embed/".substr($url,strpos($url,'youtu.be/')+9,11);
		return '<iframe class="youtube" src="'.$url.'" frameborder="0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
	}
	else if(strpos($url,'twitter.com/')){
		$url="https://twitframe.com/show?url=".urlencode($url);
		return '<iframe class="twitter" src="'.$url.'" frameborder="0" allowfullscreen></iframe>';
	}
	else return '<iframe class="embed" src="/includes/embed.php?url='.urlencode($url).'" frameborder="0" allowfullscreen></iframe>';
}

function printmemes($memes,$limit,$conn){
	if(isset($memes)){
		if($memes){
			$i=0;
			echo '<span class="page">';
			while($row = $memes->fetch_assoc()){
				$core='" data-src="'.$row['Url'].'" data-id="'.$row['Id'].'"';
				if($row['Color']){
					$core.=' style="background-color:'.$row['Color'].';"';
				}
				if($row['CollectionParent']!=Null){
					$core=' child'.$core.' data-parent="'.$row['CollectionParent'].'"';
				}
				if($row['Children']>0){
					$core=' parent'.$core;
				}
				if(isset($row['SearchData'])) $core.=' data-search="'.str_replace('<br />',' ',str_replace('"',"'",$row['SearchData'])).'"';
				
				$srccore = "";
				if($row['Width']&&$row['Height']){
					$srccore.=' width="'.$row['Width'].'px" height="'.$row['Height'].'px"';
				}
				
				$youtube = '';
				if(strpos($row['OriginalUrl'],'ttps://youtu.be/')==1||strpos($row['OriginalUrl'],'ttps://www.youtube.com/')==1){
					$youtube = '<a class="youtube-button" href="'.$row['OriginalUrl'].'" target="_blank">▶</a>';
				}
				$videotemplate='
					<div class="video-controls">
						<input class="time-slider" type="range" min="0" max="100" value="0" step="1"/>
						<button class="play-pause-button">▶</button>
						<div class="time-by-duration">
							<span class="current-time">00</span>/<span class="duration">00</span>
						</div>
						<button class="mute-button">🔊</button>
						<input class="volume-slider" type="range" min="0" max="100" value="100" step="1"/>
						<button class="fullscreen-button">&#9974;</button>
						'.$youtube.'
					</div>';
                
				$memebtns='
					<span class="edit">✎</span>
					<span class="fav'.(($row['MemeFav']=='1')?' active':'').'">★</span>
					<span class="upvote'.(($row['MemeVote']=='1')?' active':'').'">&#708;</span>
					<span class="voteval">'.$row['Votes'].'</span>
					<span class="downvote'.(($row['MemeVote']=='-1')?' active':'').'">&#709;</span>
					<a class="embedopen" href="/meme/'.$row['Id'].'">&#x1f517;</a>
				';
				
				if($row['Children']>0){
					$memebtns=str_replace('"embedopen" href="/meme/','"embedopen" href="/collection/',$memebtns).'<span class="collection">1 of '.strval($row['Children']+1).'</span>';
				}

				if($row['Type']=='image'){
					echo '<div class="meme img'.$core.'><img'.$srccore.' src="https://cdn.yiays.com/meme/'.$row['Id'].'.thumb.jpg"></a>'.$memebtns.'</div>';
				}
				else if($row['Type']=='gif'){
					echo '<div class="meme gif'.$core.'><img'.$srccore.' src="https://cdn.yiays.com/meme/'.$row['Id'].'.thumb.jpg"></a>'.$memebtns.'</div>';
				}
				else if($row['Type']=='webm'){
					echo '<div class="meme webm'.$core.'><video'.$srccore.' muted preload="none" poster="https://cdn.yiays.com/meme/'.$row['Id'].'.thumb.jpg"><source src="'.$row['Url'].'" type="video/webm"></video>'.$videotemplate.'</div>'.$memebtns.'</div>';
				}
				else if($row['Type']=='video'){
					echo '<div class="meme video'.$core.'><div class="videoplayer"><video'.$srccore.' preload="none" poster="https://cdn.yiays.com/meme/'.$row['Id'].'.thumb.jpg"><source src="'.$row['Url'].'" type="video/mp4"></video>'.$videotemplate.'</div>'.$memebtns.'</div>';
				}
				else if($row['Type']=='audio'){
					echo '<div class="meme audio'.$core.'><video'.$srccore.' controls preload="none" poster="/img/audio.png"><source src="'.$row['Url'].'" type="video/mp4"></video>'.$memebtns.'</div>';
				}
				else if($row['Type']=='url'){
					echo '<div class="meme url'.$core.'>'.embed($row['Url']).$memebtns.'</div>';
				}
				else if($row['Type']=='text'){
					echo '<div class="meme text'.$core.'><span class="text">'.$row['Url'].'</span>'.$memebtns.'</div>';
				}
				$i++;
			}
			echo '</span>';
			if($limit){
				if($i<intval(explode(',',$limit)[1])){
					if(isset($_GET['scroll'])||$i>0) print('<div class="rem">That is all!</div><!--END-->');
					else print('<div class="rem" style="color:red;">Nothing found!</div><!--END-->');
				}
			}
		}else{
			print("<div class='rem'>There was an error when running this query!<br><br>".$conn->error."</div><!--END-->");
		}	
	}else{
		if(!isset($_GET['get'])) print("<noscript>This page requires JS.</noscript>");
	}
}

function browse(){
	global $conn;
	global $memes;
	global $memepreview;
	global $limit;

	if(!isset($_COOKIE['bigboy'])&&intval($_SESSION['spice'])>0){
		echo '<script>require18plusauth=false;</script>';
	}

	if(!isset($_GET['get'])){
		echo '<div class="memewrapper">';
	}
	printmemes($memes,$limit,$conn);
	if(!isset($_GET['get'])){
		echo '</div>';
		if(!isset($_GET['scroll'])){
			print('<div id="singlememe" style="display:none">');
			if(isset($memepreview) and $memepreview){
				printmemes($memepreview,false,$conn); // Include a copy of the meme since the background page isn't included
			}
			print('</div>');
		}

		$num2word=[
			0=>'zero',
			1=>'one',
			2=>'two',
			3=>'three',
			4=>'four',
			5=>'five'
		];
		?>
		<div id="bigboy" style="display:none;">
			<div>
				<h1>This page may contain <span class="accent">NSFW</span> content!</h1>
				<span>- Do you want to continue?</span>
				<hr>
				<a class="btn" id="bigboyconf">Yes (I'm 18+)</a>
				<a class="btn" id="bigboydeny">No, hide them please</a>
			</div>
		</div>
		<div class="browse-control">
			<div id="setedge" class="edgecontainer <?php  echo $num2word[$_SESSION['spice']+1]; ?>">
				<span>🌶</span><span>🌶</span>
				<?php  if(isset($_SESSION['admin'])) echo '<span>🌶</span><span>🌶</span><span>🌶</span>';?>
			</div>
			<div class="scalecontainer hide-tiny">
				<input type="range" min="50" max="150" value="100" id="scale">
			</div>
		</div>
		<?php 
		footer(true);
	}

	$conn->close();
}

if(str_replace('\\', '/', __FILE__)==$_SERVER['SCRIPT_FILENAME']){
	//browse();
	header('Location: /category/new',true,301);
	exit();
}
?> 