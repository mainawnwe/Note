<?php
require_once dirname(__DIR__) . '/db/db-connection.php';

// JWT Configuration
define('JWT_SECRET', 'your-very-secure-secret-key-here'); // Change this!
define('JWT_EXPIRY', 86400); // 24 hours in seconds

function createAuthToken($userId, $email) {
    $payload = [
        'iat' => time(),
        'exp' => time() + JWT_EXPIRY,
        'userId' => $userId,
        'email' => $email
    ];
    
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode($payload);
    
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function validateAuthToken($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }
    
    list($header, $payload, $signature) = $parts;
    
    // Verify signature
    $verified = hash_hmac('sha256', $header . "." . $payload, JWT_SECRET, true);
    $base64UrlVerified = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($verified));
    
    if ($base64UrlVerified !== $signature) {
        return false;
    }
    
    $decodedPayload = json_decode(base64_decode($payload), true);
    
    // Check token expiration
    if (isset($decodedPayload['exp']) && $decodedPayload['exp'] < time()) {
        return false;
    }
    
    return $decodedPayload;
}

function getAuthenticatedUser() {
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        return false;
    }
    
    $authHeader = $headers['Authorization'];
    if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        return false;
    }
    
    $token = $matches[1];
    return validateAuthToken($token);
}
?>