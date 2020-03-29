<?php 
/*
    Category browser
*/
require_once('../browse.php');

global $conn;
global $header;
global $filters;
global $limit;
global $memevote;
global $memes;

$id = $conn->real_escape_string($_SERVER['PATH_INFO']);
$id=str_replace('+',' ',substr($id,1));//remove leading slash
if(substr($id,-1)=='/'){// remove trailing slash
    $id=substr($id,0,strlen($id)-1);
}
if(strpos($id,'/')<strlen($id)){// remove anything before last slash
    $name=urldecode(substr($id,0,(strpos($id,'/')==0)?strlen($id):strpos($id,'/')));
    $id=substr($id,strlen($name)+1);
}

if(strlen($id)==0|strlen($name)==0){
    die('<h1>400 - Bad Request</h1>');
}

if(!isset($_GET['get'])) if(!$header) $header=headr(['title'=>$name." memes",'description'=>"Todo: get real name and description of category.",'tags'=>['category',$name]],$conn);
$memes = $conn->query(
    'SELECT meme.Id AS Id,Color,Width,Height,Hash,Type,CollectionParent,Url,OriginalUrl,Nsfw,'.$memevote.',
    (SELECT COALESCE(SUM(memevote.Value),0) FROM memevote WHERE memeId=meme.Id) AS Votes
    FROM ((meme LEFT JOIN categoryvote ON meme.Id = categoryvote.memeId)
    LEFT JOIN category ON categoryvote.categoryId = category.Id)
    LEFT JOIN edge ON meme.Id=edge.memeId
    WHERE '.$filters.' and category.Id = '.$id.'
    GROUP BY meme.Id
    HAVING IFNULL(AVG(edge.Rating),4)<='.strval($_SESSION['spice']+0.5).'
    ORDER BY COUNT(categoryvote.Value) DESC
    LIMIT '.$limit.';'
);
if(!isset($_GET['get'])){
    print('<h2><span class="accent">'.$name.'</span> memes;</h2>');
}

browse();
?>