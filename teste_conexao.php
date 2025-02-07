<?php
try {
    $host = 'localhost';
    $dbname = 'u947604324_BD_Contas';
    $user = 'u947604324_admin';
    $password = 'Data@1020';

    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Conexão realizada com sucesso!<br>";
    
    // Tenta criar a tabela se ela não existir
    $sql = "CREATE TABLE IF NOT EXISTS contas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        descricao VARCHAR(255) NOT NULL,
        valor DECIMAL(10,2) NOT NULL,
        vencimento DATE NOT NULL,
        tipo ENUM('pagar', 'receber') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    
    $pdo->exec($sql);
    echo "Tabela 'contas' verificada/criada com sucesso!<br>";
    
    // Testa uma inserção
    $stmt = $pdo->prepare("INSERT INTO contas (descricao, valor, vencimento, tipo) VALUES (?, ?, ?, ?)");
    $stmt->execute(['Teste de conexão', 100.00, date('Y-m-d'), 'pagar']);
    echo "Registro de teste inserido com sucesso!<br>";
    
    // Testa uma consulta
    $stmt = $pdo->query("SELECT * FROM contas LIMIT 1");
    $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Consulta realizada com sucesso! Primeiro registro:<br>";
    print_r($resultado);
    
} catch(PDOException $e) {
    echo "Erro de conexão: " . $e->getMessage() . "<br>";
    echo "Código do erro: " . $e->getCode() . "<br>";
    
    // Informações adicionais para debug
    echo "Trace:<br>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}
?> 