<?php 
session_start();

class User{
	/* - Future code (for php 7.4)
	public int $id;
	public string $account_url = "/user/";
	public string $avatar = null;
	public string $username = "Not logged in";
	public string $discriminator = "";
	public string $email = null;
	public bool $admin = false;
	public bool $banned = false;
	public bool $favouritesprivacy = false;
	public bool $anon = true;
	public bool $isme = false;
	*/
	
	public $id;
	public $account_url = "/user/";
	public $avatar = null;
	public $username = "Not logged in";
	public $discriminator = "";
	public $email = null;
	public $level = 0;
	public $points = 0;
	public $admin = false;
	public $banned = false;
	public $favouritesprivacy = false;
	public $anon = true;
	public $isme = false;
}

$user = new User();
if(isset($_SESSION['access_token'])){
	$user->id = $_SESSION['user']->id;
	$user->account_url .= $user->id . '/';
	$user->avatar = $_SESSION['user']->avatar;
	$user->username = $_SESSION['user']->username;
	$user->discriminator = '#'.$_SESSION['user']->discriminator;
	$user->email = $_SESSION['user']->email;
	$user->admin = isset($_SESSION['admin']);
	$user->anon = false;
	$user->isme = true;
}

function safeurl($url){
	// generates a safe url at all costs
	return urlencode(str_replace(':','',str_replace('?','',str_replace('"','',strtolower($url)))));
}

