<?php

include_once __DIR__ . '/static_uploads.php';

// --- CORS Configuration ---
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 3600");

// --- Handle Preflight OPTIONS request ---
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(204);
    exit();
}

// --- Database Configuration ---
$host = 'localhost';
$db   = 'notes_db';
$user = 'notes_user';
$pass = 'SecurePass123!';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => true, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

// --- Request Handling ---
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet($pdo);
        break;
    case 'POST':
        handlePost($pdo);
        break;
    case 'PUT':
    case 'PATCH':
        handlePut($pdo);
        break;
    case 'DELETE':
        handleDelete($pdo);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => true, 'message' => 'Method Not Allowed']);
        break;
}

// --- Handler Functions ---
function handleGet($pdo) {
    try {
        if (isset($_GET['id'])) {
            $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => true, 'message' => 'Invalid note ID']);
                return;
            }

            $stmt = $pdo->prepare("SELECT id, title, content, type, created_at AS createdAt, color, pinned, labels, image_url, drawing_data, status, reminder FROM notes WHERE id = :id");
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $note = $stmt->fetch();

            if ($note) {
                http_response_code(200);
                echo json_encode($note);
            } else {
                http_response_code(404);
                echo json_encode(['error' => true, 'message' => 'Note not found']);
            }
        } else {
            $query = "SELECT id, title, content, type, created_at AS createdAt, color, pinned, image_url, drawing_data, status, reminder FROM notes";
            $params = [];
            $conditions = [];

            if (isset($_GET['status'])) {
                $conditions[] = "status = :status";
                $params[':status'] = $_GET['status'];
            }

            if (isset($_GET['label'])) {
                $label = $_GET['label'];
                $query = "SELECT n.id, n.title, n.content, n.type, n.created_at AS createdAt, n.color, n.pinned, n.image_url, n.drawing_data, n.status, n.reminder
                          FROM notes n
                          JOIN note_labels nl ON n.id = nl.note_id
                          JOIN labels l ON nl.label_id = l.id
                          WHERE l.name = :label";
                $params = [':label' => $label];

                if (isset($_GET['type'])) {
                    $query .= " AND n.type = :type";
                    $params[':type'] = $_GET['type'];
                }
            }

            if (isset($_GET['type']) && !isset($_GET['label'])) {
                $conditions[] = "type = :type";
                $params[':type'] = $_GET['type'];
            }

            if (count($conditions) > 0 && !isset($_GET['label'])) {
                $query .= " WHERE " . implode(" AND ", $conditions);
            }

            $query .= " ORDER BY created_at DESC";

            error_log('GET parameters: ' . json_encode($_GET));
            error_log('SQL Query: ' . $query);
            error_log('Query Params: ' . json_encode($params));

            // Additional debug to verify type param value
            if (isset($_GET['type'])) {
                error_log('Type filter received: ' . $_GET['type']);
            }

            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            $notes = $stmt->fetchAll();

            // Fetch list items for each note if type is list
            foreach ($notes as &$note) {
                if ($note['type'] === 'list') {
                    $stmtItems = $pdo->prepare("SELECT id, text, checked, position FROM note_items WHERE note_id = :note_id ORDER BY position ASC");
                    $stmtItems->bindParam(':note_id', $note['id'], PDO::PARAM_INT);
                    $stmtItems->execute();
                    $note['listItems'] = $stmtItems->fetchAll();
                } else {
                    $note['listItems'] = [];
                }

                // Fetch assigned labels for the note
                $stmtLabels = $pdo->prepare("SELECT l.id, l.name, l.color FROM labels l JOIN note_labels nl ON l.id = nl.label_id WHERE nl.note_id = :note_id");
                $stmtLabels->execute([':note_id' => $note['id']]);
                $fetchedLabels = $stmtLabels->fetchAll();
                error_log("Note ID {$note['id']} labels fetched: " . json_encode($fetchedLabels));
                $note['labels'] = $fetchedLabels ?: [];
            }

            http_response_code(200);
            echo json_encode($notes ?: []);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => true, 'message' => 'Error fetching notes: ' . $e->getMessage()]);
    }
}

