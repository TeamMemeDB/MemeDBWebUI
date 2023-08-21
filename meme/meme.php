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
            'SELECT Id,Type,CollectionParent,Url,OriginalUrl,Hash,Color,Nsfw,COALESCE(SUM(memevote.Value),0) AS Votes,'.$memevote.'
            FROM meme LEFT JOIN edge ON meme.Id=edge.memeId
            LEFT JOIN memevote ON meme.Id = memevote.memeId
            WHERE '.$filters.' AND (Id = '.$id.' OR CollectionParent = Id)
            GROUP BY meme.Id
            HAVING IFNULL(AVG(edge.Rating),4)<='.strval($_SESSION['spice']+0.5).';'
        );
        if($memepreview->num_rows<1){
            $singleedge = $conn->query('SELECT IFNULL(AVG(edge.Rating),4) AS Edge,Nsfw,Hidden FROM meme LEFT JOIN edge ON meme.Id=edge.memeId WHERE meme.Id = '.$id.' GROUP BY meme.Id');
            if($singleedge->num_rows<1){
                $printpost.='<script>window.onload=function(){PopUp(true,"<h3>Unable to find meme!</h3><p>A meme by the provided ID doesn\'t seem to exist.</p>");}</script>';
                $header=headr(['title'=>"Meme not found"], $conn);
            }else{
                $row = $singleedge->fetch_assoc();
                $dict=['edge'=>$row['Edge'],'nsfw'=>$row['Nsfw'],'hidden'=>$row['Hidden']];
                $printpost.='<script>singleedge='.json_encode($dict).'</script>';
                $header=headr(['title'=>"Edgy Meme",'description'=>"This meme is too edgy to be shown in an embed. Open the link and consent to seeing it first!"], $conn);
            }
        }
        if(!isset($_GET['get'])&!$header){
            $mememeta = $conn->query(
                'SELECT Type,Hash,tag.Name AS tag,
                (
                    SELECT description.Text
                    FROM description
                    LEFT JOIN descvote ON descvote.descId = Id
                    WHERE memeId = meme.Id
                    ORDER BY COALESCE(SUM(Value),0) DESC
                    LIMIT 1
                ) AS TopDesc,
                (
                    SELECT COALESCE(SUM(Value),0)
                    FROM tagvote
                    WHERE tagId=tag.Id
                    AND memeId=meme.Id
                ) AS TagVote
                FROM (meme
                LEFT JOIN tagvote ON meme.Id = tagvote.memeId)
                LEFT JOIN tag ON tagvote.tagId = tag.Id
                WHERE meme.Id = '.$id
            );
            $desc = "No one has provided a description for this meme yet. Log in with discord and contribute yours!";
            $tags = [];
            $row = $mememeta->fetch_assoc();
            $hash = $row['Hash'];
            if(isset($row['TopDesc'])) $desc = $row['TopDesc'];
            array_push($tags,$row['Type']);
            if($row['Type']=='video'||$row['Type']=='webm') $desc = "This meme is a video! Open in the browser to play it.\n".$desc;
            while($row = $mememeta->fetch_assoc()){
                if(isset($row['TagVote'])&&$row['TagVote']>0) array_push($tags,$row['tag']);
            }
            $header=headr(['title'=>"Meme #".$id,'description'=>$desc,'tags'=>$tags,'image'=>"https://cdn.yiays.com/meme/${id}x${hash}.thumb.jpg"],$conn);
        }
    }else{
        $printpost.='<script>$(document).load(function(){PopUp(true,"<h3>Unable to find meme!</h3><p>This meme may have been deleted.</p>");});</script>';
    }
    browse();
    print($printpost);
}

if(str_replace('\\', '/', __FILE__)==$_SERVER['SCRIPT_FILENAME']){
	meme();
}
?>