function headr($data,$conn){
	global $user;
?>
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width,initial-scale=1">
		<title><?php echo $data['title'];?> - MemeDB</title>
		<meta name="author" content="Yiays">
		<meta name="og:title" content="<?php echo $data['title'];?>">
		<meta name="description" content="<?php echo isset($data['description'])?$data['description']:'Meme is a database that is designed with the intention of making it far easier to find that meme you were thinking of.';?>">
		<meta name="og:description" content="<?php echo isset($data['description'])?$data['description']:'Meme is a database that is designed with the intention of making it far easier to find that meme you were thinking of.';?>">
		<meta name="keywords" content="meme,memes,image,images,video,videos,gifs,webms,hashtag,search,database,index<?php echo isset($data['tags'])?','.join(',',$data['tags']):'';?>">
		<?php if(isset($data['image'])) echo '<meta name="og:image" content="'.$data['image'].'">';?>
		<?php if(isset($data['noindex'])&&$data['noindex']) echo '<meta name="robots" content="noindex">';?>
		
		<link rel="apple-touch-icon" sizes="180x180" href="/icon/apple-touch-icon.png">
		<link rel="icon" type="image/png" sizes="32x32" href="/icon/favicon-32x32.png">
		<link rel="icon" type="image/png" sizes="16x16" href="/icon/favicon-16x16.png">
		<link rel="manifest" href="/site.webmanifest">
		
		<!--<link rel="stylesheet" href="//cdn.yiays.com/reset.css" type="text/css">-->
		<link rel="stylesheet" href="/css/style.css?v=51" type="text/css">
		<link rel="stylesheet" href="/css/video.css?v=1" type="text/css">
		<noscript>
			<style>
				.meme{
					opacity:1!important;
					visibility:visible!important;
				}
			</style>
		</noscript>
		<link href="https://fonts.googleapis.com/css?family=Lato:400,400i,700,700i&display=swap" rel="stylesheet">
  </head>
  <body>
		<div id="flood" style="display:none;"></div>
		<div id="modal" style="display:none;"></div>
		<div id="prompt" style="display:none;"></div>
		<div id="memeflood" style="display:none;"></div>
		<div id="memepreview" style="display:none;"></div>
		<div id="memeeditor" style="display:none;">
			<h3>Edit meme</h3>
			<hr>
			<form autocomplete="off" id="mememeta">
				<input type="checkbox" name="isNsfw" id="isNsfw" value="1"/><label for="isNsfw"> Is NSFW</label><br>
				<input type="checkbox" name="isSilent" id="isSilent" value="1" style="display:none;"/><label for="isSilent" style="display:none;"> Is silent</label><br>
				<br>
				<label>Description:</label> (click on the best one)
				<div id="memedesc"></div>
				<br>
				<label>Transcript:</label> (click on the best one)
				<div id="memetrans"></div>
				<br>
				<label>Categories:</label>
				<div id="memecats" class="cats" style="display:inline-block;"></div>
				<a class="btn cat" onclick="$('.autocomplete.memecat').toggle();">+</a>
			</form>
			<form autocomplete="off" class="autocomplete memecat" style="display:none;">
				<select id="memecatpicker" class="ddl">
					<option value="" selected="selected">-</option>
				</select>
				<input id="memecatsearch" class="ddl" name="newcategory" placeholder="new category"/>
			</form>
			<br>
			<label>Tags:</label>
			<div id="memetags" class="tags" style="display:inline-block;"></div>
			<a class="tag" onclick="$('.autocomplete.memetag').toggle();">+</a>
			<form autocomplete="off" class="autocomplete memetag" style="display:none;">
				<input id="memetagsearch" name="newtag" placeholder="new tag"/>
			</form>
			<br>
			<sub><i>Click on the best categories and tags and remove inapropriate ones.</i></sub>
			<br><br><label>Edginess average:</label>
			<span id="averagespice">0.00</span>
			<br><label>Your rating:</label>
			<br><div id="memespice" class="edgecontainer">
				<span>🌶</span>
				<span>🌶</span>
				<?php  if(isset($user->admin)) echo '<span>🌶</span><span>🌶</span><span>🌶</span>';?>
			</div><br>
			<sub>
				<b><i>Note:</i></b> the values shown here have been voted as the most suitable for this meme by other users of the website.
				If you deem anything here to be innapropriate, please suggest an edit or, better yet, upvote an existing edit.
			</sub>
		</div>
		<header>
			<nav>
				<a href="https://meme.yiays.com" style="color:#fafafa;text-decoration:none;">
					<img class="show-xl" src="/img/icon.png" alt="MemeDB Logo" style="width:2.5em;height:2.5em;padding:0.25em;position:absolute;">
					<div class="show-xl" style="width:2.5em;display:inline-block;"></div>
					<h1><span class="hide-small">Meme</span><span class="accent">DB</span></h1>
				</a>
				<div class="float-right">
					<?php if(!isset($_SESSION['access_token'])){?>
						<a class="menu-btn float-right blurple-bg login-discord" href="/user/login/">Login</a>
					<?php }else{?>
						<a class="menu-btn float-right account" href="/user/login/?logout" title="Logout">Logout</a>
						<br class="hide-xl">
						<?php echo "<a class=\"menu-btn float-right account\" href=\"$user->account_url\">$user->username<span class=\"dim\">$user->discriminator</span></a>"; ?>
						<br class="show-tiny">
						<?php echo "<a class=\"menu-btn float-right account accent\" href=\"{$user->account_url}favourites/\" title=\"View a list of all the memes you've favourited.\">★</a>"; ?>
					<?php }?>
				</div>
				<br class="till-tiny">
				<a class="menu-btn till-small" href="/search">🔍</a>
				<form action="/search" method="GET" class="from-small">
					<input type="text" name="q" placeholder="Search MemeDB..." autocomplete="off">
					<a class="menu-btn" href="/search" onclick="SearchSubmit();return false;">
						🔍
					</a>
				</form>
				<a class="menu-btn" href="/sort/top">
					<span class="from-small">Top</span>
					<span class="hide-big">🔥</span>
				</a>
				<a class="menu-btn" href="/sort/new">
					<span class="from-small">New</span>
					<span class="hide-big">✨</span>
				</a>
				<a class="menu-btn" style="display:none;" href="/sort/random" title="Gives you an assortment of random memes.">
					<span class="from-small">Random</span>
					<span class="hide-big">❔</span>
				</a>
				<a class="menu-btn dropdown" href="#categories" onclick="$('#categories').toggle();$(this).toggleClass('active');return false;">
					<span class="from-small">Categories</span>
					<span class="hide-big">📁</span>
					&#9662;
				</a>
				<a class="menu-btn dropdown" href="#tags" onclick="$('#tags').toggle();$(this).toggleClass('active');return false;">
					<span class="from-small">Tags</span>
					<span class="hide-big">#️⃣</span>
					&#9662;
				</a>
			</nav>
			<div class="popdownmenu" id="categories" style="display:none;">
				<h2>Categories 📁</h2>
				<span id="filtercats">
				<?php 
				$result = $conn->query("SELECT Id,Name,Description,COUNT(categoryId) AS count FROM category LEFT JOIN categoryvote ON category.Id=categoryvote.categoryId GROUP BY Id");
				while($row =  $result->fetch_assoc()){
					print("<a class=\"menu-btn cat\" href=\"/category/".safeurl($row['Name']).'/'.$row['Id']."\" title=\"".str_replace('*','',$row['Description'])."\">".$row['Name']."<i class=\"votes\"> (".$row['count'].")</i></a> ");
				}
				?>
				</span>
			</div>
			<div class="popdownmenu" id="tags" style="display:none;">
				<h2>Tags #️⃣</h2>
				<input type="text" placeholder="Search tags" onkeyup="FilterTags();" id="tagfilter"/>
				<span id="filtertags">
					<?php
					$result = $conn->query("SELECT Id,Name,COUNT(tagId) AS count FROM tag LEFT JOIN tagvote ON tag.Id=tagvote.tagId GROUP BY Id;");
					$result2 = $conn->query("SELECT SUM(Value), COUNT(DISTINCT tagId) FROM tagvote;");
					$row2 = $result2->fetch_row();
					$avgvotes = $row2[0]/$row2[1];
					while($row = $result->fetch_assoc()){
						print("<a class='tag' ".(($row['count']<$avgvotes)?'style="display:none;"':'')." href='/tag/".safeurl($row['Name']).'/'.$row['Id']."'>#".$row['Name']."<i class='votes'> (".$row['count'].")</i></a> ");
					}
					?>
				</span>
			</div>
		</header>
		<div class="wrapper">
			<div class="push push-header"></div>
			<?php /*
			<div class="panel warning hide">
					<p>
						<b>Warning:</b> MemeDB is currently in emergency mode, you will not be able to log in or make changes. The latest status on the situation is below.
					</p>
					<ul class="well">
						<li>The main server for MemeDB has gone down, we have switched to a backup. Load times may be slower.</li>
						<li>The most recent memes will not be able to load and new memes cannot be added until issues have been resolved.</li>
					</ul>
			</div>
			<noscript><b>Warning:</b> Many features on this website may not work without enabling JavaScript.</noscript>
			*/ ?>
<?php 
return true;
}