function handlePost($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    // Debug log received data
    error_log('Received POST data: ' . json_encode($data));

    if (!$data || json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['error' => true, 'message' => 'Invalid JSON data']);
        return;
    }

    $title = $data['title'] ?? '';
    $content = $data['content'] ?? '';
    $type = $data['type'] ?? 'note';

    // Debug log type value
    error_log('Note type: ' . $type);

    $color = $data['color'] ?? '#ffffff';
    $pinned = isset($data['pinned']) && $data['pinned'] ? 1 : 0;
    $listItems = $data['listItems'] ?? null;
    $drawing_data = $data['drawing_data'] ?? null;

    // For list type, concatenate listItems text into content string
    if ($type === 'list' && is_array($listItems)) {
        $content = implode("\n", array_map(function($item) {
            return isset($item['text']) ? $item['text'] : '';
        }, $listItems));
    }

    $labels = $data['labels'] ?? [];
    $image_url = $data['image_url'] ?? '';

    // Validation based on note type
    if ($type === 'note' && (empty($title) && empty($content))) {
        http_response_code(400);
        echo json_encode(['error' => true, 'message' => 'Title or content required for text notes']);
        return;
    }

    if ($type === 'list' && (!is_array($listItems) || count(array_filter($listItems, function($item) {
        return isset($item['text']) && trim($item['text']) !== '';
    })) === 0)) {
        http_response_code(400);
        echo json_encode(['error' => true, 'message' => 'At least one list item is required']);
        return;
    }

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("INSERT INTO notes (title, content, type, color, pinned, image_url, drawing_data, reminder) 
                                VALUES (:title, :content, :type, :color, :pinned, :image_url, :drawing_data, :reminder)");
        $stmt->execute([
            ':title' => $title,
            ':content' => $content,
            ':type' => $type,
            ':color' => $color,
            ':pinned' => $pinned,
            ':image_url' => $image_url,
            ':drawing_data' => $drawing_data,
            ':reminder' => $data['reminder'] ?? null
        ]);
        $id = $pdo->lastInsertId();

        // Insert labels into note_labels join table
        if (is_array($labels) && count($labels) > 0) {
            $stmtLabel = $pdo->prepare("INSERT INTO note_labels (note_id, label_id) VALUES (:note_id, :label_id)");
            foreach ($labels as $labelId) {
                $labelIdInt = (int)$labelId;
                if ($labelIdInt <= 0) {
                    error_log("Invalid label ID (not positive integer): " . print_r($labelId, true));
                    continue;
                }
                // Validate label ID exists
                $stmtCheckLabel = $pdo->prepare("SELECT COUNT(*) FROM labels WHERE id = :label_id");
                $stmtCheckLabel->execute([':label_id' => $labelIdInt]);
                $count = $stmtCheckLabel->fetchColumn();
                if ($count == 0) {
                    error_log("Label ID $labelIdInt does not exist in labels table.");
                    continue;
                }
                try {
                    $stmtLabel->execute([':note_id' => $id, ':label_id' => $labelIdInt]);
                } catch (PDOException $e) {
                    error_log("Failed to insert label_id $labelIdInt for note_id $id: " . $e->getMessage());
                }
            }
        }

        // Insert list items if type is list
        if ($type === 'list' && is_array($listItems)) {
            $position = 0;
            $stmtItem = $pdo->prepare("INSERT INTO note_items (note_id, text, checked, position) VALUES (:note_id, :text, :checked, :position)");
            foreach ($listItems as $item) {
                if (isset($item['text']) && trim($item['text']) !== '') {
                    $stmtItem->execute([
                        ':note_id' => $id,
                        ':text' => $item['text'],
                        ':checked' => isset($item['checked']) && $item['checked'] ? 1 : 0,
                        ':position' => $position++
                    ]);
                }
            }
        }

        $pdo->commit();

        $stmt = $pdo->prepare("SELECT id, title, content, type, created_at AS createdAt, color, pinned, labels, image_url, drawing_data, status, reminder FROM notes WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $note = $stmt->fetch();

        // Fetch list items if type is list
        if ($type === 'list') {
            $stmtItems = $pdo->prepare("SELECT id, text, checked, position FROM note_items WHERE note_id = :note_id ORDER BY position ASC");
            $stmtItems->bindParam(':note_id', $id, PDO::PARAM_INT);
            $stmtItems->execute();
            $note['listItems'] = $stmtItems->fetchAll();
        } else {
            $note['listItems'] = [];
        }

        // Fetch assigned labels for the note
        $stmtLabels = $pdo->prepare("SELECT l.id, l.name, l.color FROM labels l JOIN note_labels nl ON l.id = nl.label_id WHERE nl.note_id = :note_id");
        $stmtLabels->execute([':note_id' => $id]);
        $note['labels'] = $stmtLabels->fetchAll();

        http_response_code(201);
        echo json_encode($note);
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => true, 'message' => 'Error creating note: ' . $e->getMessage()]);
    }
}

