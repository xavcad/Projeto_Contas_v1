#!/bin/bash

# Configurações FTP
FTP_USER="u947604324"
FTP_PASS="100+Senha"
FTP_HOST="ftp.xmi.com.br"
REMOTE_PATH="/domains/xmi.com.br/public_html"

# Criar pasta de distribuição
echo "Preparando arquivos..."
rm -rf dist
mkdir dist

# Copiar arquivos
cp index.html dist/
cp styles.css dist/
cp script.js dist/
cp -r api dist/
cp .htaccess dist/

# Remover arquivos de desenvolvimento
rm -f dist/api/teste_conexao.php
rm -f dist/api/config.development.php

# Upload via FTP
echo "Iniciando upload..."
cd dist
find . -type f -exec curl -u $FTP_USER:$FTP_PASS --ftp-create-dirs -T {} ftp://$FTP_HOST$REMOTE_PATH/{} \;

if [ $? -eq 0 ]; then
    echo "Upload realizado com sucesso!"
else
    echo "Erro no upload"
    exit 1
fi 