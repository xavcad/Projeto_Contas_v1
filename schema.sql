CREATE TABLE contas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    vencimento DATE NOT NULL,
    tipo ENUM('pagar', 'receber') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    tipo ENUM('pagar', 'receber', 'ambos') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE contas 
ADD COLUMN categoria_id INT,
ADD FOREIGN KEY (categoria_id) REFERENCES categorias(id);

-- Inserir categorias padrão
INSERT INTO categorias (nome, tipo) VALUES 
('Alimentação', 'pagar'),
('Transporte', 'pagar'),
('Moradia', 'pagar'),
('Saúde', 'pagar'),
('Educação', 'pagar'),
('Salário', 'receber'),
('Investimentos', 'receber'),
('Outros', 'ambos'); 