<?php 
/*
		Search
*/
require_once('browse.php');

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

global $conn;
global $header;
global $filters;
global $limit;
global $memevote;
global $memes;


$query='';
if(isset($_GET['q'])){
	$query=strip_tags(urldecode(str_replace('+',' ',$_GET['q'])));
}

if(!isset($_GET['get'])){
	if(strlen($query)>0){
		$header=headr(['title'=>$query.' Search','description'=>"Searching for memes containing the string '".$query."' on MemeDB. Thanks to comprehensive metadata and indexing of memes on this site, search can help you find any meme if you can describe it!",'tags'=>['find','locate','help',$query]],$conn);
	}else{
		$header=headr(['title'=>'Search','description'=>"Thanks to comprehensive metadata and indexing of memes on this site, search can help you find any meme if you can describe it!",'tags'=>['find','locate','help']],$conn);
	}
	?>
	<h2>Search</h2>
	<p>
		Enter your search query below.
	</p>
	<form action="/search">
		<input type="text" id="search" style="padding:0.9em 0.3em" name="q" placeholder="Search MemeDB..." value="<?php echo $query;?>" autocomplete="off">
	</form><br>
	<?php 
}
if(strlen($query)>0){
	$memes = $conn->query(
		"SELECT meme.Id AS Id,Color,Width,Height,Hash,Type,CollectionParent,Url,OriginalUrl,Nsfw,$memevote,
		(SELECT COALESCE(SUM(memevote.Value),0) FROM memevote WHERE memeId=meme.Id) AS Votes,
		REPLACE(
			REPLACE(
				REPLACE(
					LOWER(
						CONCAT_WS('',
							(SELECT GROUP_CONCAT(Text SEPARATOR '') FROM description WHERE memeId=meme.Id),
							(SELECT GROUP_CONCAT(Name SEPARATOR '') FROM category JOIN categoryvote ON Id=categoryId WHERE memeId=meme.Id),
							(SELECT GROUP_CONCAT(Name SEPARATOR '') FROM tag JOIN tagvote ON Id=tagId WHERE memeId=meme.Id),
							(SELECT GROUP_CONCAT(Text SEPARATOR '') FROM transcription WHERE memeId=meme.Id),
							Type,
							(SELECT IF((SELECT COUNT(*) FROM meme child WHERE CollectionParent = meme.Id)>0,'collection',''))
						)
					)
				,' ','')
			,CHAR(10 using utf8),'')
		,'<br/>','') AS SearchData
		FROM (((((((meme
				LEFT JOIN description ON meme.Id = description.memeId)
				LEFT JOIN transcription ON meme.Id = transcription.memeId)
				LEFT JOIN categoryvote ON categoryvote.memeId = meme.Id)
				LEFT JOIN category ON categoryvote.categoryId = category.Id)
				LEFT JOIN tagvote ON tagvote.tagId = meme.Id)
				LEFT JOIN tag ON tagvote.tagId = tag.Id)
				LEFT JOIN edge ON meme.Id = edge.memeId)
		WHERE $filters
		GROUP BY meme.Id
		HAVING SearchData != '' AND IFNULL(AVG(edge.Rating),4)<=".strval($_SESSION['spice']+0.5)." AND SearchData LIKE \"%".$conn->escape_string(str_replace(" ","",$query))."%\"
		ORDER BY meme.Id DESC
		LIMIT $limit;"
	);
}else{
	echo "<!--END-->";
}

browse();

?>