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

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $where = [];
        $params = [];

        if (!empty($_GET['dataInicio'])) {
            $where[] = "vencimento >= ?";
            $params[] = $_GET['dataInicio'];
        }

        if (!empty($_GET['dataFim'])) {
            $where[] = "vencimento <= ?";
            $params[] = $_GET['dataFim'];
        }

        if (!empty($_GET['categoria'])) {
            $where[] = "categoria_id = ?";
            $params[] = $_GET['categoria'];
        }

        if (!empty($_GET['status'])) {
            $where[] = "status = ?";
            $params[] = $_GET['status'];
        }

        $sql = "SELECT c.*, cat.nome as categoria_nome 
                FROM contas c 
                LEFT JOIN categorias cat ON c.categoria_id = cat.id";

        if (!empty($where)) {
            $sql .= " WHERE " . implode(" AND ", $where);
        }

        $sql .= " ORDER BY vencimento";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
} 