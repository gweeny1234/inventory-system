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

header("Access-Control-Allow-Methods: DELETE, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed. Use DELETE or POST."]);
    exit();
}


include_once '../../config/Database.php';

$database = new Database();
$db = $database->connect();

// delete
$data = json_decode(file_get_contents("php://input"));

if (empty($data->id)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Supplier ID is required']);
    exit();
}

try {
    $query = "DELETE FROM suppliers WHERE id = :id";
    $stmt = $db->prepare($query);
    
    $id = intval($data->id);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Supplier deleted successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Failed to delete supplier.'
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    
    // Check if the deletion failed because of active products linked to this supplier
    if ($e->getCode() == '23000') {
        echo json_encode([
            'success' => false, 
            'message' => 'Cannot delete supplier: This supplier is currently assigned to active products.'
        ]);
    } else {
        echo json_encode([
            'success' => false, 
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
}
?>