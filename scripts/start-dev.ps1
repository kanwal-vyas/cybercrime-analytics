[CmdletBinding()]
param(
    [switch]$CheckOnly
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$frontendRoot = Join-Path $repoRoot "frontend"
$pythonExe = Join-Path $repoRoot ".venv\Scripts\python.exe"

if (-not (Test-Path $pythonExe -PathType Leaf)) {
    throw "Project virtual environment not found. Create it and install backend dependencies first: python -m venv .venv; .\.venv\Scripts\python.exe -m pip install -r requirements.txt -r backend\requirements.txt"
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js is not installed or is not available on PATH."
}

$npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
if (-not $npmCommand) {
    throw "npm.cmd is not available on PATH. Install Node.js with npm and reopen PowerShell."
}

if (-not (Test-Path (Join-Path $frontendRoot "node_modules\vite\bin\vite.js") -PathType Leaf)) {
    throw "Frontend dependencies are missing. Run 'npm ci' from the frontend directory first."
}

$env:PYTHONPATH = $repoRoot
$backendUri = [Uri]"http://127.0.0.1:8000/api/health"
$frontendPorts = @(5173, 4173)
$frontendPort = $null
$frontendUri = $null

function Test-ApiReady {
    try {
        $response = Invoke-RestMethod -Uri $backendUri -TimeoutSec 2
        return (
            $response.status -eq "ok" -and
            $response.project -eq "Cyber Crime Analytics for National Security"
        )
    }
    catch {
        return $false
    }
}

function Test-FrontendReady {
    param([Uri]$Uri)

    try {
        $response = Invoke-WebRequest -Uri $Uri -UseBasicParsing -TimeoutSec 2
        $title = [regex]::Match($response.Content, '(?is)<title>\s*(.*?)\s*</title>').Groups[1].Value
        return (
            $response.StatusCode -eq 200 -and
            $title -eq "NIRIKSHA | Cyber Crime Intelligence & Analytics"
        )
    }
    catch {
        return $false
    }
}

if ($CheckOnly) {
    Write-Output "Prerequisites are ready."
    Write-Output "Python: $pythonExe"
    Write-Output "Frontend: $frontendRoot"
    exit 0
}

foreach ($port in $frontendPorts) {
    $candidateUri = [Uri]"http://127.0.0.1:$port/"
    if (Test-FrontendReady -Uri $candidateUri) {
        $frontendPort = $port
        $frontendUri = $candidateUri
        break
    }

    $listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if (-not $listener) {
        $frontendPort = $port
        $frontendUri = $candidateUri
        break
    }
}

if ($null -eq $frontendPort) {
    throw "Both frontend ports (5173 and 4173) are occupied by other applications. Stop one of those apps and retry."
}

if (-not (Test-ApiReady)) {
    $backendArgs = @(
        "-m", "uvicorn", "backend.app.main:app",
        "--host", "127.0.0.1", "--port", "8000", "--reload"
    )
    Start-Process -FilePath $pythonExe -ArgumentList $backendArgs -WorkingDirectory $repoRoot
}

if (-not (Test-FrontendReady -Uri $frontendUri)) {
    $frontendArgs = @(
        "run", "dev", "--", "--host", "127.0.0.1",
        "--port", "$frontendPort", "--strictPort"
    )
    Start-Process -FilePath $npmCommand.Source -ArgumentList $frontendArgs -WorkingDirectory $frontendRoot
}

$deadline = (Get-Date).AddSeconds(45)
do {
    $apiReady = Test-ApiReady
    $frontendReady = Test-FrontendReady -Uri $frontendUri
    if ($apiReady -and $frontendReady) {
        Write-Output "Project is ready:"
        Write-Output "  Frontend: $frontendUri"
        Write-Output "  API health: http://127.0.0.1:8000/api/health"
        exit 0
    }
    Start-Sleep -Seconds 1
} while ((Get-Date) -lt $deadline)

throw "The services did not become ready in time. Check the backend/frontend consoles for startup errors."
