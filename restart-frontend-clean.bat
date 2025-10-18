@echo off
echo ====================================
echo CLEARING NEXT.JS CACHE AND RESTARTING
echo ====================================
echo.

cd frontend

echo [1/4] Stopping any running processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] Clearing Next.js cache...
if exist .next rmdir /s /q .next
echo Cache cleared!

echo [3/4] Clearing node_modules cache (optional)...
if exist node_modules\.cache rmdir /s /q node_modules\.cache
echo Module cache cleared!

echo [4/4] Starting frontend...
echo.
echo ====================================
echo Frontend starting on http://localhost:3002
echo ====================================
echo.

npm run dev