function handlePut($pdo) {
    // Accept id from query parameter or URL path
    $id = null;
    if (isset($_GET['id'])) {
        $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    } else {
        // Try to get id from URL path (e.g., /api/notes/16)
        $path = $_SERVER['REQUEST_URI'];
        $parts = explode('/', trim($path, '/'));
        $lastPart = end($parts);
        if (is_numeric($lastPart)) {
            $id = (int)$lastPart;
        }
    }

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => true, 'message' => 'Note ID required']);
        return;
    }
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => true, 'message' => 'Invalid note ID']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['error' => true, 'message' => 'Invalid JSON data']);
        return;
    }

    $title = $data['title'] ?? null;
    $content = $data['content'] ?? null;
    $color = $data['color'] ?? null;
    $pinned = $data['pinned'] ?? null;
    $labels = $data['labels'] ?? null;
    $image_url = $data['image_url'] ?? null;
    $listItems = $data['listItems'] ?? null;
    $drawing_data = $data['drawing_data'] ?? null;

    if ($title === null && $content === null && $color === null && $pinned === null && $labels === null && $image_url === null && $listItems === null && $drawing_data === null) {
        http_response_code(400);
        echo json_encode(['error' => true, 'message' => 'No data provided']);
        return;
    }

    try {
        $fields = [];
        $params = [':id' => $id];
        
        if ($title !== null) {
            $fields[] = "title = :title";
            $params[':title'] = $title;
        }
        if ($content !== null) {
            $fields[] = "content = :content";
            $params[':content'] = $content;
        }
        if ($color !== null) {
            $fields[] = "color = :color";
            $params[':color'] = $color;
        }
        if ($pinned !== null) {
            $fields[] = "pinned = :pinned";
            $params[':pinned'] = $pinned;
        }
        // Remove labels field update in notes table
        // Handle labels in note_labels join table instead
        if ($image_url !== null) {
            $fields[] = "image_url = :image_url";
            $params[':image_url'] = $image_url;
        }
        if ($drawing_data !== null) {
            $fields[] = "drawing_data = :drawing_data";
            $params[':drawing_data'] = $drawing_data;
        }
        if (isset($data['status'])) {
            $fields[] = "status = :status";
            $params[':status'] = $data['status'];
        }
        $sql = "UPDATE notes SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        $stmt = $pdo->prepare("SELECT id, title, content, type, created_at AS createdAt, color, pinned, labels, image_url, drawing_data FROM notes WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $note = $stmt->fetch();

        if ($note) {
            // Update list items if provided
            if ($listItems !== null && is_array($listItems)) {
                // Delete existing list items for the note
                $stmtDelete = $pdo->prepare("DELETE FROM note_items WHERE note_id = :note_id");
                $stmtDelete->execute([':note_id' => $id]);

                // Insert updated list items
                $stmtInsert = $pdo->prepare("INSERT INTO note_items (note_id, text, checked, position) VALUES (:note_id, :text, :checked, :position)");
                $position = 0;
                foreach ($listItems as $item) {
                    if (isset($item['text']) && trim($item['text']) !== '') {
                        $stmtInsert->execute([
                            ':note_id' => $id,
                            ':text' => $item['text'],
                            ':checked' => isset($item['checked']) && $item['checked'] ? 1 : 0,
                            ':position' => $position++
                        ]);
                    }
                }
            }

            // Update labels if provided
            if ($labels !== null && is_array($labels)) {
                // Delete existing labels for the note
                $stmtDeleteLabels = $pdo->prepare("DELETE FROM note_labels WHERE note_id = :note_id");
                $stmtDeleteLabels->execute([':note_id' => $id]);

                // Insert new labels
                $stmtInsertLabel = $pdo->prepare("INSERT INTO note_labels (note_id, label_id) VALUES (:note_id, :label_id)");
                foreach ($labels as $labelId) {
                    $stmtInsertLabel->execute([':note_id' => $id, ':label_id' => $labelId]);
                }
            }

            // Fetch assigned labels for the note
            $stmtLabels = $pdo->prepare("SELECT l.id, l.name, l.color FROM labels l JOIN note_labels nl ON l.id = nl.label_id WHERE nl.note_id = :note_id");
            $stmtLabels->execute([':note_id' => $id]);
            $note['labels'] = $stmtLabels->fetchAll();

            http_response_code(200);
            echo json_encode($note);
        } else {
            http_response_code(404);
            echo json_encode(['error' => true, 'message' => 'Note not found']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => true, 'message' => 'Error updating note: ' . $e->getMessage()]);
    }
}

function handleDelete($pdo) {
    // Accept id from query parameter or URL path
    $id = null;
    if (isset($_GET['id'])) {
        $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    } else {
        // Try to get id from URL path (e.g., /api/notes/16)
        $path = $_SERVER['REQUEST_URI'];
        $parts = explode('/', trim($path, '/'));
        $lastPart = end($parts);
        if (is_numeric($lastPart)) {
            $id = (int)$lastPart;
        }
    }

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => true, 'message' => 'Note ID required']);
        return;
    }
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => true, 'message' => 'Invalid note ID']);
        return;
    }

    try {
            // Soft delete: set status to 'trashed' instead of deleting
            $stmt = $pdo->prepare("UPDATE notes SET status = 'trashed' WHERE id = :id");
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                http_response_code(200);
                echo json_encode(['success' => true, 'message' => 'Note moved to trash']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => true, 'message' => 'Note not found']);
            }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => true, 'message' => 'Error deleting note: ' . $e->getMessage()]);
    }
}
?>
