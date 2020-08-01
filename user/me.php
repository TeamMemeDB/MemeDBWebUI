<?php
/*
	User account management
*/
require_once('user.php');
require_once('profile.php');

function me(User $user = null){
	global $conn;
	if(!is_null($user)) {
		headr(['title'=>$user->username." | Account Settings"],$conn);
		
		superprofile($user);
		
		echo "
		<div class=\"control-panel\">
			<nav>
				<ul>
					<a class=\"active\" data-page=\"main\"><li>Main</li></a>
					<a data-page=\"account\"><li>Account Management</li></a>
				</ul>
			</nav>
			<div class=\"page\" id=\"main-page\">
				<h3>Account status</h3>
				<p>
					🟢 Your account is currently trusted, you have full access to all MemeDB features.
					".($user->admin?'<br>🟢 You are also an admin, so you can manage meme flags, use the admin panel and view censored memes.':'')."
				</p>
				<br><h3>Your category suggestions</h3>
				<ul class=\"listbox\">
					<li>Nothing to report</li>
				</ul>
				<br><h3>Your pending reports</h3>
				<ul class=\"listbox\">
					<li>Nothing to report</li>
				</ul>
			</div>
			<div class=\"page\" id=\"account-page\" style=\"display:none;\">
				<h3>Secure your account</h3>
				<p>Your email address is <i>$user->email</i>, this email address hasn't been verified yet.</p>
				<a class=\"btn\" id=\"verify-email\">Verify</a><br>
				<br><h3>Delete/Suspend your account</h3>
				<p><b>Be careful!</b> The following options are dangerous.</p>
				<a class=\"btn light\" id=\"suspend-account\">Suspend account</a><br>
				<sub>If your discord account is at risk of a breach, you can suspend your MemeDB account so you can't log in. You will need to verify your email address first so you can restore your account later.</sub><br><br>
				<a class=\"btn danger-bg light\" id=\"delete-account\">Delete account</a><br>
				<sub><b>This erases your contributions to MemeDB and disconnects the Discord account $user->username<span class=\"dim\">$user->discriminator</span>.</b></sub><br><br>
			</div>
		</div>";
	} else {
		headr(['title'=>"User"],$conn);
		?>
		<div class="super">
			<div class="super-content">
				<h2>Not logged in</h2>
			</div><div class="super-footer">
				<p><a href="/user/login/?return=/user/" class="btn">Login</a></p>
			</div>
		</div>
		<div class="super">
			<div class="super-content">
				<h3>Manage your account</h3>
				<p>This is where you can manage your account, once logged in with Discord.</p>
			</div>
			<div class="super-bg" style="background:linear-gradient(to bottom, #737c88 0%,#333c48 100%);"></div>
		</div>
		<?php 
	}
}
?>