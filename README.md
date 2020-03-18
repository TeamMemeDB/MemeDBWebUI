# MemeDB WebUI
This repo contains the full-stack WebUI for MemeDB.

## Usage
The WebUI depends on the [Database](https://github.com/TeamMemeDB/Meme-DB/) and CDN (repo pending...) to run.

After you have the dependencies set up...

 1. Install an **AMP** (**A**pache2, **M**ariaDB, **P**HP) stack like LAMP or WAMP
 2. Enable the rewrite mod in Apache2.
 3. Create a user with restricted permissions in MariaDB
 4. Create a connection file named `meme.conn.php` which connects to the database with the new user and stores the connection in a variable named `$conn`.
 5. You should be good to go!