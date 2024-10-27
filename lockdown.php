<?php 
require_once('../meme.conn.php');
require_once('includes/template.php');

headr(['title'=>"Database is read only"], $conn);
?>
<h1>Database is read only</h1>
<p>Logging in, rating memes, and contributing metadata is currently disabled. Please try again later.</p>
<p>
    Here's some other things you can do on MemeDB for now...
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/sort/top">Top rated memes</a></li>
        <li><a href="/sort/new">Recently added memes</a></li>
    </ul>
</p>
<?php 
footer();
?>