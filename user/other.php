<?php
/*
	View another user's profile
*/
require_once('user.php');
require_once('profile.php');

function other(User $user = null){
	global $conn, $header;
	
	if(is_null($user)){
		$header = headr(['title'=>"User not found"], $conn);
		print("<b>User not found!</b>");
		footer();
		$conn->close();
		die();
	}
	
	if(!$header) $header = headr(['title'=>"$user->username's Profile", 'description'=>"$user->username is a contributor on MemeDB. View their statistics and favourited memes."], $conn);
	
	superprofile($user);
	
	footer();
}
?>