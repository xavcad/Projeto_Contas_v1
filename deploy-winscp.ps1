# Precisa instalar o WinSCP primeiro
# https://winscp.net/eng/download.php

# Carregar assembly do WinSCP
Add-Type -Path "C:\Program Files (x86)\WinSCP\WinSCPnet.dll"

# Configurações
$sessionOptions = New-Object WinSCP.SessionOptions -Property @{
    Protocol = [WinSCP.Protocol]::Ftp
    HostName = "ftp.xmi.com.br"
    UserName = "u947604324"
    Password = "DataContas102030"
}

$session = New-Object WinSCP.Session

try {
    # Conectar
    $session.Open($sessionOptions)

    # Transferir arquivos
    $transferOptions = New-Object WinSCP.TransferOptions
    $transferOptions.TransferMode = [WinSCP.TransferMode]::Binary

    $session.PutFiles("dist\*", "/domains/xmi.com.br/public_html/", $False, $transferOptions)

} finally {
    $session.Dispose()
} 