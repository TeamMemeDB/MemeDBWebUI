<?php
/*
	Landing page for new users
*/
require('../meme.conn.php');
require('includes/template.php');

require_once('browse.php');

global $conn;
global $user;
global $filters;
global $memevote;

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
		<a href="/user/0/stats/" class="btn">Stats</a>
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
		<p>You can browse the site freely without an account and, by linking your Discord account with MemeDB, you can make changes and form your own collection of favourites!</p>
	</div>
	<div class="super-footer">
		<?php if(!isset($_SESSION['access_token'])){?>
			<a class="btn blurple-bg light login-discord" href="/user/login/?return=/">Login</a>
		<?php }else{
			echo "<a class=\"btn blurple-bg light account\" href=\"$user->account_url\">$user->username<span class=\"dim\">$user->discriminator</span></a>";
		} ?>
		<a class="btn float-right till-small" href="/meme/1741">Relevant Meme</a>
  </div>
	<div class="super-bg" style="background:linear-gradient(to bottom, #33373a 0%,#13171a 100%);">
		<div class="super-bg-inner"></div>
		<div class="memewrapper no-size from-small" style="position:absolute;bottom:0.5rem;right:0.5em;width:auto;max-width:40%;padding-bottom:0;font-size:0.8rem;">
			<?php
			$meme = $conn->query(
				'SELECT Id,Color,Width,Height,Hash,Type,CollectionParent,Url,OriginalUrl,Nsfw,'.$memevote.',
				(SELECT COALESCE(SUM(memevote.Value),0) FROM memevote WHERE memeId=Id) AS Votes
				FROM meme
				WHERE '.$filters.' AND Id = 1741
				GROUP BY Id
				LIMIT 1;'
			);
			printmemes($meme, '0,1', $conn);
			?>
			<!--END-->
		</div>
	</div>
</div>
<div class="super">
	<div class="super-content" style="color: #d3dce8!important;">
		<h3 style="border-bottom-color: #d3dce8;">Vote on memes</h3>
		<p>Vote on memes and watch the best memes rise to the top! If no one upvotes a meme, it is deleted.</p>
	</div>
	<div class="super-footer">
		<a class="btn" href="/sort/top">Top 🔥</a>
		<a class="btn float-right till-small" href="/meme/2376">Relevant Meme</a>
  </div>
	<div class="super-bg" style="background:linear-gradient(to bottom, #737c88 0%,#333c48 100%);">
		<div class="super-bg-inner"></div>
		<div class="memewrapper no-size from-small" style="position:absolute;bottom:0.5rem;right:0.5em;width:auto;max-width:40%;padding-bottom:0;font-size:0.8rem;">
			<?php
			$meme = $conn->query(
				'SELECT Id,Color,Width,Height,Hash,Type,CollectionParent,Url,OriginalUrl,Nsfw,'.$memevote.',
				(SELECT COALESCE(SUM(memevote.Value),0) FROM memevote WHERE memeId=Id) AS Votes
				FROM meme
				WHERE '.$filters.' AND Id = 2376
				GROUP BY Id
				LIMIT 1;'
			);
			printmemes($meme, '0,1', $conn);
			?>
			<!--END-->
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
		<a class="btn float-right till-small" href="/meme/247">Relevant Meme</a>
	</div>
  <div class="super-bg" style="background:linear-gradient(to bottom, #b5931b 0%,#705908 100%);">
		<div class="super-bg-inner"></div>
		<div class="memewrapper no-size from-small" style="position:absolute;bottom:0.5rem;right:0.5em;width:auto;max-width:40%;padding-bottom:0;font-size:0.8rem;">
			<?php
			$meme = $conn->query(
				'SELECT Id,Color,Width,Height,Hash,Type,CollectionParent,Url,OriginalUrl,Nsfw,'.$memevote.',
				(SELECT COALESCE(SUM(memevote.Value),0) FROM memevote WHERE memeId=Id) AS Votes
				FROM meme
				WHERE '.$filters.' AND Id = 247
				GROUP BY Id
				LIMIT 1;'
			);
			printmemes($meme, '0,1', $conn);
			?>
			<!--END-->
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
		<a class="btn float-right till-small" href="/meme/380">Relevant Meme</a>
	</div>
  <div class="super-bg" style="background:linear-gradient(to bottom, #7289AA 0%,#42697A 100%);">
		<div class="super-bg-inner"></div>
		<div class="memewrapper no-size from-small" style="position:absolute;bottom:0.5rem;right:0.5em;width:auto;max-width:40%;padding-bottom:0;font-size:0.8rem;">
			<?php
			$meme = $conn->query(
				'SELECT Id,Color,Width,Height,Hash,Type,CollectionParent,Url,OriginalUrl,Nsfw,'.$memevote.',
				(SELECT COALESCE(SUM(memevote.Value),0) FROM memevote WHERE memeId=Id) AS Votes
				FROM meme
				WHERE '.$filters.' AND Id = 380
				GROUP BY Id
				LIMIT 1;'
			);
			printmemes($meme, '0,1', $conn);
			?>
			<!--END-->
		</div>
	</div>
</div>
<div style="border: white solid 1px; margin: -1rem; padding: 1rem;">
	This site is still a work in progress. Reporting and User account settings aren't yet fully functional.
</div>
<?php 
footer(true);
?>