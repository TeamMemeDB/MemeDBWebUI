![MemeDB Icon](icons/favicon-96x96.png "MemeDB")

# MemeDB WebUI
This repo contains the full-stack WebUI for MemeDB.

## Usage
The WebUI depends on the [Database](https://github.com/TeamMemeDB/Meme-DB/) and CDN (repo pending...) to run.

After you have the dependencies set up...

 1. Install an **AMP** (**A**pache2, **M**ariaDB, **P**HP) stack like LAMP or WAMP
 2. Clone this repo into the `public_html` or `www` folder (or whatever is equivalent in your stack)
 3. Enable the rewrite mod in Apache2.
 4. Create a user with restricted permissions in MariaDB
 5. Create a connection file named `meme.conn.php` in the folder above the root of the repo which connects to the database with the new user and stores the connection in a variable named `$conn`.
 6. You should be good to go!