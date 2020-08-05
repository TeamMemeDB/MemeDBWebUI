<?php

$level_roles = [
	576 => '✨ Youngling', // Lvl 0-24
	2401 => '🐸 Pepe', // Lvl 25-49
	5476 => '🐍 Tread', // Lvl 50-74
	9800 => '👅 Thot', // Lvl 75-99
	22500 => '💯 100', // Lvl 100-149
	40000 => '👨‍❤️‍💋‍👨 gay', // Lvl 150-199
	999999999999 => '👌 Ok Hand' // Lvl 200+
];

function getuser($id): ?User{
	global $conn, $user;
	
	if($id == 0){
		$target = new User();
		$target->id = 0;
		$target->username = "Everyone";
		$target->anon = false;
	}
	elseif($id == $user->id){
    $target = $user;
    $result = $conn->query("SELECT FavouritesPrivacy,Points FROM user WHERE Id = ".$user->id);
    if($result){
      $row = $result->fetch_assoc();
			$target->favouritesprivacy = $row['FavouritesPrivacy'];
			$target->points = $row['Points'];
			$target->level = ceil(sqrt($target->points));
    }
  }else{
    $result = $conn->query("SELECT Id,Username,Discriminator,Avatar,Admin,Banned,FavouritesPrivacy,Points FROM user WHERE Id = ".$id);
    if($result){
			$row = $result->fetch_assoc();
			
			if(is_null($row['Id'])) return null;
			
      $target = new User();
      $target->id = $id;
      $target->account_url .= $target->id . '/';
      $target->avatar = $row['Avatar'];
      $target->username = $row['Username'];
      if(is_null($target->username)) $target->username = "Anonymous MemeDB User";
      else $target->anon = false;
      $target->discriminator = '#'.$row['Discriminator'];
			if($target->discriminator == '#') $target->discriminator = '';
      $target->admin = $row['Admin'];
      $target->banned = $row['Banned'];
      $target->favouritesprivacy = $row['FavouritesPrivacy'];
			$target->points = $row['Points'];
			$target->level = ceil(sqrt($target->points));
    }
	}
	
	return $target;
}

function superprofile(User $user){
	global $conn, $header, $level_roles;
	
	if(is_null($user)){
		http_response_code(404);
		$header = headr(['title'=>"User not found"], $conn);
		print("<b>User not found!</b>");
		footer();
		$conn->close();
		die();
	}
	
	$badges = "";
	foreach($level_roles as $scorereq=>$role){
		if($user->points < $scorereq){
			$badges .= "<a href=\"/leaderboard/overall/\" class=\"badge\" title=\"".($user->points-($user->level-1)*($user->level-1)-1).' / '.($user->level*$user->level-($user->level-1)*($user->level-1)-1)." Points until leveling up!\">$role (level $user->level)</a>";
			break;
		}
	}
	if($user->admin) $badges .= "<span class=\"badge\" title=\"This user is an administrator, responsible for moderating and maintaining MemeDB.\">🚨 Admin</span>";
	if($user->favouritesprivacy) $badges .= "<span class=\"badge\" title=\"This user is publicly sharing their favourites list.\">⭐ Curator</span>";
	if($user->anon) $badges .= "<span class=\"badge\" title=\"This user hasn't logged into the website, but they have used MemeDB externally.\">❔ Uninitiated</span>";
	if($user->banned) $badges .= "<span class=\"badge\" title=\"This user has lost access to their account.\">🖐 Banned</span>";
	if($user->id == '309270899909984267') $badges .= "<span class=\"badge\" title=\"This user is a bot.\">🤖 Bot</span>";
	
	if(strlen($badges) == 0 && $user->id > 0) $badges = "<span class=\"badge\" title=\"This user has no badges yet.\">No badges</span>";
	
	echo "
	<div class=\"super\">
		<div class=\"super-content\">
			".($_SERVER['REQUEST_URI']!="/user/$user->id/"?"<a href=\"/user/$user->id/\">":'')."<h2>$user->username<span class=\"dim\">$user->discriminator</span></h2>".($_SERVER['REQUEST_URI']!="/user/$user->id/"?'</a>':'')."
			<p>$badges</p>
		</div>
		<div class=\"super-footer\">
			<p>
				".($user->isme?"<a href=\"/login/?logout\" class=\"btn danger-bg light\">Logout</a>":($user->id != '309270899909984267' && $user->id > 0?"<a href=\"/report/?user=$user->id\" class=\"btn danger-bg light\">Report</a>":""))."
				".($user->favouritesprivacy||$user->isme?"<a href=\"/user/$user->id/favourites/\" class=\"btn accentbg\" title=\"View this user's favourite memes.\">Favourites</a>":"")."
				<a href=\"/user/$user->id/stats/\" class=\"btn\">Stats</a>
			</p>
		</div>
		<div class=\"super-bg\">
			<img class=\"float-right\" id=\"userphppfp\" alt=\"$user->username's profile picture\" width=\"256px\" height=\"256px\" src=\"".($user->id>0?"https://cdn.discordapp.com/avatars/$user->id/$user->avatar.jpg?size=256":"/img/icon.png")."\">
		</div>
	</div>";
}
?>