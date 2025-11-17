@echo off
REM Nexus Gateways - Automatic Startup Script
REM This script starts both the WebSocket server and the frontend dev server

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║       🚀 Nexus Gateways - Automatic Startup Script 🚀          ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Get the directory where this script is located
cd /d "%~dp0"

echo ⏳ Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo ✅ Node.js found!
echo.

REM Check if ws package is installed
echo ⏳ Checking if WebSocket (ws) package is installed...
npm list ws >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  WebSocket package not found. Installing...
    call npm install ws
    if %errorlevel% neq 0 (
        echo ❌ Failed to install ws package
        pause
        exit /b 1
    )
    echo ✅ WebSocket package installed!
)

echo.
echo ═══════════════════════════════════════════════════════════════════
echo Starting services...
echo ═══════════════════════════════════════════════════════════════════
echo.

REM Start WebSocket server in a new window
echo 🌐 Starting WebSocket Server on ws://localhost:3000...
start "Nexus WebSocket Server" cmd /k "node websocket-server.js"

REM Give the server a moment to start
timeout /t 2 /nobreak

REM Start the frontend dev server
echo 💻 Starting Frontend Dev Server on http://localhost:5173...
echo.
echo ═══════════════════════════════════════════════════════════════════
echo.

call npm run dev

echo.
echo ═══════════════════════════════════════════════════════════════════
echo ✅ Startup Complete!
echo ═══════════════════════════════════════════════════════════════════
echo.
echo 📱 Frontend: http://localhost:5173
echo 🌐 WebSocket: ws://localhost:3000
echo.
echo 💡 Tips:
echo   - Open 2 browser tabs to test multiplayer
echo   - Check the WebSocket Server window for connection logs
echo   - Close either window to stop that service
echo.
pause
