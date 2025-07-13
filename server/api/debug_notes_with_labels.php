<?php
header("Content-Type: application/json");

$host = 'localhost';
$db   = 'notes_db';
$user = 'notes_user';
$pass = 'SecurePass123!';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    $stmt = $pdo->query("SELECT * FROM note_labels");
    $noteLabels = $stmt->fetchAll();

    echo json_encode(['note_labels' => $noteLabels]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => true, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
