<?php 
require('../meme.conn.php');
require('includes/template.php');


headr(['title'=>"What is MemeDB?",'description'=>"MemeDB is a massive database of memes. Memes are indexed and metadata is crowd-sourced and so that any meme you are thinking of should be searchable!",'tags'=>['meme','memes','database','search','find']],$conn);
?>
<div class="super">
	<div class="super-content">
		<h1>Welcome to MemeDB!</h1>
		<p>MemeDB is a massive database of memes. Memes are indexed and metadata is crowd-sourced so that any meme you can think of <i>should</i> be searchable!</p>
	</div>
	<div class="super-footer">
		<br><a href="/sort/new" class="btn accentbg">Enter</a>
		<a href="/tutorial" class="btn">Tutorial</a>
	</div>
	<div class="super-bg" id="titlecardscroller">
		<?php 
		$memes = $conn->query('
			SELECT Id,Hash,Color
			FROM meme LEFT JOIN edge ON meme.Id=edge.memeId
			WHERE Nsfw=0 AND Type = "image"
			GROUP BY Id
			HAVING IFNULL(AVG(edge.Rating),4)<=1
			ORDER BY Id DESC
			LIMIT 75;
		');
		if($memes){
			while($row=$memes->fetch_assoc()){
				$style = ($row['Color']?' style="background:'.$row['Color'].';"':'');
				echo '<img'.$style.' src="https://cdn.yiays.com/meme/'.$row['Id'].'x'.$row['Hash'].'.mini.jpg" width="192" height="192">';
			}
		}

		?>
	</div>
</div>
<div class="super">
	<div class="super-content" style="color: #c3c7ca!important;">
		<h3 style="border-bottom-color: #c3c7ca;">Login with Discord</h3>
		<p>You can browse the site freely without an account and, by linking your discord account with MemeDB, you can make changes and form your own collection!</p>
	</div>
	<div class="super-footer">
		<?php if(!isset($_SESSION['access_token'])){?>
			<a class="btn blurple-bg light login-discord" href="/user?login&return=/">Login</a>
		<?php }else{?>
			<a class="btn blurple-bg light account" href="/user"><?php  echo $_SESSION['user']->username.'<span class="dim">#'.$_SESSION['user']->discriminator;?></span></a>
		<?php } ?>
  </div>
	<div class="super-bg" style="background:linear-gradient(to bottom, #33373a 0%,#13171a 100%);">
		<div class="super-bg-inner"></div>
    	<img alt="login with discord" src="/img/super-bg/discord.png" style="opacity:0.6;position:absolute;bottom:0;right:2em;">
	</div>
</div>
<div class="super">
	<div class="super-content" style="color: #d3dce8!important;">
		<h3 style="border-bottom-color: #d3dce8;">Vote on memes</h3>
		<p>Vote on memes and watch the best memes rise to the top! If no one upvotes a meme, it is deleted.</p>
	</div>
	<div class="super-footer">
		<a class="btn" href="/sort/top">Top🔥</a>
  </div>
	<div class="super-bg" style="background:linear-gradient(to bottom, #737c88 0%,#333c48 100%);">
		<div class="super-bg-inner"></div>
		<div class="bg-aside">
			<img alt="vote on memes" src="/img/super-bg/voting.jpg" style="position:absolute;bottom:0;right:0;">
		</div>
	</div>
</div>
<div class="super">
	<div class="super-content" style="color: #f5e37b!important;">
		<h3 style="border-bottom-color: #f5e37b;">Contribute your knowledge</h3>
		<p>Edit memes by adding descriptions, transcribing what you can read and hear, categorizing and tagging memes so that anyone looking for any meme will be able to find it!</p>
	</div>
	<div class="super-footer">
		<a class="btn" href="/sort/new">New ✨</a>
	</div>
  <div class="super-bg" style="background:linear-gradient(to bottom, #b5931b 0%,#705908 100%);">
		<div class="super-bg-inner"></div>
		<div class="bg-aside">
			<img class="from-small" alt="edit memes" src="/img/super-bg/editing.jpg" style="position:absolute;top:0;right:0;">
			<img class="till-small" alt="edit memes" src="/img/super-bg/editing-mini.jpg" style="position:absolute;bottom:0;right:0;max-width:calc(100% - 10em);">
		</div>
	</div>
</div>
<div class="super">
	<div class="super-content" style="color: #d2e9fa!important;">
		<h3 style="border-bottom-color: #d2e9fa;">Reunite with old friends</h3>
		<p>Search for any meme you're looking for and watch memes preserved on MemeDB appear before your eyes!</p>
	</div>
	<div class="super-footer">
		<a class="btn" href="/search">Search 🔍</a>
	</div>
  <div class="super-bg" style="background:linear-gradient(to bottom, #7289AA 0%,#42697A 100%);">
		<div class="super-bg-inner"></div>
		<div class="bg-aside">
			<img class="from-small" alt="search for memes" src="/img/super-bg/search.jpg" style="position:absolute;top:0;right:0;">
			<img class="till-small" alt="search for memes" src="/img/super-bg/search-mini.jpg" style="position:absolute;top:0;left:0;width:100%;">
		</div>
	</div>
</div>
<div style="border: white solid 1px; margin: -1rem; padding: 1rem;">
	This site is still a work in progress. Reporting and User account settings aren't yet fully functional.
</div>
<?php 
footer();
?>