<?php
$host = 'localhost';
$db   = 'notes_db';
$user = 'notes_user';
$pass = 'SecurePass123!';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

function getDbConnection() {
    global $dsn, $user, $pass, $options;
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $pdo = new PDO($dsn, $user, $pass, $options);
        } catch (\PDOException $e) {
            throw new \PDOException($e->getMessage(), (int)$e->getCode());
        }
    }
    return $pdo;
}

// For backward compatibility
$pdo = getDbConnection();
?>