# С Windows: .\infra\remote-ops.ps1 status
param(
  [Parameter(Position = 0)][string]$Command = "status",
  [Parameter(Position = 1)][string]$Arg = ""
)

$Server = "111.88.118.35"
$User = "root"
$Password = $env:VDS_PASSWORD
$HostKey = "SHA256:6NGlgrWnOqC6o8vF8RaQ7kvPdMhsYO6eRYERgSyHYxw"
$plink = "C:\Program Files\PuTTY\plink.exe"

if (-not $Password) {
  Write-Error 'Задайте: $env:VDS_PASSWORD = "пароль_root"'
  exit 1
}

$remote = "cd /opt/dolinaznaniy && bash infra/ops.sh $Command"
if ($Arg) { $remote += " $Arg" }

& $plink -ssh "${User}@${Server}" -pw $Password -hostkey $HostKey -batch $remote
