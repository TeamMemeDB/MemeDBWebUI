<?php
require('../../meme.conn.php');

$json = file_get_contents('memedb-export.json'); // Your JSON data here
$data = json_decode($json, true);

$TABLE_ORDER = [
  'category',
  'tag',
  'user',
  'usermessage',
  'meme',
  'memetodelete',
  'list',
  'listmeme',
  'categorysuggestion',
  'memevote',
  'edge',
  'categoryvote',
  'tagvote',
  'description',
  'descvote',
  'transcription',
  'transvote',
  'favourites',
  'report'
];

foreach ($TABLE_ORDER as $tablename) {
  foreach ($data as $item) {
    if ($item['type'] == 'table' && $item['name'] == $tablename) {
      $tableName = $item['name'];
      foreach ($item['data'] as $row) {
        $pkey = array_keys($row)[0];
        $columns = implode(", ", array_keys($row));
        $values = implode(", ", array_map(fn($value) => (is_null($value)? 'NULL': "'".$conn->real_escape_string($value)."'"), array_values($row)));
        
        $sql = "INSERT IGNORE INTO $tableName ($columns) VALUES ($values) ON DUPLICATE KEY UPDATE $pkey=$pkey";
        
        if ($conn->query($sql) !== TRUE)  {
          echo "Error: " . $sql . "<br>" . $conn->error;
        }
      }
      break;
    }
  }
}

$conn->close();
?>