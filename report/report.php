<?php 
/*
    User report handler.
*/
require('../../meme.conn.php');
require('../includes/template.php');

require_once('../browse.php');

global $conn;
global $header;
global $filters;
global $memevote;

$type = NULL;
$id = NULL;
if(array_key_exists('PATH_INFO',$_SERVER)){
    $id = $conn->real_escape_string($_SERVER['PATH_INFO']);
    $id=str_replace('+',' ',substr($id,1));//remove leading slash
    if(substr($id,-1)=='/'){// remove trailing slash
        $id=substr($id,0,strlen($id)-1);
    }
    if(strpos($id,'/')<strlen($id)){// remove anything before last slash
        $type=urldecode(substr($id,0,(strpos($id,'/')==0)?strlen($id):strpos($id,'/')));
        $id=substr($id,strlen($type)+1);
    }
    if(!in_array($type,['meme','user','desc','trans','tag','ticket'])) $type=NULL;
}

$header = headr(['title'=>"Report",'description'=>"MemeDB moderators take misuse of MemeDB very seriously. Report memes here and we will consider them for deletion as soon as possible.",'tags'=>['report','memedb','misuse']],$conn);

?>
<h1>Report</h1>
<p>MemeDB moderators take misuse of MemeDB very seriously. Report memes here and we will consider them for deletion as soon as possible.</p>
<p>Please refer to the <a href="/terms">Terms of Service</a> for what we do and don't consider misuse.</p>
<?php 
if($type!=NULL&$id!=NULL){
    echo "You are reporting on $type#$id.";
    if($type=='meme'){
        $meme = $conn->query(
            'SELECT Id,Color,Width,Height,Hash,Type,CollectionParent,Url,OriginalUrl,Nsfw,'.$memevote.',
            (SELECT COALESCE(SUM(memevote.Value),0) FROM memevote WHERE memeId=Id) AS Votes
            FROM meme
            WHERE '.$filters.' AND Id = '.$id.'
            GROUP BY Id
            LIMIT 1;'
        );

        echo "<p>Here is a preview;</p>";
        echo "<div class='memewrapper' style='padding-bottom:0;'>";
        printmemes($meme,'0,1',$conn);
        echo "<!--END-->";
        echo "</div>";
    }

    ?>
    <form action="/api?report" method="POST" autocomplete="off">
        <textarea name="complaint" rows="10" style="max-width:20em;" placeholder="Please leave your complaint here."></textarea>
        <br><input type="submit" class="btn" value="Submit">
    </form>
    <?php 
}else{?>
    <h2>How to report</h2>
    <p>
        You can report users, memes, tags, descriptions and transcriptions by finding the relevant option when viewing anything of that type.
    </p>
<?php }?>
<p><sub>Reporting is still being developed. You might not be able to report all types of content yet.</sub></p>
<?php 

footer(true);
?>