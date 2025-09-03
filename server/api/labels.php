<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 3600");

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

require_once('../db/db-connection.php');

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDbConnection();

switch ($method) {
    case 'GET':
        // Get all labels
        try {
            $stmt = $pdo->query("SELECT id, name, color, created_at FROM labels ORDER BY created_at DESC");
            $labels = $stmt->fetchAll();
            echo json_encode($labels);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => true, 'message' => 'Failed to fetch labels', 'details' => $e->getMessage()]);
        }
        break;

    case 'POST':
        // Create new label
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data || !isset($data['name']) || trim($data['name']) === '') {
                http_response_code(400);
                echo json_encode(['error' => true, 'message' => 'Label name is required']);
                break;
            }
            $name = trim($data['name']);
            $color = (isset($data['color']) && is_string($data['color']) && preg_match('/^#[0-9a-fA-F]{6}$/', $data['color']))
                ? $data['color']
                : '#ffffff';

            $stmt = $pdo->prepare("INSERT INTO labels (name, color) VALUES (:name, :color)");
            $stmt->execute([':name' => $name, ':color' => $color]);
            $id = (int)$pdo->lastInsertId();

            // Return the full created label
            $stmt2 = $pdo->prepare("SELECT id, name, color, created_at FROM labels WHERE id = :id");
            $stmt2->execute([':id' => $id]);
            $label = $stmt2->fetch();

            http_response_code(201);
            echo json_encode($label ?: ['id' => $id, 'name' => $name, 'color' => $color]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => true, 'message' => 'Failed to create label', 'details' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        // Update label
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = isset($data['id']) ? (int)$data['id'] : 0;
            $name = isset($data['name']) ? trim($data['name']) : '';
            $color = (isset($data['color']) && is_string($data['color']) && preg_match('/^#[0-9a-fA-F]{6}$/', $data['color']))
                ? $data['color']
                : '#ffffff';

            if ($id <= 0 || $name === '') {
                http_response_code(400);
                echo json_encode(['error' => true, 'message' => 'Label id and name are required']);
                break;
            }

            $stmt = $pdo->prepare("UPDATE labels SET name = :name, color = :color WHERE id = :id");
            $stmt->execute([':id' => $id, ':name' => $name, ':color' => $color]);
            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => true, 'message' => 'Failed to update label', 'details' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        // Delete label
        try {
            parse_str(file_get_contents("php://input"), $delete_vars);
            $id = isset($delete_vars['id']) ? (int)$delete_vars['id'] : (isset($_GET['id']) ? (int)$_GET['id'] : 0);
            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['error' => true, 'message' => 'Label id is required']);
                break;
            }
            $stmt = $pdo->prepare("DELETE FROM labels WHERE id = :id");
            $stmt->execute([':id' => $id]);
            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => true, 'message' => 'Failed to delete label', 'details' => $e->getMessage()]);
        }
        break;

    case 'OPTIONS':
        // Handle preflight request
        http_response_code(200);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => true, 'message' => 'Method Not Allowed']);
        break;
}
?>
