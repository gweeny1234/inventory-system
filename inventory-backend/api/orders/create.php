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

header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed. Use POST."]);
    exit();
}

// 2. DATABASE CONNECTION
include_once '../../config/Database.php';

$database = new Database();
$db = $database->connect();

// 3. READ INPUT AND PROCESS TRANSACTION
$data = json_decode(file_get_contents("php://input"));

if (empty($data->product_id) || empty($data->quantity)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Product and quantity are required']);
    exit();
}

try {
    $db->beginTransaction();

    // Get product info and check stock using FETCH_ASSOC
    $productQuery = "SELECT id, name, price, stock FROM products WHERE id = :id LIMIT 1";
    $productStmt = $db->prepare($productQuery);
    
    $productId = intval($data->product_id);
    $productStmt->bindParam(':id', $productId, PDO::PARAM_INT);
    $productStmt->execute();

    if ($productStmt->rowCount() === 0) {
        $db->rollBack();
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Product not found']);
        exit();
    }

    $product = $productStmt->fetch(PDO::FETCH_ASSOC);

    if ($product['stock'] < $data->quantity) {
        $db->rollBack();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Insufficient stock. Available: ' . $product['stock']]);
        exit();
    }

    // Generate order number
    $orderNo = 'ORD-' . date('Ymd') . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
    
    // Calculate total
    $totalPrice = $product['price'] * intval($data->quantity);
    
    // Insert order
    $query = "INSERT INTO orders (order_no, product_id, user_id, quantity, total_price, order_date, status) 
              VALUES (:order_no, :product_id, :user_id, :quantity, :total_price, :order_date, 'pending')";
    
    $stmt = $db->prepare($query);

    $userId = !empty($data->user_id) ? intval($data->user_id) : null;
    $orderDate = !empty($data->order_date) ? trim($data->order_date) : date('Y-m-d');
    $quantity = intval($data->quantity);

    $stmt->bindParam(':order_no', $orderNo, PDO::PARAM_STR);
    $stmt->bindParam(':product_id', $productId, PDO::PARAM_INT);
    
    if ($userId === null) {
        $stmt->bindValue(':user_id', null, PDO::PARAM_NULL);
    } else {
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
    }
    
    $stmt->bindParam(':quantity', $quantity, PDO::PARAM_INT);
    $stmt->bindParam(':total_price', $totalPrice);
    $stmt->bindParam(':order_date', $orderDate, PDO::PARAM_STR);

    $stmt->execute();
    $orderId = $db->lastInsertId();

    // Update product stock
    $updateStock = "UPDATE products SET stock = stock - :quantity WHERE id = :product_id";
    $stockStmt = $db->prepare($updateStock);
    $stockStmt->bindParam(':quantity', $quantity, PDO::PARAM_INT);
    $stockStmt->bindParam(':product_id', $productId, PDO::PARAM_INT);
    $stockStmt->execute();

    $db->commit();

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Order created successfully',
        'order_no' => $orderNo,
        'id' => $orderId,
        'total_price' => $totalPrice
    ]);

} catch (PDOException $e) {
    // Check if transition is active before rolling back
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>