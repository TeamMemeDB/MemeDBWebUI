<?php 
require_once('../meme.conn.php');
require_once('includes/template.php');

headr(['title'=>"Page not found"], $conn);
?>
<h1>404 - Page not found</h1>
<p>Sorry, but the page you were looking for doesn't seem to exist, it may have been moved to a new location or there might be a typo in the url.</p>
<p>
    Here's some other pages that might be what you're looking for...
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/sort/top">Top rated memes</a></li>
        <li><a href="/sort/new">Recently added memes</a></li>
        <li><a href="/user">My account</a></li>
    </ul>
</p>
<?php 
footer();
?>