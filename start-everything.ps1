# Nexus Gateways - Automatic Startup Script (PowerShell)
# This script starts both the WebSocket server and the frontend dev server

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       🚀 Nexus Gateways - Automatic Startup Script 🚀          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Get the directory where this script is located
Set-Location $PSScriptRoot

Write-Host "⏳ Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Check if ws package is installed
Write-Host "⏳ Checking if WebSocket (ws) package is installed..." -ForegroundColor Yellow
$wsCheck = npm list ws 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  WebSocket package not found. Installing..." -ForegroundColor Yellow
    npm install ws
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install ws package" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "✅ WebSocket package installed!" -ForegroundColor Green
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Starting services..." -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Start WebSocket server in a new PowerShell window
Write-Host "🌐 Starting WebSocket Server on ws://localhost:3000..." -ForegroundColor Green
$serverProcessPath = Join-Path $PSScriptRoot "websocket-server.js"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; node websocket-server.js"

# Give the server a moment to start
Start-Sleep -Seconds 2

# Start the frontend dev server
Write-Host "💻 Starting Frontend Dev Server on http://localhost:5173..." -ForegroundColor Green
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

npm run dev

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Startup Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "🌐 WebSocket: ws://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "  - Open 2 browser tabs to test multiplayer" -ForegroundColor Gray
Write-Host "  - Check the WebSocket Server window for connection logs" -ForegroundColor Gray
Write-Host "  - Close either window to stop that service" -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter to exit"
