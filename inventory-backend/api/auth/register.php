<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/Database.php';

$database = new Database();
$db = $database->connect();

$data = json_decode(file_get_contents("php://input"));

// Validation
if (empty($data->firstname) || empty($data->lastname) || empty($data->email) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit();
}

if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit();
}

if (strlen($data->password) < 6) {
    // bad request
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
    exit();
}

try {
    // Check if email already exists
    $checkQuery = "SELECT id FROM users WHERE email = :email LIMIT 1";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':email', $data->email, PDO::PARAM_STR);
    $checkStmt->execute();

    if ($checkStmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Email already registered']);
        exit();
    }

    // Insert new user
    $query = "INSERT INTO users (firstname, lastname, email, password, role) 
              VALUES (:firstname, :lastname, :email, :password, :role)";
    
    $stmt = $db->prepare($query);

    $hashedPassword = password_hash($data->password, PASSWORD_DEFAULT);
    $role = isset($data->role) ? $data->role : 'Staff';

    $stmt->bindParam(':firstname', $data->firstname, PDO::PARAM_STR);
    $stmt->bindParam(':lastname', $data->lastname, PDO::PARAM_STR);
    $stmt->bindParam(':email', $data->email, PDO::PARAM_STR);
    $stmt->bindParam(':password', $hashedPassword, PDO::PARAM_STR);
    $stmt->bindParam(':role', $role, PDO::PARAM_STR);

    if ($stmt->execute()) {
        // created
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Registration successful',
            'user_id' => $db->lastInsertId()
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>