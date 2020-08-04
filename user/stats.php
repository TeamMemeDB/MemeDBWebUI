<?php
/*
	User stats
*/
require_once('user.php');

function stats(?User $user){
	global $conn, $header;
    
	if(is_null($user)){
		$header = headr(['title'=>"User not found"], $conn);
		print("<b>User not found!</b>");
		footer();
		$conn->close();
		die();
	}
	
	if(!$header) $header = headr(['title'=>"$user->username's Stats", 'description'=>"$user->username's contribution statistics from their account on MemeDB."], $conn);
	
	superprofile($user);
	
	$result = $conn->query(
"SELECT
	COUNT(DISTINCT meme.Id) AS Total,
	COUNT(DISTINCT description.memeId) AS Descriptions,
	COUNT(DISTINCT transcription.memeId) AS Transcriptions,
	COUNT(DISTINCT categoryvote.memeId) AS Categories,
	COUNT(DISTINCT tagvote.memeId) AS Tags,
	COUNT(DISTINCT edge.memeId) AS Edge,
	COUNT(DISTINCT memevote.memeId) AS Rating
FROM (((((meme
	LEFT JOIN description ON meme.Id = description.memeId".($user->id > 0? " AND description.userId = $user->id":'').")
	LEFT JOIN transcription ON meme.Id = transcription.memeId".($user->id > 0? " AND transcription.userId = $user->id":'').")
	LEFT JOIN categoryvote ON meme.Id = categoryvote.memeId".($user->id > 0? " AND categoryvote.userId = $user->id":'').")
	LEFT JOIN tagvote ON meme.Id = tagvote.memeId".($user->id > 0? " AND tagvote.userId = $user->id":'').")
	LEFT JOIN edge ON meme.Id = edge.memeId".($user->id > 0? " AND edge.userId = $user->id":'').")
	LEFT JOIN memevote ON meme.Id = memevote.memeId".($user->id > 0? " AND memevote.userId = $user->id":'')."
WHERE CollectionParent IS NULL");
	
	$row = $result->fetch_assoc();
	
	$descs = round(($row['Descriptions']/$row['Total'])*100, 2);
	$trans = round(($row['Transcriptions']/$row['Total'])*100, 2);
	$cats = round(($row['Categories']/$row['Total'])*100, 2);
	$tags = round(($row['Tags']/$row['Total'])*100, 2);
	$edge = round(($row['Edge']/$row['Total'])*100, 2);
	$rate = round(($row['Rating']/$row['Total'])*100, 2);
	
	echo "<h3>Database completion</h3>
	<p>This section celebrates users who dedicate their time to increasing metadata coverage of MemeDB. Greater coverage means more comprehensive search results.</p>";
	
	if($user->id == 0)
		echo "<p style=\"font-size: 1.5rem;\"><b>Total memes:</b> $row[Total]</p>";
	else{
		$score = calculate_score($row['Rating'], $row['Edge'], $row['Tags'], $row['Categories'], $row['Transcriptions'], $row['Descriptions']);
		echo "<p style=\"font-size: 1.5rem;\"><b>Total score:</b> $score</p>";
	}
	
	echo "<b>Descriptions:</b> <a href=\"/leaderboard/described/\">Show Leaderboard</a>
	<div class=\"bar\"><span class=\"accentbg\" style=\"width:$descs%\">$row[Descriptions] ($descs%)</span>".($descs<100?"<span class=\"remainder\"></span>":'')."</div>";
	
	echo "<b>Transcriptions:</b> <a href=\"/leaderboard/transcribed/\">Show Leaderboard</a>
	<div class=\"bar\"><span class=\"accentbg\" style=\"width:$trans%\">$row[Transcriptions] ($trans%)</span>".($trans<100?"<span class=\"remainder\"></span>":'')."</div>";
	
	echo "<b>Categoried memes:</b> <a href=\"/leaderboard/categorized/\">Show Leaderboard</a>
	<div class=\"bar\"><span class=\"accentbg\" style=\"width:$cats%\">$row[Categories] ($cats%)</span>".($cats<100?"<span class=\"remainder\"></span>":'')."</div>";
	
	echo "<b>Tagged memes:</b> <a href=\"/leaderboard/tagged/\">Show Leaderboard</a>
	<div class=\"bar\"><span class=\"accentbg\" style=\"width:$tags%\">$row[Tags] ($tags%)</span>".($tags<100?"<span class=\"remainder\"></span>":'')."</div>";
	
	echo "<b>Edge ratings:</b> <a href=\"/leaderboard/edged/\">Show Leaderboard</a>
	<div class=\"bar\"><span class=\"accentbg\" style=\"width:$edge%\">$row[Edge] ($edge%)</span>".($edge<100?"<span class=\"remainder\"></span>":'')."</div>";
	
	echo "<b>Meme ratings:</b> <a href=\"/leaderboard/rated/\">Show Leaderboard</a>
	<div class=\"bar\"><span class=\"accentbg\" style=\"width:$rate%\">$row[Rating] ($rate%)</span>".($rate<100?"<span class=\"remainder\"></span>":'')."</div>";
	
	footer();
}

function calculate_score($ratings, $edges, $tags, $cats, $trans, $descs){
	return $ratings + $edges + $tags*2 + $cats*2 + $trans*5 + $descs*8;
}
?>