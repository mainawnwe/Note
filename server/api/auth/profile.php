<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../db/db-connection.php';

$payload = authenticateRequest();

try {
    $stmt = $pdo->prepare("SELECT id, username, email, first_name, last_name, profile_picture, bio FROM users WHERE id = ?");
    $stmt->execute([$payload['userId']]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        exit;
    }

    $user['profile_picture'] = $user['profile_picture'] ? "/api/lib/uploads/{$user['profile_picture']}" : null;

    echo json_encode($user);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
