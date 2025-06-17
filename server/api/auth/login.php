<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once __DIR__ . '/../../db/db-connection.php';
require_once __DIR__ . '/../../lib/auth.php';

require_once __DIR__ . '/../../lib/auth.php';

$data = json_decode(file_get_contents('php://input'), true);

try {
    // Validate input
    if (empty($data['email']) || empty($data['password'])) {
        throw new Exception("Email and password are required");
    }

    // Find user
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($data['password'], $user['password_hash'])) {
        throw new Exception("Invalid credentials");
    }

    // Create JWT token
    $token = createAuthToken($user['id'], $user['email']);

    // Prepare user data response
    $userData = [
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'firstName' => $user['first_name'],
        'lastName' => $user['last_name'],
        'profilePicture' => $user['profile_picture'] ? "/api/lib/uploads/{$user['profile_picture']}" : null,
        'bio' => $user['bio']
    ];

    echo json_encode([
        'token' => $token,
        'user' => $userData
    ]);
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['error' => $e->getMessage()]);
}
