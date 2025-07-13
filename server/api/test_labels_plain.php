<?php
header("Content-Type: text/plain; charset=UTF-8");
require_once(__DIR__ . '/../db/db-connection.php');

$pdo = getDbConnection();
$stmt = $pdo->query("SELECT id, name, color, created_at FROM labels ORDER BY created_at DESC");
$labels = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($labels as $label) {
    echo "ID: " . $label['id'] . ", Name: " . $label['name'] . ", Color: " . $label['color'] . ", Created At: " . $label['created_at'] . "\n";
}
?>
