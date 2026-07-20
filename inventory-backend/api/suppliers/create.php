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

include_once '../../config/Database.php';

$database = new Database();
$db = $database->connect();

// RETRIEVE AND SANITIZE INPUT
$data = json_decode(file_get_contents("php://input"));

if (empty($data->name)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Supplier name is required']);
    exit();
}

try {
    // Reverted query back to your original, working columns!
    $query = "INSERT INTO suppliers (name, contact_person, email, phone, address) 
              VALUES (:name, :contact_person, :email, :phone, :address)";
    
    $stmt = $db->prepare($query);

    // Fallbacks to keep database execution safe
    $contact_person = isset($data->contact_person) ? trim($data->contact_person) : '';
    $email = isset($data->email) ? trim($data->email) : '';
    $phone = isset($data->phone) ? trim($data->phone) : '';
    $address = isset($data->address) ? trim($data->address) : '';

    $stmt->bindParam(':name', $data->name, PDO::PARAM_STR);
    $stmt->bindParam(':contact_person', $contact_person, PDO::PARAM_STR);
    $stmt->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt->bindParam(':phone', $phone, PDO::PARAM_STR);
    $stmt->bindParam(':address', $address, PDO::PARAM_STR);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Supplier created successfully',
            'id' => $db->lastInsertId()
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to write supplier to database.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>