@echo off
echo Stopping existing backend server...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3010') do taskkill /F /PID %%a 2>nul

timeout /t 2 /nobreak > nul

echo Starting Backend Server (Port 3010)...
cd /d C:\Users\Musharraf\Documents\SaaS\backend
npm run dev
