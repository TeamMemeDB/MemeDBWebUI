<?php
require_once('leaderboard.php');

function show_boards(){
	global $conn, $leaderboards;
	
	headr(['title'=>"Leaderboards", 'description'=>"See the current leaderboards for top contributors to MemeDB.", 'tags'=>['leaderboard','competition','contribution','crowd-sourced']], $conn);
	
	$renderedboards = "";
	foreach($leaderboards as $board => $boarddesc){
		$renderedboards .= "
			<tr>
				<td><a href=\"/leaderboard/$board/\"><b>".ucfirst($board)."</b></a></td>
				<td>".ucfirst($boarddesc)."</td>
			</tr>
		";
	}
	
	echo "
		<table>
			<thead>
				<th>Leaderboard name</th>
				<th>Description</th>
			</thead>
			<tbody>
				$renderedboards
			</tbody>
		</table>
	";
}

function show_board($board){
	global $conn, $leaderboards, $leaderboardtables;
	
	$boarddesc = $leaderboards[$board];
	$boardtable = $leaderboardtables[$board];
	
	headr(['title' => "Top ".ucfirst($board)." Contributors", 'description' => "List of ".$boarddesc, 'tags'=>[$board,'leaderboard','highscore','best of']], $conn);
	
	if($boardtable == 'overall'){
		$result = $conn->query(
			"SELECT
				Id,
				Username,
				Discriminator,
				Points
			FROM user
			WHERE Points > 0
			ORDER BY Points DESC
			LIMIT 50"
		);
	}else{
		$result = $conn->query(
			"SELECT
				user.Id AS userId,
				user.Username AS Username,
				user.Discriminator AS Discriminator,
				COUNT(DISTINCT $boardtable.memeId) AS Contributions
			FROM (meme
				LEFT JOIN $boardtable ON meme.Id = $boardtable.memeId)
				LEFT JOIN user ON user.Id = $boardtable.userId
			GROUP BY $boardtable.userId
			HAVING Contributions > 0
			ORDER BY Contributions DESC
			LIMIT 50"
		);
	}
	
	if(!$result){
		echo "<p><b>Failed to get leaderboard!</b></p><code>$conn->error</code>";
		footer();
		die();
	}
	
	if($boardtable == 'overall'){
		echo "
			<h1>Highest leveled contributors</h1>
			<p>This is a list of $boarddesc</p>
			<table>
				<thead>
					<th>User</th>
					<th>Score</th>
					<th>Level</th>
				</thead>
				<tbody>
		";
	}else{
		echo "
			<h1>Top ".ucfirst($board)." Contributors</h1>
			<p>This is a list of $boarddesc</p>
			<table>
				<thead>
					<th>User</th>
					<th>Contributions</th>
				</thead>
				<tbody>
		";
	}
	while($row = $result->fetch_assoc()){
		$username = $row['Username'].'#'.$row['Discriminator'];
		if(strlen($username) == 1) $username = "Anonymous MemeDB User";
		
		if($boardtable == 'overall'){
			$level = ceil(sqrt($row['Points']));
			echo "
				<tr>
					<td><a href=\"/user/$row[Id]/stats/\">$username</a></td>
					<td>$row[Points]</td>
					<td>🔼 $level<br><sub>".($row['Points']-($level-1)*($level-1)-1).' / '.($level*$level-($level-1)*($level-1)-1)."</sub></td>
				</tr>
			";
		}else{
			echo "
				<tr>
					<td><a href=\"/user/$row[userId]/stats/\">$username</a></td>
					<td>$row[Contributions]</td>
				</tr>
			";
		}
	}
	echo "
			</tbody>
		</table>
	";
}
?>