<?php
// Allow React frontend to access this API
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


include_once '../../config/Database.php';

$database = new Database();
$db = $database->connect();

try {
    $query = "SELECT s.*, 
              (SELECT COUNT(*) FROM products WHERE supplier_id = s.id) as product_count
              FROM suppliers s
              ORDER BY s.name ASC";

    $stmt = $db->prepare($query);
    $stmt->execute();

    $suppliers = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'count' => count($suppliers),
        'data' => $suppliers
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
