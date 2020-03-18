<?php 
require('../meme.conn.php');
require('includes/template.php');

headr(['title'=>"Terms of Service",'description'=>"Read the terms of service and privacy policy for this site.",'tags'=>['terms of service','privacy policy','legal']],$conn);
?>
<h1>Terms of Service</h1>
<p>For MemeDB (meme.yiays.com).</p>
<h2>Definitions</h2>
<table>
    <tr><th style="width:10em;">Word</th><th>Definition</th>
    <tr><td>meme</td><td>Any media that is shared through culture and, for the purposes of this site,
        other people will enjoy. A meme can be an image, video, article, copypasta, story and almost
        any other form of media.</td></tr>
    
</table>
<p>
    MemeDB, by the nature of being a database designed to record the history of memes and follow trends,
    allows almost all meme-related content, and will even store local backups of memes wherever possible
    in case the source material is ever deleted (which happens frequently).
</p>
<p>
    Obviously, MemeDB operates within all applicable law. Refer to the privacy policy (below) for what we
    do with user data. MemeDB will refuse to host any content that breaks
    <abbr title="United States of America">US</abbr>, <abbr title="European Union">EU</abbr> or
    <abbr title="New Zealand">NZ</abbr> law.
</p>
<p>
    Some examples of what we won't host on MemeDB include, but aren't limited to the following...
    <ul>
        <li>Exploitation of minors (sexual or violent in nature) - based on appearance and/or age.</li>
        <li>Graphic imagery posted for the sake of graphic imagery. (context is considered)</li>
        <li>
            Memes using footage from the Christchurch Shooting or the related manifesto are illegal for
            us to possess as long as this website is hosted in New Zealand due to local censorship law.
        </li>
        <li>
            Content that you don't own the rights to - while memes should be considered a form of fair
            use by means of parody, not all memes are fair use. And as such can be taken down by the
            rightful copyright holder using a <a href="/dmca/">DMCA Takedown Request</a> on the relevant
            page.
        </li>
        <li>Anything else that is otherwise illegal.</li>
    </ul>
    <b>If you find something infringing on these terms, please use the relevant
    <a href="/report">Reporting</a> page.</b>
</p>
<h1>Privacy Policy</h1>
<p>
    MemeDB takes a stance of collecting as little data as possible from our users.
    For this reason, you will find that we don't even store passwords and instead rely soley on OAuth
    through Discord. As a casual browser, the bare minimum cookies are used in order to make browsing
    the site possible, cookies are also used to store your settings locally instead of associating
    them with your account. When you create an account, this is purely used to associate any edits
    you make with an identity that can be restricted should your account be used to abuse the site.
</p>
<p>
    To simplify... <b>Before logging in, MemeDB knows the following about you;</b>
    <ul>
        <li>Your IP address</li>
        <li>Your browser</li>
        <li>Your preferences (zoom and edge rating, for example.) <i>Unless you disable cookies.</i></li>
    </ul>
    And once you've logged in, MemeDB also knows...
    <ul>
        <li>Your Discord ID, Username and Discriminator (Username#1234, for example.)</li>
        <li>Your email address (this may be used for mailing users notifications and updates later on.)</li>
        <li>Everything you vote on within MemeDB</li>
        <li>Every change you contribute to MemeDB</li>
    </ul>
</p>
<h2>Request your data</h2>
<p>
    <sub>A way to request your data will be implemented in the future...</sub>
</p>
<?php 
footer();
?>