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

try {
    // 1. Total Products
    $productQuery = "SELECT COUNT(*) as total FROM products";
    $productStmt = $db->prepare($productQuery);
    $productStmt->execute();
    $totalProducts = $productStmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

    // 2. Total Stock
    $stockQuery = "SELECT COALESCE(SUM(stock), 0) as total FROM products";
    $stockStmt = $db->prepare($stockQuery);
    $stockStmt->execute();
    $totalStock = $stockStmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

    // 3. Total Orders
    $orderQuery = "SELECT COUNT(*) as total FROM orders";
    $orderStmt = $db->prepare($orderQuery);
    $orderStmt->execute();
    $totalOrders = $orderStmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

    // 4. Reorder Suggestions (products where stock <= reorder_level)
    $reorderQuery = "SELECT COUNT(*) as total FROM products WHERE stock <= reorder_level";
    $reorderStmt = $db->prepare($reorderQuery);
    $reorderStmt->execute();
    $reorderCount = $reorderStmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

    // 5. Low Stock Products
    $lowStockQuery = "SELECT p.id, p.name, p.stock, p.reorder_level, c.name as category_name 
                      FROM products p 
                      LEFT JOIN categories c ON p.category_id = c.id 
                      WHERE p.stock <= p.reorder_level 
                      ORDER BY p.stock ASC 
                      LIMIT 10";
    $lowStockStmt = $db->prepare($lowStockQuery);
    $lowStockStmt->execute();
    $lowStockProducts = $lowStockStmt->fetchAll(PDO::FETCH_ASSOC);

    // 6. Recent Orders
    $recentOrdersQuery = "SELECT o.*, p.name as product_name 
                          FROM orders o 
                          LEFT JOIN products p ON o.product_id = p.id 
                          ORDER BY o.created_at DESC 
                          LIMIT 5";
    $recentOrdersStmt = $db->prepare($recentOrdersQuery);
    $recentOrdersStmt->execute();
    $recentOrders = $recentOrdersStmt->fetchAll(PDO::FETCH_ASSOC);

    // Send formatted success response
    echo json_encode([
        'success' => true,
        'data' => [
            'total_products' => (int) $totalProducts,
            'total_stock' => (int) $totalStock,
            'total_orders' => (int) $totalOrders,
            'reorder_count' => (int) $reorderCount,
            'low_stock_products' => $lowStockProducts ? $lowStockProducts : [],
            'recent_orders' => $recentOrders ? $recentOrders : []
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>