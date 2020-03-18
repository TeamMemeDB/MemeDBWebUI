<?php 
/*
    Tutorial section
*/
require('../../meme.conn.php');
require('../includes/template.php');

$header = headr(['title'=>"Tutorial",'description'=>"Learn how to use more advanced features in MemeDB here. A manual has been written as well. Everything to do with learning how to use MemeDB is here!",'tags'=>['memedb','tutorial','learn','manual','guide','how to','in memedb','meme db','help']],$conn);
?>
<h1>Tutorial</h1>
<p>A series of tutorials for how to use MemeDB are being created...</p>
<p>In the mean time, you can <a href="manual.pdf">Read the official manual</a></p>
<sub>Some features discussed are still in development or have changed since the writing of the manual.</sub>
<?php 
footer(false);
?>