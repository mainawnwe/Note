<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

require_once('../db/db-connection.php');

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDbConnection();

switch ($method) {
    case 'GET':
        // Get all labels
        $stmt = $pdo->query("SELECT id, name, color, created_at FROM labels ORDER BY created_at DESC");
        $labels = $stmt->fetchAll();
        ob_clean();
        echo json_encode($labels);
        break;

    case 'POST':
        // Create new label
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['name'])) {
            http_response_code(400);
            echo json_encode(['error' => true, 'message' => 'Label name is required']);
            exit();
        }
        $name = $data['name'];
        $color = isset($data['color']) ? $data['color'] : '#ffffff';

        $stmt = $pdo->prepare("INSERT INTO labels (name, color) VALUES (:name, :color)");
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':color', $color);
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => true, 'message' => 'Failed to create label']);
        }
        break;

    case 'PUT':
        // Update label
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['id']) || empty($data['name'])) {
            http_response_code(400);
            echo json_encode(['error' => true, 'message' => 'Label id and name are required']);
            exit();
        }
        $id = $data['id'];
        $name = $data['name'];
        $color = isset($data['color']) ? $data['color'] : '#ffffff';

        $stmt = $pdo->prepare("UPDATE labels SET name = :name, color = :color WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':color', $color);
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => true, 'message' => 'Failed to update label']);
        }
        break;

    case 'DELETE':
        // Delete label
        parse_str(file_get_contents("php://input"), $delete_vars);
        if (empty($delete_vars['id'])) {
            http_response_code(400);
            echo json_encode(['error' => true, 'message' => 'Label id is required']);
            exit();
        }
        $id = $delete_vars['id'];
        $stmt = $pdo->prepare("DELETE FROM labels WHERE id = :id");
        $stmt->bindParam(':id', $id);
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => true, 'message' => 'Failed to delete label']);
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
