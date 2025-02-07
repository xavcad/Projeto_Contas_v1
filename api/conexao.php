<?php
$host = 'localhost';
$dbname = 'u947604324_BD_Contas';
$user = 'u947604324_admin';
$password = 'DataContas102030';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo "Erro de conexão: " . $e->getMessage() . "<br>";
    exit;
} 