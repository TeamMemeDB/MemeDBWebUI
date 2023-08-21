<?php
http_response_code(503);
require('includes/template.php');
?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width,initial-scale=1">
		<title>MemeDB is Down</title>
		<meta name="author" content="Yiays">
		<meta name="og:title" content="MemeDB is Down">
		
		<link rel="apple-touch-icon" sizes="180x180" href="/icon/apple-touch-icon.png">
		<link rel="icon" type="image/png" sizes="32x32" href="/icon/favicon-32x32.png">
		<link rel="icon" type="image/png" sizes="16x16" href="/icon/favicon-16x16.png">
		<link rel="manifest" href="/site.webmanifest">
		<meta name="theme-color" content="#535C68">
		
		<link href="https://fonts.googleapis.com/css?family=Lato:400,400i,700,700i&display=swap" rel="stylesheet">
    <style>
      html {
        background: #131c28;
        color:#eee;
        font-size: 14px;
	      font-family: 'Lato', Arial, Helvetica, sans-serif;
      }
      body {
        display: flex;
        flex-direction: column;
        padding:0;
        margin:0;
      }
      html, body {
        height: 100%;
      }
      a,a:link,a:visited{
        color:#f0f0f0;
        text-decoration:none;
      }
      a[href]{
        color:#f9ca24;
      }
      a[href]:hover,a[href]:active{
        text-decoration: underline;
      }
      .blur{
        filter:blur(0.5rem);
      }
      .menu-btn.disabled {
        opacity: 0.5;
        pointer-events: none;
      }
      h1{
        margin:0;
        margin-bottom:0.4em;
        padding:0;
        font-weight: 700;
        font-size: 2.5em;
      }
      p{
        margin-bottom:0.4em;
        line-height:1.2em;
      }
      .accent{
        color:#f9ca24!important;
      }
      .float-right{
        float:right;
      }
      header,footer{
        background:#535c68;
        box-shadow:rgba(0,0,0,0.4) 0 0 0.5em;
        z-index:100;
      }
      header>nav{
        min-height:3em;
      }
      header>nav h1{
        display:inline-block;
        font-size:1.7em;
        position: relative;
        top: 0.15em;
        padding:0.3em;
        margin:0;
        padding-top:0;
      }
      .btn,.menu-btn {
        display:inline-block;
        padding:1.025em;
        background:rgba(255,255,255,0.1);
        transition: background 125ms;
        color:#f0f0f0;
        cursor:pointer;
        text-decoration: none!important;
      }
      .btn>*,.menu-btn>* {
        color:#f0f0f0;
      }
      .menu-btn.dropdown{
        padding-right: 0.4em;
      }
      footer{
        display: block;
        min-height: 1em;
        padding:1em;
      }
      .super{
        background:#000;
        overflow:hidden;
        position: relative;
      }
      .super-content{
        position: relative;
        padding:2em;
        margin-bottom:3em;
        min-height:8em;
        min-width: 30em;
        max-width: 45%;
        z-index: 1;
      }
      .super-content h1, .super-content h2, .super-content h3, .super-content h4, .super-content h5, .super-content h6{
        display: inline-block;
        font-weight: 400;
        border-bottom: white 1px solid;
        margin-bottom: 0;
      }
      .super-bg{
        z-index:0;
        position: absolute;
        top:0;
        left:0;
        width:100%;
        height:100%;
      }
      .super .btn{
        background:#ddd;
      }
      .super .btn, .super .btn>*{
        color:#000;
      }
    </style>
  </head>
  <body>
    <header style="position: unset;">
			<nav>
				<a href="https://meme.yiays.com" style="color:#fafafa;text-decoration:none;">
					<img src="/img/icon.png" alt="MemeDB Logo" style="width:2.5em;height:2.5em;padding:0.25em;position:absolute;">
					<div style="width:2.5em;display:inline-block;"></div>
					<h1>Meme<span class="accent">DB</span></h1>
				</a>
				<a class="menu-btn disabled">Top 🔥</a>
				<a class="menu-btn disabled">New ✨</a>
				<a class="menu-btn dropdown disabled">Categories 📁 &#9662;</a>
				<a class="menu-btn dropdown disabled">Tags #️⃣ &#9662;</a>
			</nav>
    </header>
    <article class="super" style="flex-grow: 1;">
      <div class="super-content">
        <h1>MemeDB is down</h1>
        <p>MemeDB is being rewritten and will be temporarily unavailable.</p>
      </div>
      <div class="super-bg blur" style="background: url('https://cdn.yiays.com/meme/minimontage.php'); background-size: cover; opacity: 0.5;"></div>
    </article>
		<footer>
			&copy; 2023, Yiays
			<span class="float-right">
				<a href="https://github.com/TeamMemeDB">GitHub</a>
			</span>
		</footer>
  </body>
</html>