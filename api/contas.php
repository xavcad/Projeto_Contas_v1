<?php
require_once 'conexao.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $sql = "INSERT INTO contas (descricao, valor, vencimento, tipo) VALUES (?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    
    try {
        $stmt->execute([
            $data['descricao'],
            $data['valor'],
            $data['vencimento'],
            $data['tipo']
        ]);
        
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
} 