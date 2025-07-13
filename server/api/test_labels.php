<?php
header("Content-Type: application/json; charset=UTF-8");
require_once(__DIR__ . '/../db/db-connection.php');

$pdo = getDbConnection();
$stmt = $pdo->query("SELECT id, name, color, created_at FROM labels ORDER BY created_at DESC");
$labels = $stmt->fetchAll(PDO::FETCH_ASSOC);

file_put_contents('/tmp/labels_debug.log', print_r($labels, true));

echo json_encode($labels);
?>
