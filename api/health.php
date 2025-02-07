<?php
header('Content-Type: application/json');

$status = [
    'database' => false,
    'api' => false,
    'timestamp' => date('Y-m-d H:i:s')
];

// Verificar banco de dados
try {
    require_once 'conexao.php';
    $pdo->query('SELECT 1');
    $status['database'] = true;
} catch(Exception $e) {
    error_log($e->getMessage());
}

// Verificar API
try {
    $status['api'] = true;
} catch(Exception $e) {
    error_log($e->getMessage());
}

echo json_encode($status);
?> 