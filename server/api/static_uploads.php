<?php
// Serve static files from the uploads directory

$uploadsDir = __DIR__ . '/uploads';

$requestUri = $_SERVER['REQUEST_URI'] ?? '';
$basePath = '/uploads';

if (strpos($requestUri, $basePath) === 0) {
    $filePath = substr($requestUri, strlen($basePath));
    $filePath = urldecode($filePath);
    $fullPath = realpath($uploadsDir . $filePath);

    if ($fullPath === false || strpos($fullPath, $uploadsDir) !== 0 || !file_exists($fullPath)) {
        http_response_code(404);
        echo "File not found";
        exit();
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $fullPath);
    finfo_close($finfo);

    header('Content-Type: ' . $mimeType);
    header('Content-Length: ' . filesize($fullPath));
    readfile($fullPath);
    exit();
}
?>
