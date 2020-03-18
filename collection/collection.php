<?php 
/*
    Meme preview code
*/
require_once(dirname(__FILE__).'/../browse.php');

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

function meme(){
    global $conn;
	global $header;
	global $memepreview;
	global $memevote;
    global $filters;
    
    $printpost='';

    $id = $conn->real_escape_string(basename($_SERVER['PATH_INFO']));
    if(substr($id,-1)=='/'){// remove trailing slash
        $id=substr($id,0,strlen($id)-2);
    }
    if(strpos($id,'/')<strlen($id)){// remove anything before last slash
        $id=substr($id,strpos($id,'/'));
    }
    if(ctype_digit($id)){
        $memepreview = $conn->query(
            'SELECT Id,Type,CollectionParent,Url,OriginalUrl,Nsfw,COALESCE(SUM(memevote.Value),0) AS Votes,'.$memevote.'
            FROM meme LEFT JOIN edge ON meme.Id=edge.memeId
            LEFT JOIN memevote ON meme.Id = memevote.memeId
            WHERE Hidden = 0 AND (Id = '.$id.' OR CollectionParent = '.$id.')
            GROUP BY meme.Id
            HAVING CollectionParent = '.$id.' OR IFNULL(AVG(edge.Rating),4)<='.strval($_SESSION['spice']+0.5).'
            LIMIT 20;'
        );
        if($memepreview->num_rows<1){
            $singleedge = $conn->query('SELECT IFNULL(AVG(edge.Rating),4) AS Edge,Nsfw,Hidden FROM meme LEFT JOIN edge ON meme.Id=edge.memeId WHERE meme.Id = '.$id.' GROUP BY meme.Id');
            if($singleedge->num_rows<1){
                $printpost.='<script>singleedge={"missing":true};window.onload=function(){PopUp(true,"<h3>Unable to find collection!</h3><p>A collection by the provided ID doesn\'t seem to exist.</p>");}</script>';
            }else{
                $row = $singleedge->fetch_assoc();
                $dict=['edge'=>$row['Edge'],'nsfw'=>$row['Nsfw'],'hidden'=>$row['Hidden']];
                $printpost.='<script>singleedge='.json_encode($dict).'</script>';
            }
        }
        if(!isset($_GET['get'])&!$header){
            $header=headr(['title'=>"Collection #".$id,'description'=>"Todo: get top rated description.",'tags'=>['todo: get tags rated above 0'],'image'=>"https://cdn.yiays.com/meme/$id.thumb.jpg"],$conn);
        }
    }else{
        $printpost.='<script>$(document).load(function(){PopUp(true,"<h3>Unable to find collection!</h3><p>The provided ID in the title bar is invalid.</p>");});</script>';
    }
    if(isset($_GET['get'])){
        header('Content-Type: text/html');
        printmemes($memepreview,false,$conn);
    }else{
        browse();
        print($printpost);
    }
}

if(str_replace('\\', '/', __FILE__)==$_SERVER['SCRIPT_FILENAME']){
	meme();
}
?>