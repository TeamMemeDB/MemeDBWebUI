<?php 
require('../../meme.conn.php');
require('../includes/template.php');

session_start();

require('favourites.php');
require('stats.php');

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Get authorization details for discord API
require('../../meme.discord.php');

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
    header('Location: https://meme.yiays.com/user/');
  }
  // Exchange the auth code for a token
  $token = apiRequest($tokenURL, array(
    "grant_type" => "authorization_code",
    'client_id' => OAUTH2_CLIENT_ID,
    'client_secret' => OAUTH2_CLIENT_SECRET,
    'redirect_uri' => 'https://meme.yiays.com/user/',
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
    }else{
      $_SESSION['admin']=($conn->query('SELECT Admin FROM user WHERE Id = '.strval($user->id).' AND Admin = 1')->num_rows==1);
      if(isset($_SESSION['return'])){
        header('Location: '.$_SESSION['return']);
        $conn->close();
        die('You are being redirected.');
      }
    }
  }else{
    unset($_SESSION['return']);
    $conn->close();
    die('Failed to log in, please <a href="/user/?login">try again</a>.');
  }
}
if(get('error')) {
  echo '<h1>'.get('error').'</h1>';
  echo '<p>'.get('error_description').'</p>';
  $conn->close();
  unset($_SESSION['return']);
  die('Failed to log in, please <a href="/user/?login">try again</a>.');
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
if(get('login')) { // Start the login process by sending the user to Discord's authorization page
  if(isset($_SESSION['access_token'])){
    header('Location: https://meme.yiays.com/user/');
    die();
  }
	if(get('return')) $_SESSION['return']=urldecode(get('return'));
	else $_SESSION['return']='/sort/new';
  $params = array(
    'client_id' => OAUTH2_CLIENT_ID,
    'redirect_uri' => 'https://meme.yiays.com/user/',
    'response_type' => 'code',
    'scope' => 'identify email'
  );
  // Redirect the user to Discord's authorization page
  header('Location: https://discordapp.com/api/oauth2/authorize' . '?' . http_build_query($params));
	$conn->close();
  die();
}

// If the page hasn't died yet, show a default screen.
if(session('access_token')) {
  $user = apiRequest($apiURLBase);
	headr(['title'=>$user->username." | Account Settings"],$conn);
  ?>
  <div class="super">
    <div class="super-content">
      <h2>Logged In</h2>
      <p>Welcome, <?php  echo $user->username;?></p>
    </div>
    <div class="super-footer">
      <p><a href="?logout" class="btn">Logout</a></p>
    </div>
    <div class="super-bg">
      <img class="float-right" id="userphppfp" alt="<?php  echo $user->username;?>'s profile picture" src="https://cdn.discordapp.com/avatars/<?php  echo $user->id.'/'.$user->avatar;?>.jpg?size=256">
      <img class="stretch-fill blur dim" alt="<?php  echo $user->username;?>'s profile picture, but big and blury" src="https://cdn.discordapp.com/avatars/<?php  echo $user->id.'/'.$user->avatar;?>.jpg?size=256">
    </div>
  </div>
  <div class="control-panel">
    <nav>
      <ul>
        <a class="active" data-page="main"><li>Main</li></a>
        <a data-page="account"><li>Account Management</li></a>
      </ul>
    </nav>
    <div class="page" id="main-page">
      <h3>Account status</h3>
      <p>
        🟢 Your account is currently trusted, you have full access to all MemeDB features.
        <?php  if($_SESSION['admin']) echo "<br>🟢 You are also an admin, so you can manage meme flags, use the admin panel and view censored memes.";?>
      </p>
      <br><h3>Your category suggestions</h3>
      <ul class="listbox">
        <li>Nothing to report</li>
      </ul>
      <br><h3>Your pending reports</h3>
      <ul class="listbox">
        <li>Nothing to report</li>
      </ul>
    </div>
    <div class="page" id="account-page" style="display:none;">
      <h3>Secure your account</h3>
      <p>Your email address is <i><?php  echo $user->email;?></i>, this email address hasn't been verified yet.</p>
      <a class="btn" id="verify-email">Verify</a><br>
      <br><h3>Delete/Suspend your account</h3>
      <p><b>Be careful!</b> The following options are dangerous.</p>
      <a class="btn light" id="suspend-account">Suspend account</a><br>
      <sub>If your discord account is at risk of a breach, you can suspend your MemeDB account so you can't log in. You will need to verify your email address first so you can restore your account later.</sub><br><br>
      <a class="btn danger-bg light" id="delete-account">Delete account</a><br>
      <sub><b>This erases your contributions to MemeDB and disconnects the Discord account <?php  echo $_SESSION['user']->username.'<span class="dim">#'.$_SESSION['user']->discriminator;?></span>.</b></sub><br><br>
    </div>
  </div>
<?php 
} else {
  headr(['title'=>"User"],$conn);
  ?>
  <div class="super">
    <div class="super-content">
      <h2>Not logged in</h2>
    </div><div class="super-footer">
      <p><a href="?login" class="btn">Login</a></p>
    </div>
  </div>
  <div class="super">
    <div class="super-content">
      <h3>Manage your account</h3>
      <p>This is where you can manage your account, once logged in with Discord.</p>
    </div>
    <div class="super-bg" style="background:linear-gradient(to bottom, #737c88 0%,#333c48 100%);">
      <div class="bg-aside">
        <!--<img alt="vote on memes" src="/img/super-bg/voting.jpg" style="position:absolute;bottom:0;right:0;">-->
      </div>
    </div>
  </div>
  <?php 
}
?>
<sub><b>By signing in to MemeDB, you are accepting the <a href="/terms">Terms of Service and Privacy Policy</a>.</b></sub>
<?php 
footer();

$conn->close();

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