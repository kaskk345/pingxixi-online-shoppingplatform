@echo off
cd /d "%~dp0"

echo [1/3] Starting backend (Spring Boot :8080) ...
start "pingxixi-backend" cmd /c "cd /d ""%~dp0backend"" && mvn spring-boot:run"

echo [2/3] Waiting for backend ...
timeout /t 18 /nobreak >nul

echo [3/3] Starting frontend (Vite :5173) ...
start "pingxixi-frontend" cmd /c "cd /d ""%~dp0frontend"" && npm run dev"

timeout /t 10 /nobreak >nul
start "" http://localhost:5173

echo pingxixi is running: http://localhost:5173
echo (close the two black windows to stop the servers)
