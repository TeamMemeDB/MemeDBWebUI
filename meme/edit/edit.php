<?php 
/*
    Meme editor code
*/
require_once(dirname(__FILE__).'/../meme.php');

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

global $conn;
global $header;
global $memes;
global $memepreview;
global $memevote;
global $limit;
global $filters;

$id = $conn->real_escape_string(basename($_SERVER['PATH_INFO']));
if(substr($id,-1)=='/'){// remove trailing slash
    $id=substr($id,0,strlen($id)-2);
}
if(strpos($id,'/')<strlen($id)){// remove anything before last slash
    $id=substr($id,strpos($id,'/'));
}

if(isset($_SESSION['access_token'])){
    if(isset($_GET['nsfw'])){
        if($user->admin){
            $nsfw = $_GET['nsfw']=='1'?'1':'0'; //enforce binary
            if($conn->query('UPDATE meme SET Nsfw = '.$nsfw.' WHERE Id = '.$id.';')){
                $conn->close();
                die(json_encode(['success'=>1]));
            }else{
                //$conn->close();
                die(json_encode(['success'=>0,'msg'=>'Failed to set nsfw status! '.$conn->error]));
            }
        }else{
            $conn->close();
            die(json_encode(['success'=>0,'msg'=>'Only admins can change this!']));
        }
    }
    else if(isset($_GET['webm'])){
        $conn->close();
        if($user->admin){
            die(json_encode(['success'=>0,'msg'=>'To be implemented...'])); //TODO
        }else{
            die(json_encode(['success'=>0,'msg'=>'Only admins can change this!']));
        }
    }
    else if(isset($_GET['trans'])){
        $editId = isset($_GET['edit'])?($_GET['edit']=='undefined'?'NULL':$_GET['edit']):'NULL';
        if(!ctype_digit($editId) && $editId!='NULL'){
            $conn->close();
            die(json_encode(['success'=>0,'msg'=>'Invalid request!']));
        }
        $text = $conn->real_escape_string(nl2br(strip_tags($_POST['text'])));
        if(strlen($text)<3){
            $conn->close();
            die(json_encode(['success'=>0,'msg'=>'The provided transcripton is too short.']));
        }
        
        $result = $conn->query("INSERT INTO transcription(userId,memeId,editId,Text) VALUES(".$user->id.",$id,$editId,'$text');");
        if(!$result){
            //$conn->close();
            die(json_encode(['success'=>0,'msg'=>'Failed to submit your transcription! '.$conn->error]));
        }
        $result = $conn->query("INSERT IGNORE INTO transvote(transId,userId,Value) VALUES((SELECT LAST_INSERT_ID()),".$user->id.",1);");
        if(!$result){
            $conn->close();
            die(json_encode(['success'=>0,'msg'=>'Your transcription was added, but your automatic vote wasn\'t counted. Please refresh the page. '.$conn->error]));
        }
        $result = $conn->query("SELECT 1 AS success,Id,Text,SUM(Value) AS Votes FROM transcription JOIN transvote ON Id=transId WHERE Id=(SELECT LAST_INSERT_ID()) GROUP BY Id;");
        if(!$result){
            $conn->close();
            die(json_encode(['success'=>0,'msg'=>'Failed to refresh transcriptions! Please refresh the page. '.$conn->error]));
        }
        else{
            $conn->close();
            die(json_encode($result->fetch_assoc()));
        }
    }
    else if(isset($_GET['desc'])){
        $editId = isset($_GET['edit'])?($_GET['edit']=='undefined'?'NULL':$_GET['edit']):'NULL';
        if(!ctype_digit($editId) && $editId!='NULL'){
            $conn->close();
            die(json_encode(['success'=>0,'msg'=>'Invalid request!']));
        }
        $text = $conn->real_escape_string(nl2br(strip_tags($_POST['text'])));
        if(strlen($text)<3){
            $conn->close();
            die(json_encode(['success'=>0,'msg'=>'The provided descripton is too short.']));
        }
        
        $result = $conn->query("INSERT INTO description(userId,memeId,editId,Text) VALUES(".$user->id.",$id,$editId,'$text');");
        if(!$result){
            //$conn->close();
            die(json_encode(['success'=>0,'msg'=>'Failed to submit your description! '.$conn->error]));
        }
        $result = $conn->query("INSERT IGNORE INTO descvote(descId,userId,Value) VALUES((SELECT LAST_INSERT_ID()),".$user->id.",1);");
        if(!$result){
            $conn->close();
            die(json_encode(['success'=>0,'msg'=>'Your description was added, but your automatic vote wasn\'t counted. Please refresh the page. '.$conn->error]));
        }
        $result = $conn->query("SELECT 1 AS success,Id,Text,SUM(Value) AS Votes FROM description JOIN descvote ON Id=descId WHERE Id=(SELECT LAST_INSERT_ID()) GROUP BY Id;");
        if(!$result){
            $conn->close();
            die(json_encode(['success'=>0,'msg'=>'Failed to refresh descriptions! Please refresh the page. '.$conn->error]));
        }
        else{
            $conn->close();
            die(json_encode($result->fetch_assoc()));
        }
    }
    else if(isset($_GET['addtag'])){
        $tag = $conn->real_escape_string($_GET['addtag']);
        
        $result = $conn->query("SELECT Id FROM tag WHERE Name LIKE \"{$tag}\" LIMIT 1;");
        $tagid = $result->fetch_array()[0];
        if($result->num_rows==0){
            $result = $conn->query("INSERT INTO tag(Name) VALUE(\"{$tag}\");");
            if(!$result){
                $conn->close();
                die(json_encode(['success'=>0,'msg'=>'Failed to create new tag! '.$conn->error]));
            }
            $result = $conn->query('SELECT LAST_INSERT_ID();');
            $tagid = $result->fetch_array()[0];
        }
        
        $result = $conn->query('INSERT IGNORE INTO tagvote(tagId,memeId,userId,Value) VALUES('.$tagid.','.$id.','.$user->id.',1);');
        if(!$result){
            $conn->close();
            die(json_encode(['success'=>0,'msg'=>'Voting for the tag failed! '.$conn->error]));
        }
        $result = $conn->query('SELECT Name,SUM(Value) AS Votes FROM tag LEFT JOIN tagvote ON Id=tagId WHERE memeId='.$id.' AND Id='.$tagid);
        $row = $result->fetch_assoc();
        $conn->close();
        die(json_encode(['success'=>1,'name'=>$row['Name'],'votes'=>$row['Votes']]));
    }
    else if(isset($_GET['unvotetag'])){
        $tag = $conn->real_escape_string($_GET['unvotetag']);
        
        $result=$conn->query('DELETE IGNORE FROM tagvote WHERE tagId=(SELECT Id FROM tag WHERE Name LIKE "'.$tag.'" LIMIT 1) AND memeId='.$id.' AND userId='.$user->id.';');
        if(!$result){
            $conn->close();
            die(json_encode(['success'=>0,'msg'=>'Tag unvote failed! '.$conn->error]));
        }
        $result = $conn->query('SELECT Name,SUM(Value) AS Votes FROM tag LEFT JOIN tagvote ON Id=tagId WHERE memeId='.$id.' AND Id=(SELECT Id FROM tag WHERE Name LIKE "'.$tag.'" LIMIT 1)');
        if(!$result){
            $conn->close();
            die(json_encode(['success'=>0,'msg'=>'Tag unvote failed! '.$conn->error]));
        }
        $row = $result->fetch_assoc();
        $conn->close();
        die(json_encode(['success'=>1,'name'=>$row['Name'],'votes'=>$row['Votes']]));
    }
    else if(isset($_GET['rmtag'])){
        $tag = $conn->real_escape_string($_GET['rmtag']);
        
        $result=$conn->query('INSERT INTO tagvote(tagId,memeId,userId,Value) VALUES((SELECT Id FROM tag WHERE Name LIKE "'.$tag.'" LIMIT 1),'.$id.','.$user->id.',-1) ON DUPLICATE KEY UPDATE Value=-1');
        if(!$result){
            $conn->close();
            die(json_encode(['success'=>0,'msg'=>'Tag remove failed! '.$conn->error]));
        }
        $result = $conn->query('SELECT Name,SUM(Value) AS Votes FROM tag LEFT JOIN tagvote ON Id=tagId WHERE memeId='.$id.' AND Id=(SELECT Id FROM tag WHERE Name LIKE "'.$tag.'" LIMIT 1)');
        $row = $result->fetch_assoc();
        $conn->close();
        die(json_encode(['success'=>1,'name'=>$row['Name'],'votes'=>$row['Votes']]));
    }
    else if(isset($_GET['addcat'])){
        $cat = $conn->real_escape_string($_GET['addcat']);
        
        $result = $conn->query('SELECT Id FROM category WHERE Name LIKE "'.$cat.'" LIMIT 1;');
        if($result->num_rows==0){
            $result = $conn->query('INSERT IGNORE INTO categorysuggestion(userId,Name) VALUE('.$user->id.',"'.$cat.'");');
            if($result){
                $conn->close();
                die(json_encode(['success'=>0.5,'msg'=>'Your tag has been suggested, if it\'s approved, you will be notified. You can add a description for the category, or remove the suggestion, on your profile.']));
            }else{
                $conn->close();
                die(json_encode(['success'=>0,'msg'=>'Failed to submit your category suggestion! '.$conn->error]));
            }
        }
        $catid = $result->fetch_array()[0];
        
        $result = $conn->query('INSERT IGNORE INTO categoryvote(categoryId,memeId,userId,Value) VALUES('.$catid.','.$id.','.$user->id.',1);');
        if(!$result){
            $conn->close();
            die(json_encode(['success'=>0,'msg'=>'Voting for the category failed! '.$conn->error]));
        }
        $result = $conn->query('SELECT Name,SUM(Value) AS Votes FROM category LEFT JOIN categoryvote ON Id=categoryId WHERE memeId='.$id.' AND Id='.$catid);
        $row = $result->fetch_assoc();
        $conn->close();
        die(json_encode(['success'=>1,'name'=>$row['Name'],'votes'=>$row['Votes']]));
    }
    else if(isset($_GET['unvotecat'])){
        $cat = $conn->real_escape_string($_GET['unvotecat']);
        
        $result=$conn->query('DELETE IGNORE FROM categoryvote WHERE categoryId=(SELECT Id FROM category WHERE Name LIKE "'.$cat.'" LIMIT 1) AND memeId='.$id.' AND userId='.$user->id.';');
        if(!$result){
            $conn->close();
            die(json_encode(['success'=>0,'msg'=>'Category unvote failed! '.$conn->error]));
        }
        $result = $conn->query('SELECT Name,SUM(Value) AS Votes FROM category LEFT JOIN categoryvote ON Id=categoryId WHERE memeId='.$id.' AND Id=(SELECT Id FROM category WHERE Name LIKE "'.$cat.'" LIMIT 1)');
        if(!$result){
            $conn->close();
            die(json_encode(['success'=>0,'msg'=>'Category unvote failed! '.$conn->error]));
        }
        $row = $result->fetch_assoc();
        $conn->close();
        die(json_encode(['success'=>1,'name'=>$row['Name'],'votes'=>$row['Votes']]));
    }
    else if(isset($_GET['rmcat'])){
        $cat = $conn->real_escape_string($_GET['rmcat']);
        
        $result=$conn->query('INSERT INTO categoryvote(categoryId,memeId,userId,Value) VALUES((SELECT Id FROM category WHERE Name LIKE "'.$cat.'" LIMIT 1),'.$id.','.$user->id.',-1) ON DUPLICATE KEY UPDATE Value=-1');
        if(!$result){
            $conn->close();
            die(json_encode(['success'=>0,'msg'=>'Category remove failed! '.$conn->error]));
        }
        $result = $conn->query('SELECT Name,SUM(Value) AS Votes FROM category LEFT JOIN categoryvote ON Id=categoryId WHERE memeId='.$id.' AND Id=(SELECT Id FROM category WHERE Name LIKE "'.$cat.'" LIMIT 1)');
        $row = $result->fetch_assoc();
        $conn->close();
        die(json_encode(['success'=>1,'name'=>$row['Name'],'votes'=>$row['Votes']]));
    }
    else if(isset($_GET['edge'])){
        $edge = intval($_GET['edge']);
        if($edge>=0&&$edge<=(isset($user->admin)?4:1)){
            $result=$conn->query('INSERT INTO edge(memeId,userId,Rating) VALUES('.$id.','.$user->id.','.$edge.') ON DUPLICATE KEY UPDATE Rating='.$edge);
            if(!$result){
                $conn->close();
                die(json_encode(['success'=>0,'msg'=>'Adding your edge vote failed! '.$conn->error]));
            }
            $result = $conn->query('SELECT IFNULL(AVG(Rating),4) AS Edge,(SELECT Rating FROM edge WHERE memeId='.$id.' AND userId='.$user->id.') AS EdgeVote FROM edge WHERE memeId='.$id);
            $row = $result->fetch_assoc();
            $conn->close();
            die(json_encode(['success'=>1,'Edge'=>$row['Edge'],'EdgeVote'=>($row['EdgeVote']==null?-1:$row['EdgeVote'])]));
        }else{
            $conn->close();
            die(json_encode(['success'=>0,'msg'=>'You\'re not authorized to set an edge level like that!']));
        }
    }
    
    $memepreview = $conn->query(
        'SELECT meme.Id AS Id,Type,CollectionParent,Url,OriginalUrl,Nsfw,Hash,Color,
        description.Text AS Description,description.Id AS DescId,
        transcription.Text AS Transcription,transcription.Id AS TransId,
        category.Name AS category,
        tag.Name AS tag,
        IFNULL(AVG(edge.Rating),4) AS Edge,
        (SELECT Rating FROM edge WHERE memeId='.$id.' AND userId='.$user->id.') AS EdgeVote,
        (SELECT COALESCE(SUM(Value),0) FROM descvote WHERE descId=description.Id) AS DescVote,
        (SELECT COALESCE(SUM(Value),0) FROM transvote WHERE transId=transcription.Id) AS TransVote,
        (SELECT COALESCE(SUM(Value),0) FROM categoryvote WHERE categoryId=category.Id AND memeId=meme.Id) AS CategoryVote,
        (SELECT COALESCE(SUM(Value),0) FROM tagvote WHERE tagId=tag.Id AND memeId=meme.Id) AS TagVote
        FROM (((((((meme
        LEFT JOIN description ON meme.Id = description.memeId)
        LEFT JOIN transcription ON meme.Id = transcription.memeId)
        LEFT JOIN categoryvote ON categoryvote.memeId = meme.Id)
        LEFT JOIN category ON categoryvote.categoryId = category.Id)
        LEFT JOIN tagvote ON tagvote.memeId = meme.Id)
        LEFT JOIN tag ON tagvote.tagId = tag.Id)
        LEFT JOIN edge ON meme.Id = edge.memeId)
        WHERE '.$filters.' AND meme.Id = '.$id.'
        GROUP BY meme.Id,tag.Id,category.Id,description.Id,transcription.Id
        HAVING Edge<='.strval($_SESSION['spice']+0.5).'
        ORDER BY DescVote DESC, TransVote DESC, CategoryVote DESC, TagVote DESC;'
    );
    if(!$memepreview){
        $dict=['success'=>0,'msg'=>"Failed to retreive edit data: ".$conn->error];
    }
    else if($memepreview->num_rows<1){
        $singleedge = $conn->query('SELECT IFNULL(AVG(edge.Rating),4) AS Edge,Nsfw,Hidden FROM meme LEFT JOIN edge ON meme.Id=edge.memeId WHERE meme.Id = '.$id.' GROUP BY meme.Id');
        $row = $singleedge->fetch_assoc();
        $dict=['success'=>0,'msg'=>"This meme is hidden because of your current settings! (or, you're trying to edit a collection child)",'edge'=>$row['Edge'],'nsfw'=>$row['Nsfw'],'hidden'=>$row['Hidden']];
        $singleedge->data_seek(0);
    }
    else{
        while($row = $memepreview->fetch_assoc()){
            if(!isset($dict)){
                $dict=['success'=>1,'Id'=>$row['Id'],'Type'=>$row['Type'],'Url'=>$row['Url'],'Nsfw'=>$row['Nsfw'],'Edge'=>$row['Edge'],'EdgeVote'=>($row['EdgeVote']==null?-1:$row['EdgeVote']),'Descriptions'=>array(),'Transcriptions'=>array(),'Categories'=>array(),'Tags'=>array(),];
            }
            if(isset($row['Description'])) $dict['Descriptions'][$row['Description']]=array('Id'=>$row['DescId'],'Votes'=>$row['DescVote']);
            if(isset($row['Transcription'])) $dict['Transcriptions'][$row['Transcription']]=array('Id'=>$row['TransId'],'Votes'=>$row['TransVote']);
            if(isset($row['category'])) $dict['Categories'][$row['category']]=$row['CategoryVote'];
            if(isset($row['tag'])) $dict['Tags'][$row['tag']]=$row['TagVote'];
        }
    }
    if(isset($_GET['get'])){
        header('Content-Type: application/json');
        $conn->close();
        die(json_encode($dict));
    }
    else{
        if(!$header) $header=headr(['title'=>"Meme editor",'description'=>"Todo: get top rated meme description.",'tags'=>['meme','todo: get tags rated above 0'],'robots'=>False,'image'=>"https://cdn.yiays.com/meme/$id.thumb.jpg"],$conn);
        if(!isset($singleedge)) print('<script>editdata='.json_encode($dict).';</script>');
    }
}else{
    $conn->close();
    if(strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) != 'xmlhttprequest'){
        die("<script>window.location='/user/login/?return='+encodeURIComponent(window.location.pathname);</script>");
    }else{
        die(json_encode(['success'=>0,'msg'=>"You must be logged in to use this!"]));
    }
}
meme();
?>