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
$generator->addUrl('/', new DateTime(), 'daily', '1');
$generator->addUrl('/tutorial/', new DateTime('@'.filemtime('tutorial/tutorial.php')), 'monthly', '0.9');
$generator->addUrl('/tutorial/manual.php', new DateTime('@'.filemtime('tutorial/manual.pdf')), 'monthly', '0.9');
$generator->addUrl('/search/', new DateTime('@'.filemtime('search.php')), 'never', '0.8');
$generator->addUrl('/sort/top/', new DateTime(), 'daily', '0.8');
$generator->addUrl('/sort/new/', new DateTime(), 'daily', '0.8');
$generator->addUrl('/sort/old/', new DateTime(), 'monthly', '0.8');
$generator->addUrl('/sort/random/', new DateTime(), 'daily', '0.8');
$generator->addUrl('/user/', new DateTime(), 'daily', '0.8');
$generator->addUrl('/terms/', new DateTime('@'.filemtime('terms.php')), 'yearly', '0.7');
$generator->addUrl('/report/', new DateTime('@'.filemtime('report/report.php')), 'never', '0.7');
$generator->addUrl('/dmca/', new DateTime('@'.filemtime('dmca.php')), 'never', '0.7');
$result = $conn->query("SELECT Id,Name,COUNT(categoryId) AS count FROM category LEFT JOIN categoryvote ON category.Id=categoryvote.categoryId GROUP BY Id");
while($row =  $result->fetch_assoc()){
    $count = intval($row['count']);
    $score = ($count>10?'0.8':($count>5?'0.7':'0.6'));
    $generator->addUrl('/category/'.safeurl($row['Name']).'/'.$row['Id'], new DateTime(), 'daily', $score);
}
$result = $conn->query("SELECT Id,Name,COUNT(tagId) AS count FROM tag LEFT JOIN tagvote ON tag.Id=tagvote.tagId GROUP BY Id;");
while($row =  $result->fetch_assoc()){
    $count = intval($row['count']);
    $score = ($count>3?'0.6':($count>1?'0.5':'0.4'));
    $generator->addUrl('/tag/'.safeurl($row['Name']).'/'.$row['Id'], new DateTime(), 'daily', $score);
}
$result = $conn->query("SELECT Id,Date,
                        (SELECT COALESCE(SUM(memevote.Value),0) FROM memevote WHERE memeId=meme.Id) AS Votes,
                        (SELECT COUNT(*) FROM meme child WHERE CollectionParent = meme.Id) AS Children
                        FROM meme LEFT JOIN edge ON meme.Id=edge.memeId
                        GROUP BY meme.Id HAVING IFNULL(AVG(edge.Rating),4)<=2.5;");
while($row =  $result->fetch_assoc()){
    $count = intval($row['Votes']);
    $score = ($count>3?'0.6':($count>1?'0.5':'0.4'));
    $date = new DateTime($row['Date']);
    $generator->addUrl('/'.($row['Children']>0?'collection':'meme').'/'.$row['Id'], $date, 'weekly', $score);
}

// generating internally a sitemap
$generator->createSitemap();

// writing early generated sitemap to file
$generator->writeSitemap();
header('Location: https://meme.yiays.com/sitemap.xml');
?>