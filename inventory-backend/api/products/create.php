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

// Database Connection
$host = "localhost";
$db_name = "jen_inventory"; 
$username = "root";        
$password = "";            

try {
    $db = new PDO("mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $e->getMessage()]);
    exit();
}


// Read Input and Insert Product
$input = json_decode(file_get_contents("php://input"), true);

// Retrieve input fields 
$name = isset($input['name']) ? trim($input['name']) : null;
$price = isset($input['price']) && $input['price'] !== '' ? floatval($input['price']) : 0.00;
$stock = isset($input['stock']) && $input['stock'] !== '' ? intval($input['stock']) : 0;
$category_id = isset($input['category_id']) && $input['category_id'] !== '' ? intval($input['category_id']) : null; 
$supplier_id = isset($input['supplier_id']) && $input['supplier_id'] !== '' ? intval($input['supplier_id']) : null; 

if (!empty($name) && !empty($category_id) && !empty($supplier_id)) {
    try {
        
        $date_added = isset($input['date_added']) ? trim($input['date_added']) : date('Y-m-d');

        $query = "INSERT INTO products (name, price, stock, category_id, supplier_id, date_added) 
                  VALUES (:name, :price, :stock, :category_id, :supplier_id, :date_added)";
                  
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':price', $price);
        $stmt->bindParam(':stock', $stock, PDO::PARAM_INT);
        $stmt->bindParam(':category_id', $category_id, PDO::PARAM_INT);
        $stmt->bindParam(':supplier_id', $supplier_id, PDO::PARAM_INT);
        $stmt->bindParam(':date_added', $date_added);
        
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode([
                "success" => true,
                "message" => "Product created successfully."
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Failed to save product to database."]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false, 
            "message" => "SQL Error: " . $e->getMessage()
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields (Name, Category, and Supplier are required)."
    ]);
}