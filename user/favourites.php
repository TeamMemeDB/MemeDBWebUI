<?php 
/*
    Favourites browser
*/
require_once('../browse.php');

global $conn;
global $header;
global $filters;
global $limit;
global $memevote;
global $memes;

if(!isset($_GET['get'])) if(!$header) $header=headr(['title'=>"My Favourite Memes",'description'=>"Your personal list of favourite memes on this site.",'tags'=>['best','favourite','favorite']],$conn);
if(!isset($_GET['get'])){
    print('<h2>Your <span class="accent">favourited</span> memes;</h2>');
}

if(isset($_SESSION['access_token'])){
    $memes = $conn->query(
        'SELECT Id,Type,CollectionParent,Url,OriginalUrl,Nsfw,'.$memevote.',
        (SELECT COALESCE(SUM(memevote.Value),0) FROM memevote WHERE memeId=meme.Id) AS Votes
        FROM (meme RIGHT JOIN favourites ON meme.Id=favourites.memeId)
        LEFT JOIN edge ON meme.Id=edge.memeId
        WHERE '.$filters.' AND favourites.userId='.$_SESSION['user']->id.'
        GROUP BY meme.Id
        HAVING IFNULL(AVG(edge.Rating),4)<='.strval($_SESSION['spice']+0.5).'
        ORDER BY Votes DESC
        LIMIT '.$limit.';'
    );
}else{
    $conn->close();
    die("<p><b>You must be logged in to see this page!</p><a href='/user?login' class='btn'>Login</a>");
}


browse();
?>