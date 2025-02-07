CREATE TABLE contas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    vencimento DATE NOT NULL,
    tipo ENUM('pagar', 'receber') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 