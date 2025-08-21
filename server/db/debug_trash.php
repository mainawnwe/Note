<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$host = 'localhost';
$db   = 'notes_db';
$user = 'notes_user';
$pass = 'SecurePass123!';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check all notes and their status
    $stmt = $pdo->prepare("SELECT id, title, status, created_at FROM notes ORDER BY created_at DESC");
    $stmt->execute();
    $allNotes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Check specifically trashed notes
    $stmt = $pdo->prepare("SELECT id, title, status, created_at FROM notes WHERE status = 'trashed' ORDER BY created_at DESC");
    $stmt->execute();
    $trashedNotes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Check notes with NULL status
    $stmt = $pdo->prepare("SELECT id, title, status, created_at FROM notes WHERE status IS NULL ORDER BY created_at DESC");
    $stmt->execute();
    $nullStatusNotes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Count by status
    $stmt = $pdo->prepare("SELECT status, COUNT(*) as count FROM notes GROUP BY status");
    $stmt->execute();
    $statusCounts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "status" => "success",
        "message" => "Trash debug information",
        "all_notes_count" => count($allNotes),
        "trashed_notes_count" => count($trashedNotes),
        "null_status_notes_count" => count($nullStatusNotes),
        "status_distribution" => $statusCounts,
        "sample_all_notes" => array_slice($allNotes, 0, 5),
        "sample_trashed_notes" => array_slice($trashedNotes, 0, 5),
        "sample_null_status_notes" => array_slice($nullStatusNotes, 0, 5)
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>