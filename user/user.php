<?php 
require('../../meme.conn.php');
require('../includes/template.php');
require('profile.php');

$url = $_SERVER['REQUEST_URI'];
$params = explode('/', substr(strtolower($url), 6));
if(end($params) == '') array_pop($params);

if(count($params)==0){ // GET /account/
  if(isset($_SESSION['access_token'])){
    header('Location: https://meme.yiays.com/user/'.$user->id.'/');
    die("You are being redirected...");
  }
  require('me.php');
  me(null);
}else{ // GET /account/{id}/*/
  $target = getuser($params[0]);
  
  if(count($params)==1){ // GET /account/{id}/
    if($target->isme){
      require('me.php');
      me($target);
    }
    else{
      require('other.php');
      other($target);
      die();
    }
  }else{
    if($params[1] == 'favourites'){ // GET /account/{id}/favourites/
      require('favourites.php');
      favourites($target);
      die();
    }elseif($params[1] == 'stats'){ // GET /account/{id}/stats/
      require('stats.php');
      stats($target);
      die();
    }
  }
}
?>

<sub><b>By signing in to MemeDB, you are accepting the <a href="/terms">Terms of Service and Privacy Policy</a>.</b></sub>
<?php 
footer();

$conn->close();
?>