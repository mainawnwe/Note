<?php
// CORS headers
header('Access-Control-Allow-Origin: http://127.0.0.1:3000');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Handle preflight request
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../db/db-connection.php';

$payload = getAuthenticatedUser();

if (!$payload) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare("SELECT id, username, email, first_name, last_name, profile_picture, bio FROM users WHERE id = ?");
        $stmt->execute([$payload['userId']]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            exit;
        }

        $user['profile_picture'] = $user['profile_picture'] ? $user['profile_picture'] : null;

        echo json_encode($user);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error']);
    }
} elseif ($method === 'POST') {
    // Handle profile update

    // Check if content type is multipart/form-data for file upload
    if (strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {
        $username = isset($_POST['username']) ? trim($_POST['username']) : '';
        $email = isset($_POST['email']) ? trim($_POST['email']) : '';
        $first_name = isset($_POST['first_name']) ? trim($_POST['first_name']) : '';
        $last_name = isset($_POST['last_name']) ? trim($_POST['last_name']) : '';
        $bio = isset($_POST['bio']) ? trim($_POST['bio']) : '';

        if (empty($username) || empty($email)) {
            http_response_code(400);
            echo json_encode(['error' => 'Username and email cannot be empty']);
            exit;
        }

        // Handle profile picture upload if exists
        $profile_picture_filename = null;
        if (isset($_FILES['profile_picture']) && $_FILES['profile_picture']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/../uploads/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            $tmpName = $_FILES['profile_picture']['tmp_name'];
            $originalName = basename($_FILES['profile_picture']['name']);
            $ext = pathinfo($originalName, PATHINFO_EXTENSION);
            $newFilename = uniqid('profile_', true) . '.' . $ext;
            $destination = $uploadDir . $newFilename;

            if (!move_uploaded_file($tmpName, $destination)) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to upload profile picture']);
                exit;
            }
            $profile_picture_filename = $newFilename;
        }

        try {
            // Check if username or email already exists for other users
            $stmt = $pdo->prepare("SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?");
            $stmt->execute([$username, $email, $payload['userId']]);
            $existingUser = $stmt->fetch();

            if ($existingUser) {
                http_response_code(409);
                echo json_encode(['error' => 'Username or email already in use']);
                exit;
            }

            // Build update query dynamically
            $fields = ['username = ?', 'email = ?', 'first_name = ?', 'last_name = ?', 'bio = ?'];
            $params = [$username, $email, $first_name, $last_name, $bio];

            if ($profile_picture_filename !== null) {
                $fields[] = 'profile_picture = ?';
                $params[] = $profile_picture_filename;
            }

            $fields[] = 'updated_at = NOW()';
            $params[] = $payload['userId'];

            $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            echo json_encode(['message' => 'Profile updated successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Server error']);
        }
    } else {
        // Handle JSON input as before
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['username']) || !isset($input['email'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Username and email are required']);
            exit;
        }

        $username = trim($input['username']);
        $email = trim($input['email']);

        if (empty($username) || empty($email)) {
            http_response_code(400);
            echo json_encode(['error' => 'Username and email cannot be empty']);
            exit;
        }

        try {
            // Check if username or email already exists for other users
            $stmt = $pdo->prepare("SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?");
            $stmt->execute([$username, $email, $payload['userId']]);
            $existingUser = $stmt->fetch();

            if ($existingUser) {
                http_response_code(409);
                echo json_encode(['error' => 'Username or email already in use']);
                exit;
            }

            // Update user profile
            $stmt = $pdo->prepare("UPDATE users SET username = ?, email = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$username, $email, $payload['userId']]);

            echo json_encode(['message' => 'Profile updated successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Server error']);
        }
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
