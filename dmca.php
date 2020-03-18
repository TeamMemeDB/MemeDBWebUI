<?php 
require('../meme.conn.php');
require('includes/template.php');

headr(['title'=>"DMCA",'description'=>"If you are a copyright holder, you can place a DMCA takedown request to protect your intellectual property."],$conn);
?>
<h1>DMCA Takedown Request</h1>
<p>If you are a copyright holder, you can place a DMCA takedown request to protect your intellectual property.</p>
<sub>
    This website is still in development and handling DMCA requests hasn't been implemented. Contact the developer at
    <a href="mailto:yesiateyoursheep@gmail.com">yesiateyoursheep@gmail.com</a> if you need to place one.
</sub>
<?php 
footer();
?>