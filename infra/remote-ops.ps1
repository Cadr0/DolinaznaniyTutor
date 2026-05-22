# Windows helper:
#   .\infra\remote-ops.ps1 init-ssh-key
#   .\infra\remote-ops.ps1 status
#   .\infra\remote-ops.ps1 health
#   .\infra\remote-ops.ps1 logs app
#   .\infra\remote-ops.ps1 domain
#   .\infra\remote-ops.ps1 help
param(
  [Parameter(Position = 0)][string]$Command = "status",
  [Parameter(Position = 1)][string]$Arg = ""
)

$Server = "111.88.118.35"
$User = "root"
$Password = $env:VDS_PASSWORD
$Plink = "C:\Program Files\PuTTY\plink.exe"
$SshExe = "C:\Windows\System32\OpenSSH\ssh.exe"
$SshKeygenExe = "C:\Windows\System32\OpenSSH\ssh-keygen.exe"
$KeyPath = Join-Path $HOME ".ssh\id_ed25519"
$PubKeyPath = "$KeyPath.pub"
$AllowedOps = @("status", "logs", "health", "backup", "backups", "rollback", "db-shell", "domain", "setup-domain")

if (-not (Test-Path $SshExe)) {
  Write-Error "OpenSSH client not found at: $SshExe"
  exit 1
}

function Ensure-KeyPair {
  if (-not (Test-Path $KeyPath)) {
    New-Item -ItemType Directory -Path (Join-Path $HOME ".ssh") -Force | Out-Null
    & $SshKeygenExe -t ed25519 -f $KeyPath -N '""' -C "dolinaznaniy-server-key"
  }
}

function Build-RemoteCommand {
  param([string]$Cmd, [string]$CmdArg)

  if (($Cmd -eq "domain") -or ($Cmd -eq "setup-domain")) {
    return "cd /opt/dolinaznaniy && bash infra/setup-domain.sh"
  }
  if ($CmdArg) {
    return "cd /opt/dolinaznaniy && bash infra/ops.sh $Cmd $CmdArg"
  }
  return "cd /opt/dolinaznaniy && bash infra/ops.sh $Cmd"
}

function Print-Usage {
  Write-Host "Usage: .\infra\remote-ops.ps1 <command> [arg]"
  Write-Host ""
  Write-Host "Commands:"
  Write-Host "  init-ssh-key           Install local SSH key on server (uses VDS_PASSWORD once)"
  Write-Host "  status                 Git and docker status"
  Write-Host "  health                 /api/health and /api/version"
  Write-Host "  logs [service]         Tail logs (default: app)"
  Write-Host "  backup                 Create DB backup"
  Write-Host "  backups                List DB backups"
  Write-Host "  rollback <commit>      Roll back to commit"
  Write-Host "  db-shell               Open psql shell"
  Write-Host "  domain                 Setup HTTPS for diary-ai.ru"
  Write-Host "  help                   Show this message"
}

if (($Command -eq "help") -or ($Command -eq "--help") -or ($Command -eq "-h")) {
  Print-Usage
  exit 0
}

if ($Command -eq "init-ssh-key") {
  Ensure-KeyPair

  if (-not (Test-Path $Plink)) {
    Write-Error "PuTTY/plink not found at: $Plink. Install PuTTY first."
    exit 1
  }
  if (-not $Password) {
    Write-Error 'Set env var first: $env:VDS_PASSWORD = "root_password"'
    exit 1
  }

  $PubKey = Get-Content -Path $PubKeyPath -Raw
  $EscapedPubKey = $PubKey.Trim().Replace("'", "'\\''")
  $InstallKeyCmd = "mkdir -p ~/.ssh && chmod 700 ~/.ssh && grep -qxF '$EscapedPubKey' ~/.ssh/authorized_keys 2>/dev/null || echo '$EscapedPubKey' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"

  & $Plink -ssh "${User}@${Server}" -pw $Password -batch $InstallKeyCmd
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install SSH public key on server."
    exit $LASTEXITCODE
  }

  Write-Host "SSH key installed. Testing key-based login..."
  & $SshExe -i $KeyPath -o BatchMode=yes -o ConnectTimeout=15 -o StrictHostKeyChecking=accept-new "${User}@${Server}" "echo key-auth-ok"
  exit $LASTEXITCODE
}

if (-not ($AllowedOps -contains $Command)) {
  Write-Error "Unknown command: $Command"
  Print-Usage
  exit 1
}

Ensure-KeyPair
$Remote = Build-RemoteCommand -Cmd $Command -CmdArg $Arg

& $SshExe -i $KeyPath -o BatchMode=yes -o ConnectTimeout=20 -o StrictHostKeyChecking=accept-new "${User}@${Server}" $Remote
if ($LASTEXITCODE -eq 0) {
  exit 0
}

if ((Test-Path $Plink) -and $Password) {
  Write-Host "SSH key auth failed, trying password fallback via plink..."
  & $Plink -ssh "${User}@${Server}" -pw $Password -batch $Remote
  exit $LASTEXITCODE
}

Write-Error "SSH connection failed. Run: .\infra\remote-ops.ps1 init-ssh-key"
exit 1
