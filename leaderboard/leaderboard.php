<?php 
require('../../meme.conn.php');
require('../includes/template.php');

$leaderboards = [
	'described'=>"top contributers who have described what is happening / provided wider context in memes.",
	'transcribed'=>"top contributors who have transcribed all written and spoken words in memes.",
	'categorized'=>"top contributors who have categorized memes by media/humour.",
	'tagged'=>"top contributors who have tagged memes with their trends, contents, people, and humour.",
	'edged'=>"top contributors who help the database group memes up by their edginess, protecting innocent viewers.",
	'rated'=>"top users who have upvoted or downvoted as many memes as possible.",
	'overall'=>"top contributers overall - based on a weighted score favouring contributions that take more time."
];
$leaderboardtables = [
	'described'=>'description',
	'transcribed'=>'transcription',
	'categorized'=>'categoryvote',
	'tagged'=>'tagvote',
	'edged'=>'edge',
	'rated'=>'memevote',
	'overall'=>'overall'
];

$url = $_SERVER['REQUEST_URI'];
$params = explode('/', substr(strtolower($url), 13));
if(end($params) == '') array_pop($params);

if(count($params)==0){ // GET /leaderboard/
  require('showboards.php');
  show_boards();
}else{ // GET /leaderboard/{id}/*/
	if(in_array($params[0], array_keys($leaderboards))){
		require('showboards.php');
		show_board($params[0]);
	}else{
		http_response_code(404);
		headr(['title'=>"Leaderboard not found!"], $conn);
		print("Leaderboard not found!");
		print_r($params[0]);
	}
}

footer();

$conn->close();
?>