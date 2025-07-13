<?php
require_once __DIR__ . '/db-connection.php';

if (!isset($argv[1]) || !isset($argv[2])) {
    echo "Usage: php check_user_profile_picture.php <username> <email>\n";
    exit(1);
}

$username = $argv[1];
$email = $argv[2];

try {
    $pdo = getDbConnection();
    $stmt = $pdo->prepare("SELECT id, username, email, profile_picture FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$username, $email]);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($users) === 0) {
        echo "No existing users found with username '$username' or email '$email'.\n";
    } else {
        echo "Existing users found:\n";
        foreach ($users as $user) {
            echo "ID: {$user['id']}, Username: {$user['username']}, Email: {$user['email']}, Profile Picture: {$user['profile_picture']}\n";
        }
    }
} catch (Exception $e) {
    echo "Error checking users: " . $e->getMessage() . "\n";
}
?>
