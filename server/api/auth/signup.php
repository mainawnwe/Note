<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once dirname(dirname(__DIR__)) . '/db/db-connection.php';
require_once dirname(dirname(__DIR__)) . '/lib/auth.php';

$response = ['success' => false, 'message' => ''];

try {
    // Debug log input data
    file_put_contents(__DIR__ . '/debug_post.log', print_r($_POST, true), FILE_APPEND);

    $pdo = getDbConnection();

    // Get input data from $_POST for multipart/form-data
    $input = $_POST;

    // Validate required fields
    $required = ['username', 'email', 'password'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }

    // Validate email
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }

    // Check if user exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$input['username'], $input['email']]);
    if ($stmt->rowCount() > 0) {
        throw new Exception('Username or email already exists');
    }

    // Hash password
    $passwordHash = password_hash($input['password'], PASSWORD_BCRYPT);

    // Insert user
    $stmt = $pdo->prepare("
        INSERT INTO users (username, email, password_hash, first_name, last_name, bio)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $input['username'],
        $input['email'],
        $passwordHash,
        $input['first_name'] ?? null,
        $input['last_name'] ?? null,
        $input['bio'] ?? null
    ]);

    $response = [
        'success' => true,
        'message' => 'User registered successfully'
    ];

} catch (Exception $e) {
    http_response_code(400);
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>
