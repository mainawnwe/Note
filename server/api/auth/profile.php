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

function get_profile($pdo, $userId) {
    $stmt = $pdo->prepare('SELECT id, username, email, first_name, last_name, profile_picture, bio FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    if (!$user) {
        return null;
    }
    return [
        'id' => (int)$user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'first_name' => $user['first_name'],
        'last_name' => $user['last_name'],
        'profile_picture' => $user['profile_picture'] ?: null,
        'bio' => $user['bio'],
    ];
}

try {
    $auth = getAuthenticatedUser();
    if (!$auth || empty($auth['userId'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }
    $userId = (int)$auth['userId'];

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $profile = get_profile($pdo, $userId);
        if (!$profile) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            exit();
        }
        echo json_encode($profile);
        exit();
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Process profile update (multipart/form-data)
        $fields = [
            'username' => isset($_POST['username']) ? trim($_POST['username']) : null,
            'email' => isset($_POST['email']) ? trim($_POST['email']) : null,
            'first_name' => array_key_exists('first_name', $_POST) ? trim((string)$_POST['first_name']) : null,
            'last_name' => array_key_exists('last_name', $_POST) ? trim((string)$_POST['last_name']) : null,
            'bio' => array_key_exists('bio', $_POST) ? trim((string)$_POST['bio']) : null,
        ];

        // Build dynamic SQL for provided fields
        $setParts = [];
        $params = [];
        foreach ($fields as $col => $val) {
            if ($val !== null && $val !== '') {
                $setParts[] = "$col = ?";
                $params[] = $val;
            }
        }

        // Handle profile picture upload if provided
        $profilePictureFilename = null;
        if (isset($_FILES['profile_picture']) && $_FILES['profile_picture']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/../uploads/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            $tmpName = $_FILES['profile_picture']['tmp_name'];
            $originalName = basename($_FILES['profile_picture']['name']);
            $ext = pathinfo($originalName, PATHINFO_EXTENSION);
            $profilePictureFilename = uniqid('profile_', true) . ($ext ? ('.' . $ext) : '');
            $destination = $uploadDir . $profilePictureFilename;
            if (!move_uploaded_file($tmpName, $destination)) {
                http_response_code(400);
                echo json_encode(['error' => 'Failed to upload profile picture']);
                exit();
            }
            $setParts[] = 'profile_picture = ?';
            $params[] = $profilePictureFilename;
        }

        if (empty($setParts)) {
            // Nothing to update, just return the current profile
            $profile = get_profile($pdo, $userId);
            echo json_encode($profile);
            exit();
        }

        $sql = 'UPDATE users SET ' . implode(', ', $setParts) . ' WHERE id = ?';
        $params[] = $userId;

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        $updated = get_profile($pdo, $userId);
        echo json_encode($updated);
        exit();
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
