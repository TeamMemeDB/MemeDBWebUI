<?php 
require("../meme.conn.php");
require("includes/SitemapGenerator.php");

function safeurl($url){
	// generates a safe url at all costs
	return urlencode(str_replace(':','',str_replace('?','',str_replace('"','',strtolower($url)))));
}

$generator = new \Icamys\SitemapGenerator\SitemapGenerator('https://meme.yiays.com');

// will create also compressed (gzipped) sitemap
$generator->createGZipFile = true;

// determine how many urls should be put into one file
// according to standard protocol 50000 is maximum value (see http://www.sitemaps.org/protocol.html)
$generator->maxURLsPerSitemap = 50000;

// sitemap file name
$generator->sitemapFileName = "sitemap.xml";

// sitemap index file name
$generator->sitemapIndexFileName = "sitemap-index.xml";

// alternate languages
/*$alternates = [
    ['hreflang' => 'de', 'href' => "http://www.example.com/de"],
    ['hreflang' => 'fr', 'href' => "http://www.example.com/fr"],
];*/

// adding url `loc`, `lastmodified`, `changefreq`, `priority`, `alternates`
$generator->addUrl('/', new DateTime(), 'always', '1');
$generator->addUrl('/tutorial/', new DateTime(), 'always', '0.9');
$generator->addUrl('/tutorial/manual.php', new DateTime(), 'always', '0.9');
$generator->addUrl('/search/', new DateTime(), 'always', '0.8');
$generator->addUrl('/sort/top/', new DateTime(), 'always', '0.8');
$generator->addUrl('/sort/new/', new DateTime(), 'always', '0.8');
$generator->addUrl('/sort/random/', new DateTime(), 'always', '0.8');
$generator->addUrl('/user/', new DateTime(), 'always', '0.8');
$generator->addUrl('/terms/', new DateTime(), 'always', '0.7');
$generator->addUrl('/report/', new DateTime(), 'always', '0.7');
$generator->addUrl('/dmca/', new DateTime(), 'always', '0.7');
$result = $conn->query("SELECT Id,Name,COUNT(categoryId) AS count FROM category LEFT JOIN categoryvote ON category.Id=categoryvote.categoryId GROUP BY Id");
while($row =  $result->fetch_assoc()){
    $count = intval($row['count']);
    $score = ($count>10?'0.8':($count>5?'0.7':'0.6'));
    $generator->addUrl('/category/'.safeurl($row['Name']).'/'.$row['Id'], new DateTime(), 'always', $score);
}
$result = $conn->query("SELECT Id,Name,COUNT(tagId) AS count FROM tag LEFT JOIN tagvote ON tag.Id=tagvote.tagId GROUP BY Id;");
while($row =  $result->fetch_assoc()){
    $count = intval($row['count']);
    $score = ($count>3?'0.6':($count>1?'0.5':'0.4'));
    $generator->addUrl('/tag/'.safeurl($row['Name']).'/'.$row['Id'], new DateTime(), 'always', $score);
}
$result = $conn->query("SELECT Id,(SELECT COALESCE(SUM(memevote.Value),0) FROM memevote WHERE memeId=meme.Id) AS Votes,
                        (SELECT COUNT(*) FROM meme child WHERE CollectionParent = meme.Id) AS Children
                        FROM meme LEFT JOIN edge ON meme.Id=edge.memeId
                        GROUP BY meme.Id HAVING IFNULL(AVG(edge.Rating),4)<=2.5;");
while($row =  $result->fetch_assoc()){
    $count = intval($row['Votes']);
    $score = ($count>3?'0.6':($count>1?'0.5':'0.4'));
    $generator->addUrl('/'.($row['Children']>0?'collection':'meme').'/'.$row['Id'], new DateTime(), 'always', $score);
}

// generating internally a sitemap
$generator->createSitemap();

// writing early generated sitemap to file
$generator->writeSitemap();
header('Location: https://meme.yiays.com/sitemap.xml');
?>