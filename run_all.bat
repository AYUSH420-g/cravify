@echo off
echo ===================================================
echo Welcome to Cravify!
echo Installing dependencies for all 8 services sequentially...
echo This visually prevents a console mess before starting the servers.
echo ===================================================

echo [1/8] Installing Admin Frontend...
pushd frontend\admin
call npm install
popd

echo [2/8] Installing Admin Backend...
pushd backend\admin
call npm install
popd

echo [3/8] Installing Customer Frontend...
pushd frontend\customer
call npm install
popd

echo [4/8] Installing Customer Backend...
pushd backend\customer
call npm install
popd

echo [5/8] Installing Delivery Frontend...
pushd frontend\delivery
call npm install
popd

echo [6/8] Installing Delivery Backend...
pushd backend\delivery
call npm install
popd

echo [7/8] Installing Restaurant Frontend...
pushd frontend\restaurant
call npm install
popd

echo [8/8] Installing Restaurant Backend...
pushd backend\restaurant
call npm install
popd

echo ===================================================
echo All dependencies installed!
echo Starting all 8 services using 'npx concurrently' within this SINGLE terminal...
echo Logs will be color coded and labeled!
echo Press Ctrl+C at any time to seamlessly STOP all services.
echo ===================================================

call npx concurrently ^
  --names "F-Admin,B-Admin,F-Customer,B-Customer,F-Delivery,B-Delivery,F-Restaurant,B-Restaurant" ^
  --prefix-colors "blue,green,magenta,yellow,cyan,white,gray,red" ^
  "cd frontend\admin && npm run dev" ^
  "cd backend\admin && npm run dev" ^
  "cd frontend\customer && npm run dev" ^
  "cd backend\customer && npm run dev" ^
  "cd frontend\delivery && npm run dev" ^
  "cd backend\delivery && npm run dev" ^
  "cd frontend\restaurant && npm run dev" ^
  "cd backend\restaurant && npm run dev"

pause
