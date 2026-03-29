#!/bin/bash
echo "==================================================="
echo "🍕 Welcome to Cravify!"
echo "==================================================="
echo ""

# -------------------------------------------------------
# Step 1: Install dependencies
# -------------------------------------------------------
dirs=(
  "backend"
  "frontend"
)

i=1
total=${#dirs[@]}
for dir in "${dirs[@]}"; do
  echo "[$i/$total] Installing dependencies for $dir..."
  (cd "$dir" && npm install)
  i=$((i+1))
done

# -------------------------------------------------------
# Step 2: Seed database (optional — only if no data exists)
# -------------------------------------------------------
echo ""
echo "==================================================="
read -p "🌱 Seed the database with demo data? (y/N): " seed_choice
if [[ "$seed_choice" == "y" || "$seed_choice" == "Y" ]]; then
  echo "Seeding database..."
  (cd backend && node seed_data.js)
fi

# -------------------------------------------------------
# Step 3: Start services
# -------------------------------------------------------
echo ""
echo "==================================================="
echo "✅ All dependencies installed!"
echo "Starting Backend (port 5005) + Frontend (port 5173)..."
echo "Logs are color coded and labeled per service."
echo "Press Ctrl+C at any time to STOP all services."
echo "==================================================="
echo ""
echo "📋 Login Credentials:"
echo "   Admin:    admin@cravify.com   / admin123"
echo "   Customer: rahul@example.com   / password123"
echo "   Vendor:   vendor1@example.com / password123"
echo "   Rider:    rider1@example.com  / password123"
echo ""
echo "==================================================="

# Start both services with concurrently
npx -y concurrently \
  --names "Backend,Frontend" \
  --prefix-colors "green,blue" \
  "cd backend && npm run dev" \
  "cd frontend && npm run dev"
