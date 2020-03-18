<?php 
/*
    Tag browser
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
    $name=substr($id,0,(strpos($id,'/')==0)?strlen($id):strpos($id,'/'));
    $id=substr($id,strlen($name)+1);
}

if(!isset($_GET['get'])){
    if(!$header) $header=headr(['title'=>'#'.$name." memes",'description'=>"A collection of memes relevant to the ".$name." tag.",'tags'=>['tag','hashtag','twitter',$name]],$conn);
    print('<h2>Results for <span class="accent">#'.$name.'</span>;</h2>');
}
$memes = $conn->query(
    'SELECT meme.Id AS Id,Type,CollectionParent,Url,OriginalUrl,Nsfw,'.$memevote.',
    (SELECT COALESCE(SUM(memevote.Value),0) FROM memevote WHERE memeId=meme.Id) AS Votes
    FROM ((meme LEFT JOIN tagvote ON meme.Id = tagvote.memeId)
    LEFT JOIN tag ON tagvote.tagId = tag.Id)
    LEFT JOIN edge ON meme.Id=edge.memeId
    WHERE '.$filters.' and tag.Id = '.$id.'
    GROUP BY meme.Id
    HAVING IFNULL(AVG(edge.Rating),4)<='.strval($_SESSION['spice']+0.5).'
    ORDER BY SUM(tagvote.Value) DESC
    LIMIT '.$limit.';'
);

browse();

?>