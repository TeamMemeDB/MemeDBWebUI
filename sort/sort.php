<?php 
/*
    Sorted list browser
*/
require_once('../browse.php');

global $conn;
global $header;
global $filters;
global $limit;
global $memevote;
global $memes;

$name = $conn->real_escape_string($_SERVER['PATH_INFO']);
$name=str_replace('+',' ',substr($name,1));//remove leading slash
if(substr($name,-1)=='/'){// remove trailing slash
    $name=substr($name,0,strlen($name)-1);
}
$name=urldecode(substr($name,0,(strpos($name,'/')==0)?strlen($name):strpos($name,'/')));

if($name=='top'){
    if(!isset($_GET['get'])) if(!$header) $header=headr(['title'=>"Top Memes",'description'=>"A list of top rated memes by you, the users.",'tags'=>['top','best','rated']],$conn);
    $memes = $conn->query(
        'SELECT Id,Color,Width,Height,Hash,Type,CollectionParent,Url,OriginalUrl,Nsfw,'.$memevote.',
        (SELECT COALESCE(SUM(memevote.Value),0) FROM memevote WHERE memeId=meme.Id) AS Votes
        FROM meme LEFT JOIN edge ON meme.Id=edge.memeId
        WHERE '.$filters.'
        GROUP BY meme.Id
        HAVING IFNULL(AVG(edge.Rating),4)<='.strval($_SESSION['spice']+0.5).($_SESSION['spice']==4?' AND IFNULL(AVG(edge.Rating),4)>=3.5':'').'
        ORDER BY Votes DESC
        LIMIT '.$limit.';'
    );
}
else if($name=='random'){
    if(!isset($_GET['get'])){
        if(!$header) $header=headr(['title'=>"Random Memes",'description'=>"A list of random memes, picked each day, see something new today!",'tags'=>['random','daily','randomly selected']],$conn);
        print('<script>window.onload=function(){PopUp(true,"to be implemented...");};</script><!--END-->');
    }
}
else if($name=='new'){
    if(!isset($_GET['get'])) if(!$header) $header=headr(['title'=>"Latest Memes",'description'=>"The memes added most recently to MemeDB. Updated instantly.",'tags'=>['memes','meme','latest','new','fresh']],$conn);
    $memes = $conn->query(
        'SELECT Id,Color,Width,Height,Hash,Type,CollectionParent,Url,OriginalUrl,Nsfw,'.$memevote.',
        (SELECT COALESCE(SUM(memevote.Value),0) FROM memevote WHERE memeId=meme.Id) AS Votes
        FROM meme LEFT JOIN edge ON meme.Id=edge.memeId
        WHERE '.$filters.'
        GROUP BY meme.Id
        HAVING IFNULL(AVG(edge.Rating),4)<='.strval($_SESSION['spice']+0.5).($_SESSION['spice']==4?' AND IFNULL(AVG(edge.Rating),4)>=3.5':'').'
        ORDER BY Id DESC
        LIMIT '.$limit.';'
    );
}
else if($name=='old'){
    if(!isset($_GET['get'])) if(!$header) $header=headr(['title'=>"Latest Memes",'description'=>"The first memes added to MemeDB, this is their legacy.",'tags'=>['memes','meme','oldest','old','classic']],$conn);
    $memes = $conn->query(
        'SELECT Id,Color,Width,Height,Hash,Type,CollectionParent,Url,OriginalUrl,Nsfw,'.$memevote.',
        (SELECT COALESCE(SUM(memevote.Value),0) FROM memevote WHERE memeId=meme.Id) AS Votes
        FROM meme LEFT JOIN edge ON meme.Id=edge.memeId
        WHERE '.$filters.'
        GROUP BY meme.Id
        HAVING IFNULL(AVG(edge.Rating),4)<='.strval($_SESSION['spice']+0.5).($_SESSION['spice']==4?' AND IFNULL(AVG(edge.Rating),4)>=3.5':'').'
        ORDER BY Id ASC
        LIMIT '.$limit.';'
    );
}
else{
    die('<h1>400 - Bad Request</h1>');
}
if(!isset($_GET['get'])){
    print('<h2><span class="accent">'.$name.'</span> memes;</h2>');
}

browse();
?>