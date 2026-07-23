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

header("Access-Control-Allow-Methods: POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed. Use PUT or POST."]);
    exit();
}

// -------------------------------------------------------------
// 2. DATABASE CONNECTION
// -------------------------------------------------------------
$host = "localhost";
$db_name = "jen_inventory"; // <-- Double check if this is your database name!
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

// -------------------------------------------------------------
// 3. READ INPUT AND UPDATE PRODUCT
// -------------------------------------------------------------
$input = json_decode(file_get_contents("php://input"), true);

$id = isset($input['id']) ? intval($input['id']) : null;
$name = isset($input['name']) ? trim($input['name']) : null;
$category_id = isset($input['category_id']) && $input['category_id'] !== '' ? intval($input['category_id']) : null;
$supplier_id = isset($input['supplier_id']) && $input['supplier_id'] !== '' ? intval($input['supplier_id']) : null;
$price = isset($input['price']) && $input['price'] !== '' ? floatval($input['price']) : 0.00;
$stock = isset($input['stock']) && $input['stock'] !== '' ? intval($input['stock']) : 0;
$date_added = isset($input['date_added']) ? trim($input['date_added']) : date('Y-m-d');

if (!empty($id) && !empty($name)) {
    try {
        // Safe Update Query 
        $query = "UPDATE products 
                  SET name = :name, 
                      category_id = :category_id, 
                      supplier_id = :supplier_id, 
                      price = :price, 
                      stock = :stock, 
                      date_added = :date_added 
                  WHERE id = :id";
                  
        $stmt = $db->prepare($query);
        
        // Ensure values are strictly formatted to prevent database type mismatches
        $stmt->bindParam(':name', $name);
        
        // If category_id/supplier_id is null, bind it correctly as a NULL parameter
        if ($category_id === null) {
            $stmt->bindValue(':category_id', null, PDO::PARAM_NULL);
        } else {
            $stmt->bindValue(':category_id', $category_id, PDO::PARAM_INT);
        }

        if ($supplier_id === null) {
            $stmt->bindValue(':supplier_id', null, PDO::PARAM_NULL);
        } else {
            $stmt->bindValue(':supplier_id', $supplier_id, PDO::PARAM_INT);
        }

        $stmt->bindParam(':price', $price);
        $stmt->bindParam(':stock', $stock, PDO::PARAM_INT);
        $stmt->bindParam(':date_added', $date_added);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Product updated successfully."
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Failed to update product."]);
        }
    } catch (PDOException $e) {
        // This catch will output the EXACT MySQL error to your frontend console!
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
        "message" => "Missing required fields (ID and Product Name are required)."
    ]);
}