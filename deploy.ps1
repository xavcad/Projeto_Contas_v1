# Configurações FTP
$ftpUrl = "ftp://ftp.xmi.com.br"
$user = "u947604324"
$pass = "100+Senha"
$remotePath = "/domains/xmi.com.br/public_html"

# Criar pasta dist
Write-Host "Preparando arquivos..."
Remove-Item -Path "dist" -Recurse -ErrorAction SilentlyContinue
New-Item -Path "dist" -ItemType Directory

# Copiar arquivos
Copy-Item "index.html" -Destination "dist"
Copy-Item "styles.css" -Destination "dist"
Copy-Item "script.js" -Destination "dist"
Copy-Item "api" -Destination "dist" -Recurse
Copy-Item ".htaccess" -Destination "dist"

# Upload via FTP
Write-Host "Iniciando upload..."
$webclient = New-Object System.Net.WebClient
$webclient.Credentials = New-Object System.Net.NetworkCredential($user, $pass)

# Ignorar erros de certificado SSL
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

Get-ChildItem -Path "dist" -Recurse -File | ForEach-Object {
    $remotefile = $_.FullName.Replace((Get-Location).Path + "\dist\", "")
    $uri = New-Object System.Uri("$ftpUrl$remotePath/$remotefile")
    Write-Host "Uploading $remotefile..."
    try {
        $webclient.UploadFile($uri, $_.FullName)
        Write-Host "Uploaded $remotefile successfully"
    } catch {
        Write-Host "Error uploading $remotefile : $_"
    }
}

Write-Host "Upload concluído!" 