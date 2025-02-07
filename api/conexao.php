<?php
require_once 'config.php';

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME,
        DB_USER,
        DB_PASS
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    if (ENV === 'development') {
        echo "Erro de conexão: " . $e->getMessage() . "<br>";
    } else {
        error_log("Erro de conexão: " . $e->getMessage());
        echo "Erro ao conectar ao banco de dados";
    }
    exit;
}
?> 