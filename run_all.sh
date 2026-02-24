#!/bin/bash
echo "==================================================="
echo "Welcome to Cravify!"
echo "Installing dependencies for all 8 services sequentially..."
echo "This visually prevents a console mess before starting the servers."
echo "==================================================="

dirs=(
  "frontend/admin"
  "backend/admin"
  "frontend/customer"
  "backend/customer"
  "frontend/delivery"
  "backend/delivery"
  "frontend/restaurant"
  "backend/restaurant"
)

i=1
for dir in "${dirs[@]}"; do
  echo "[$i/8] Installing dependencies for $dir..."
  # Run in a subshell so parent script path is unaffected
  (cd "$dir" && npm install)
  i=$((i+1))
done

echo ""
echo "==================================================="
echo "All dependencies installed!"
echo "Starting all 8 services using 'npx concurrently' within this SINGLE terminal..."
echo "Logs will be neatly color coded and labeled per service!"
echo "Press Ctrl+C at any time to seamlessly STOP all services."
echo "==================================================="

# Utilize concurrently via npx to elegantly route parallel logs
npx concurrently \
  --names "F-Admin,B-Admin,F-Customer,B-Customer,F-Delivery,B-Delivery,F-Restaurant,B-Restaurant" \
  --prefix-colors "blue,green,magenta,yellow,cyan,white,gray,red" \
  "cd frontend/admin && npm run dev" \
  "cd backend/admin && npm run dev" \
  "cd frontend/customer && npm run dev" \
  "cd backend/customer && npm run dev" \
  "cd frontend/delivery && npm run dev" \
  "cd backend/delivery && npm run dev" \
  "cd frontend/restaurant && npm run dev" \
  "cd backend/restaurant && npm run dev"
