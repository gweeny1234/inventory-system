<?php
$allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5175"
];

$origin = isset($_SERVER['HTTP_ORIGIN']) ? rtrim($_SERVER['HTTP_ORIGIN'], '/') : '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: " . $origin);
} else {
    header("Access-Control-Allow-Origin: http://localhost:5173");
}

header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed. Use GET."]);
    exit();
}

// 2. DATABASE CONNECTION
include_once '../../config/Database.php';

$database = new Database();
$db = $database->connect();


// 3. FETCH ORDERS
try {
    $query = "SELECT 
                o.*,
                p.name as product_name,
                p.price as product_price,
                c.name as category_name,
                CONCAT(u.firstname, ' ', u.lastname) as customer_name
              FROM orders o
              LEFT JOIN products p ON o.product_id = p.id
              LEFT JOIN categories c ON p.category_id = c.id
              LEFT JOIN users u ON o.user_id = u.id
              ORDER BY o.created_at DESC";

    $stmt = $db->prepare($query);
    $stmt->execute();

    // Using FETCH_ASSOC to output clean, key-value JSON arrays
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'count' => count($orders),
        'data' => $orders ? $orders : []
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>