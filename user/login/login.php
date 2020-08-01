<?php
require('../../../meme.conn.php');

session_start();

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Get authorization details for discord API
require('../../../meme.discord.php');

$authorizeURL = 'https://discordapp.com/api/oauth2/authorize';
$tokenURL = 'https://discordapp.com/api/oauth2/token';
$apiURLBase = 'https://discordapp.com/api/users/@me';

if(get('rememberme')){
	$params = session_get_cookie_params();
	setcookie(session_name(), $_COOKIE[session_name()], time() + 60*60*24*30, $params["path"], $params["domain"], $params["secure"], $params["httponly"]);
	$conn->close();
	die('1');
}
if(get('code')) { // When Discord redirects the user back here, there will be a "code" and "state" parameter in the query string
  if(isset($_SESSION['access_token'])){
    // This is an old request that has already been handled
    header('Location: https://meme.yiays.com/user/'.$_SESSION['user']->id.'/');
    die("You are being redirected...");
  }
  // Exchange the auth code for a token
  $token = apiRequest($tokenURL, array(
    "grant_type" => "authorization_code",
    'client_id' => OAUTH2_CLIENT_ID,
    'client_secret' => OAUTH2_CLIENT_SECRET,
    'redirect_uri' => 'https://meme.yiays.com/user/login/',
    'code' => get('code')
  ));
  if($token){
    $_SESSION['access_token'] = $token->access_token;
    $user = apiRequest($apiURLBase);
    $_SESSION['user'] = $user;
    if(!$conn->query("CALL AddUser(".strval($user->id).",'".$conn->escape_string($user->username)."',".strval($user->discriminator).")")){
      $params = array(
        'access_token' => session('access_token')
      );
      apiRequest('https://discordapp.com/api/oauth2/token/revoke',$params);
      session_destroy();
      printf("Error recording your login! Please try logging in later. ".$conn->error);
      $conn->close();
      die();
    }
    if($conn->query('SELECT Banned FROM user WHERE Id = '.strval($user->id).' AND Banned = 1')->num_rows==1){
      $params = array(
        'access_token' => session('access_token')
      );
      apiRequest('https://discordapp.com/api/oauth2/token/revoke',$params);
      session_destroy();
      $conn->close();
      die("You've been banned from MemeDB!");
    }
    
    $_SESSION['admin']=($conn->query('SELECT Admin FROM user WHERE Id = '.strval($user->id).' AND Admin = 1')->num_rows==1);
    if(isset($_SESSION['return'])){
      header('Location: '.$_SESSION['return']);
      $conn->close();
      die('You are being redirected.');
    }
  }else{
    unset($_SESSION['return']);
    $conn->close();
    die('Failed to log in, please <a href="/user/login/">try again</a>.');
  }
}
if(get('error')) {
  echo '<h1>'.get('error').'</h1>';
  echo '<p>'.get('error_description').'</p>';
  $conn->close();
  unset($_SESSION['return']);
  die('Failed to log in, please <a href="/user/login/">try again</a>.');
}
if(get('logout')) {
  $params = array(
    'access_token' => session('access_token')
  );
  apiRequest('https://discordapp.com/api/oauth2/token/revoke',$params);
	session_destroy();
	header('Location: https://meme.yiays.com/user/');
	$conn->close();
	die();
}

// Default behaviour
// Start the login process by sending the user to Discord's authorization page
if(isset($_SESSION['access_token'])){
	header('Location: https://meme.yiays.com/user/'.$_SESSION['user']->id.'/');
	die();
}
if(get('return')) $_SESSION['return']=urldecode(get('return'));
else $_SESSION['return']='/sort/new';
$params = array(
	'client_id' => OAUTH2_CLIENT_ID,
	'redirect_uri' => 'https://meme.yiays.com/user/login/',
	'response_type' => 'code',
	'scope' => 'identify email'
);
// Redirect the user to Discord's authorization page
header('Location: https://discordapp.com/api/oauth2/authorize' . '?' . http_build_query($params));
$conn->close();
die();

// some handy functions
function apiRequest($url, $post=FALSE, $headers=array()) {
  $ch = curl_init($url);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
  curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
  if($post){
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post));
	}
  $headers[] = 'Accept: application/json';
  if(session('access_token'))
    $headers[] = 'Authorization: Bearer ' . session('access_token');
	array_push($headers,"Content-Type: application/x-www-form-urlencoded");
  curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
  $response = curl_exec($ch);
  return json_decode($response);
}
function get($key, $default=NULL) {
  return array_key_exists($key, $_GET) ? (empty($_GET[$key]) ? True : $_GET[$key]) : $default;
}
function session($key, $default=NULL) {
  return array_key_exists($key, $_SESSION) ? $_SESSION[$key] : $default;
}
?>