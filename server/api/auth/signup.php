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

    // Handle profile picture upload
    $profilePictureFilename = null;

    // Log $_FILES for debugging
    file_put_contents(__DIR__ . '/debug_files.log', print_r($_FILES, true), FILE_APPEND);

    if (isset($_FILES['profile_picture']) && $_FILES['profile_picture']['error'] === UPLOAD_ERR_OK) {
        file_put_contents(__DIR__ . '/debug_files.log', "Uploading profile picture: " . print_r($_FILES['profile_picture'], true) . "\n", FILE_APPEND);
        $uploadDir = __DIR__ . '/../uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        $tmpName = $_FILES['profile_picture']['tmp_name'];
        $originalName = basename($_FILES['profile_picture']['name']);
        $ext = pathinfo($originalName, PATHINFO_EXTENSION);
        $profilePictureFilename = uniqid('profile_', true) . '.' . $ext;
        $destination = $uploadDir . $profilePictureFilename;
        $moveResult = move_uploaded_file($tmpName, $destination);
        file_put_contents(__DIR__ . '/debug_files.log', "move_uploaded_file result: " . var_export($moveResult, true) . "\n", FILE_APPEND);
        if (!$moveResult) {
            throw new Exception('Failed to upload profile picture');
        }
    }

    // Insert user
    // Debug log profile picture filename before insert
    file_put_contents(__DIR__ . '/debug_profile_picture.log', "Profile picture filename: " . var_export($profilePictureFilename, true) . "\n", FILE_APPEND);

    $stmt = $pdo->prepare("
        INSERT INTO users (username, email, password_hash, first_name, last_name, bio, profile_picture)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $input['username'],
        $input['email'],
        $passwordHash,
        $input['first_name'] ?? null,
        $input['last_name'] ?? null,
        $input['bio'] ?? null,
        $profilePictureFilename
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
