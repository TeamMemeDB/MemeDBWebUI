<?php 
/*
    API
*/
session_start();
require('../../meme.conn.php');

header('Content-Type: application/json');

$num2word=[
	0=>'zero',
	1=>'one',
	2=>'two',
	3=>'three',
	4=>'four',
	5=>'five'
];

//Setup browser-side storage for a preferred edge level
if(isset($_GET['setedge'])){
	$conn->close();
	if(ctype_digit($_GET['setedge'])){
		$edge=intval($_GET['setedge']);
		if($edge>=0&&$edge<=(isset($_SESSION['admin'])?4:1)){
			$_SESSION['spice']=strval($edge);
			die(json_encode(['success'=>1,'edge'=>$edge+1]));
		}else{
			die(json_encode(['success'=>0,'msg'=>'Invalid request.']));
		}
	}else{
		die(json_encode(['success'=>0,'msg'=>'Invalid request.']));
	}
}

if(isset($_GET['vote'])){
	if(isset($_SESSION['access_token'])){
		$id = $conn->real_escape_string($_GET['vote']);
		if(ctype_digit($id)){
			$value = $conn->real_escape_string($_GET['value']);
			if($value=='1'||$value=='-1'){
				$result=$conn->query('CALL AddMemeVote('.$id.','.$_SESSION['user']->id.','.$value.');');
				if(!$result) die(json_encode(['success'=>0,'msg'=>"A database error occured; ".$conn->error]));
				$result=$conn->query('SELECT COALESCE(SUM(Value),0) AS Value FROM memevote WHERE memeId = '.$id.';');
				$row=$result->fetch_assoc();
				$conn->close();
				die(json_encode(['success'=>1,'value'=>$row['Value']]));
			}elseif($value=='0'){
				$conn->query('DELETE FROM memevote WHERE memeId='.$id.' AND userId='.$_SESSION['user']->id.';');
				$result=$conn->query('SELECT COALESCE(SUM(Value),0) AS Value FROM memevote WHERE memeId = '.$id.';');
				$row=$result->fetch_assoc();
				$conn->close();
				die(json_encode(['success'=>1,'value'=>$row['Value']]));
			}else{
				$conn->close();
				die(json_encode(['success'=>0,'msg'=>"Invalid request!"]));
			}
		}else{
			$conn->close();
			die(json_encode(['success'=>0,'msg'=>"Invalid request!"]));
		}
	}else{
		$conn->close();
		die(json_encode(['success'=>0,'msg'=>"You must be logged in to use this!"]));
	}
}

if(isset($_GET['favourite'])){
	if(isset($_SESSION['access_token'])){
		$id = $conn->real_escape_string($_GET['favourite']);
		$value = $conn->real_escape_string($_GET['value']);
		if(ctype_digit($id)){
			if($value=='1'){
				$result=$conn->query("INSERT INTO favourites(userId,memeId) VALUES(".$_SESSION['user']->id.",$id);");
			}else if($value=='0'){
				$result=$conn->query('DELETE FROM favourites WHERE memeId='.$id.' AND userId='.$_SESSION['user']->id.';');
			}else{
				$conn->close();
				die(json_encode(['success'=>0,'msg'=>'Invalid request!']));
			}
			if(!$result){
				die(json_encode(['success'=>0,'msg'=>"Adding to favourites failed! ".$conn->error]));
			}
			$conn->close();
			die(json_encode(['success'=>1,'value'=>$value]));
		}else{
			$conn->close();
			die(json_encode(['success'=>0,'msg'=>"Invalid request!"]));
		}
	}else{
		$conn->close();
		die(json_encode(['success'=>0,'msg'=>"You must be logged in to use this!"]));
	}
}