function footer($meme=false){
?>
		</div>
		<footer>
			&copy; 2020, Yiays
			<span class="float-right">
				<a href="/terms/">Terms</a> |
				<a href="/report/">Report</a> |
				<a href="https://github.com/TeamMemeDB">GitHub</a> |
				<a href="/dmca/">DMCA</a>
			</span>
		</footer>
		<script src="//cdn.yiays.com/jquery-3.4.1.min.js" type="text/javascript"></script>
		<script src="/js/autocomplete.js?v=1" type="text/javascript"></script>
		<script src="/js/main.js?v=7" type="text/javascript"></script>
		<script src="/js/video.js" type="text/javascript"></script>
		<?php 
		if($meme){
			echo '<script src="/js/meme.js?v=7" type="text/javascript"></script>';
		}
		?>
		<?php  if(isset($_SESSION['return'])){ ?>
			<script>
				window.onload = function() {
					PopUp(true,'<div class="stayloggedin prompt">\
											<p>Do you want to stay logged in and skip the login process next time?<br><sub>Only do this on devices you trust.</sub></p>\
											<a onclick="StayLoggedIn()" class="btn accentbg">Yes</a>\
											<a onclick="PopUp(false)" class="btn">No</a><br><br>\
										</div>','prompt');
				};
			</script>
		<?php 
		unset($_SESSION['return']);
		} ?>
  </body>
</html>
<?php 
}
?>
