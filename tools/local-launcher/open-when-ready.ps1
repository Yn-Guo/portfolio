<#
  open-when-ready.ps1 - wait for the local dev server, then open Edge on it.

  Started in the background by Open-Local.cmd. Can also be run by hand:
    powershell -NoProfile -ExecutionPolicy Bypass -File .\open-when-ready.ps1 -Check
#>

param(
  [string] $Url = 'http://localhost:3000',
  [int]    $Port = 3000,
  [int]    $TimeoutSeconds = 90,
  [switch] $SkipWait,
  [switch] $Check
)

$ErrorActionPreference = 'Stop'

function Test-Port {
  param([int] $PortNumber, [int] $WaitMilliseconds = 800)
  $client = New-Object System.Net.Sockets.TcpClient
  try {
    return $client.ConnectAsync('127.0.0.1', $PortNumber).Wait($WaitMilliseconds)
  } catch {
    return $false
  } finally {
    $client.Close()
  }
}

$edgeCandidates = @(
  (Join-Path ${env:ProgramFiles} 'Microsoft\Edge\Application\msedge.exe'),
  (Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe')
) | Where-Object { $_ -and (Test-Path -LiteralPath $_) }

$edge = $edgeCandidates | Select-Object -First 1

if ($Check) {
  Write-Host "url          : $Url"
  Write-Host "port open    : $(Test-Port -PortNumber $Port)"
  Write-Host "edge found   : $([bool]$edge)"
  if ($edge) { Write-Host "edge path    : $edge" }
  exit 0
}

if (-not $SkipWait) {
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    if (Test-Port -PortNumber $Port) { break }
    Start-Sleep -Milliseconds 700
  }
}

if ($edge) {
  Start-Process -FilePath $edge -ArgumentList $Url
} else {
  # No Edge found - hand the URL to whatever the default browser is.
  Start-Process $Url
}
