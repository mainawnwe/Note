<?php
include_once __DIR__ . '/../db/db-connection.php';

// --- CORS Configuration ---
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 3600");

// --- Handle Preflight OPTIONS request ---
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(204);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => true, 'message' => 'Method Not Allowed']);
    exit();
}

// Get database connection
try {
    $host = 'localhost';
    $db   = 'notes_db';
    $user = 'notes_user';
    $pass = 'SecurePass123!';
    
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => true, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

// Get input data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['noteIds']) || !is_array($input['noteIds'])) {
    http_response_code(400);
    echo json_encode(['error' => true, 'message' => 'Invalid request: noteIds array required']);
    exit();
}

$noteIds = array_map('intval', $input['noteIds']);

if (empty($noteIds)) {
    http_response_code(400);
    echo json_encode(['error' => true, 'message' => 'No note IDs provided']);
    exit();
}

try {
    $pdo->beginTransaction();
    
    // Prepare statements for deletion
    $deleteLabels = $pdo->prepare("DELETE FROM note_labels WHERE note_id = :note_id");
    $deleteItems = $pdo->prepare("DELETE FROM note_items WHERE note_id = :note_id");
    $deleteNotes = $pdo->prepare("DELETE FROM notes WHERE id = :note_id");
    
    $deletedCount = 0;
    
    foreach ($noteIds as $noteId) {
        // Delete related data first (foreign key constraints)
        $deleteLabels->execute([':note_id' => $noteId]);
        $deleteItems->execute([':note_id' => $noteId]);
        
        // Delete the note itself
        $deleteNotes->execute([':note_id' => $noteId]);
        
        if ($deleteNotes->rowCount() > 0) {
            $deletedCount++;
        }
    }
    
    $pdo->commit();
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => "$deletedCount notes permanently deleted",
        'deletedCount' => $deletedCount
    ]);
    
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => true, 'message' => 'Error deleting notes: ' . $e->getMessage()]);
}
?>
