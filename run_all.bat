@echo off
echo ===================================================
echo Welcome to Cravify!
echo Starting all 8 services (4 Frontends, 4 Backends)
echo Each service will open in a new command prompt window.
echo Please wait while dependencies are installed...
echo ===================================================

:: Frontend Services
echo Starting Admin Frontend...
start "Admin Frontend" cmd /k "cd frontend\admin && npm install && npm run dev"

echo Starting Customer Frontend...
start "Customer Frontend" cmd /k "cd frontend\customer && npm install && npm run dev"

echo Starting Delivery Frontend...
start "Delivery Frontend" cmd /k "cd frontend\delivery && npm install && npm run dev"

echo Starting Restaurant Frontend...
start "Restaurant Frontend" cmd /k "cd frontend\restaurant && npm install && npm run dev"

:: Backend Services
echo Starting Admin Backend...
start "Admin Backend" cmd /k "cd backend\admin && npm install && npm run dev"

echo Starting Customer Backend...
start "Customer Backend" cmd /k "cd backend\customer && npm install && npm run dev"

echo Starting Delivery Backend...
start "Delivery Backend" cmd /k "cd backend\delivery && npm install && npm run dev"

echo Starting Restaurant Backend...
start "Restaurant Backend" cmd /k "cd backend\restaurant && npm install && npm run dev"

echo ===================================================
echo All services have been launched!
echo Ensure that MongoDB is running locally or configured via .env files.
echo Close the individual windows to stop the services.
echo ===================================================
pause
