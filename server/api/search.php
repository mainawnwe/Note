<?php
// --- CORS Configuration ---
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 3600");

// --- Database Configuration ---
require_once('../db/db-connection.php');

// --- Handle Search Request ---
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $searchTerm = isset($_GET['term']) ? $_GET['term'] : '';
    
    if (empty($searchTerm)) {
        http_response_code(400);
        echo json_encode(['error' => true, 'message' => 'Search term is required']);
        exit();
    }

    try {
        $searchTerm = '%' . $searchTerm . '%';
        $stmt = $pdo->prepare("SELECT id, title, content, created_at AS createdAt, color, pinned, labels, image_url 
                              FROM notes 
                              WHERE title LIKE :term OR content LIKE :term
                              ORDER BY pinned DESC, created_at DESC");
        $stmt->bindParam(':term', $searchTerm);
        $stmt->execute();
        $results = $stmt->fetchAll();

        http_response_code(200);
        echo json_encode($results ?: []);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => true, 'message' => 'Search failed: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => true, 'message' => 'Method Not Allowed']);
}
?>