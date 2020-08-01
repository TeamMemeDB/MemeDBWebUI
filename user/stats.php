<?php
/*
	User stats
*/
require_once('user.php');

function stats(User $user){
	global $conn, $header;
    
	if(is_null($user)){
		$header = headr(['title'=>"User not found"], $conn);
		print("<b>User not found!</b>");
		footer();
		$conn->close();
		die();
	}
	
	if(!$header) $header = headr(['title'=>"$user->username's Stats", 'description'=>"$user->username's contribution statistics from their account on MemeDB."], $conn);
	
	echo '<p><i>Coming soon...</i></p>';
	
	footer();
}
?>