<?php 
/*
    User favourites browser
*/
require_once('user.php');
require_once('../browse.php');

function favourites(User $favuser){
    global $conn;
    global $user;
    global $header;
    global $filters;
    global $limit;
    global $memevote;
    global $memes;
    
    if(is_null($favuser)){
        $header = headr(['title'=>"User not found"], $conn);
        print("<b>User not found!</b>");
        footer();
        $conn->close();
        die();
    }
    
    if(isset($_GET['togglefavouritesprivacy'])){
        if($favuser->id != $user->id) die("You're not logged in as this user!");
        
        $conn->query("UPDATE user SET FavouritesPrivacy = !FavouritesPrivacy WHERE Id = $favuser->id;");
        die(($conn->query("SELECT FavouritesPrivacy FROM user WHERE Id = $favuser->id"))->fetch_row()[0]);
    }

    if(!isset($_GET['get'])) if(!$header) $header=headr(['title'=>"$favuser->username's Favourited Memes",'description'=>"Your personal list of favourite memes on this site.",'tags'=>['best','favourite','favorite']],$conn);
    if(!isset($_GET['get'])){
        if($favuser->isme){
            echo '<h2>Your <span class="accent">favourited</span> memes;</h2>';
            echo "<input id=\"favouritesprivacy\" type=\"checkbox\" ".($favuser->favouritesprivacy?'checked':'')."/>
            <label for=\"favouritesprivacy\">&nbsp;Share publicly</label><br><br>";
        }
        else echo "<h2><a href=\"/user/$favuser->id/\">$favuser->username</a>'s <span class=\"accent\">favourited</span> memes;</h2>";
    }

    if($favuser->favouritesprivacy||$favuser->isme){
        $memes = $conn->query(
            'SELECT Id,Color,Width,Height,Type,Hash,CollectionParent,Url,OriginalUrl,Nsfw,'.$memevote.',
            (SELECT COALESCE(SUM(memevote.Value),0) FROM memevote WHERE memeId=meme.Id) AS Votes
            FROM (meme RIGHT JOIN favourites ON meme.Id=favourites.memeId)
            LEFT JOIN edge ON meme.Id=edge.memeId
            WHERE '.$filters.' AND favourites.userId='.$favuser->id.'
            GROUP BY meme.Id
            HAVING IFNULL(AVG(edge.Rating),4)<='.strval($_SESSION['spice']+0.5).'
            ORDER BY dateAdded DESC
            LIMIT '.$limit.';'
        );
        browse();
    }else{
        print("<b>This user isn't sharing their favourites.</b>");
        if(!isset($_GET['get'])) footer();
    }
}
?>