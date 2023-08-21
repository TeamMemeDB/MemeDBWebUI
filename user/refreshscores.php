<?php
require('../../meme.conn.php');

$result = $conn->query("SELECT Id,Points FROM user");
while($user = $result->fetch_row()){
	$id = $user[0];
	$oldscore = $user[1];
	
	// Fetch current numbers for score
	$result2 = $conn->query(
		"SELECT
			SUM(description.n) AS Descriptions,
			SUM(transcription.n) AS Transcriptions,
			SUM(categoryvote.n) AS Categories,
			SUM(tagvote.n) AS Tags,
			SUM(edge.n) AS Edge,
			SUM(memevote.n) AS Rating
		FROM (((((meme
			LEFT JOIN (SELECT memeId,COUNT(memeId) AS n FROM description WHERE userId = $id) description ON meme.Id = description.memeId)
			LEFT JOIN (SELECT memeId,COUNT(memeId) AS n FROM transcription WHERE userId = $id) transcription ON meme.Id = transcription.memeId)
			LEFT JOIN (SELECT memeId,COUNT(memeId) AS n FROM categoryvote WHERE userId = $id) categoryvote ON meme.Id = categoryvote.memeId)
			LEFT JOIN (SELECT memeId,COUNT(memeId) AS n FROM tagvote WHERE userId = $id) tagvote ON meme.Id = tagvote.memeId)
			LEFT JOIN (SELECT memeId,COUNT(memeId) AS n FROM edge WHERE userId = $id) edge ON meme.Id = edge.memeId)
			LEFT JOIN (SELECT memeId,COUNT(memeId) AS n FROM memevote WHERE userId = $id) memevote ON meme.Id = memevote.memeId
		WHERE CollectionParent IS NULL"
	);
	
	$row = $result2->fetch_assoc();
	$score = calculate_score($row['Rating'], $row['Edge'], $row['Tags'], $row['Categories'], $row['Transcriptions'], $row['Descriptions']);
	
	if($score != $oldscore){
		if($conn->query("UPDATE user SET Points = $score WHERE Id = $id")){
			print("User $id: Score was inaccurate. ($oldscore -> $score)<br><br>");
		}
		else print("User $id: Score was inaccurate, but unable to update. ($oldscore -> $score)<br>$conn->error<br><br>");
	}
	else print("User $id: Score was the same.<br><br>");
}

$conn->close();

function calculate_score($ratings, $edges, $tags, $cats, $trans, $descs){
	return $ratings + $edges + $tags*2 + $cats*2 + $trans*5 + $descs*8;
}
?>