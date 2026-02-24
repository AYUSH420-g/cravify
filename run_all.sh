#!/bin/bash
# ===================================================
# Welcome to Cravify!
# Starting all 8 services (4 Frontends, 4 Backends)
# ===================================================

# Function to setup and run a service in the background
run_service() {
    local dir=$1
    local name=$2
    
    echo "Starting $name in $dir..."
    # Run in a subshell in the background
    (cd "$dir" && npm install && npm run dev) &
    
    # Store the Process ID (PID)
    PIDS+=($!)
}

# Keep track of the background processes
PIDS=()

# Cleanup function when script is stopped (Ctrl+C)
cleanup() {
    echo ""
    echo "==================================================="
    echo "Stopping all Cravify services..."
    echo "==================================================="
    for pid in "${PIDS[@]}"; do
        # Suppress termination output
        kill $pid 2>/dev/null
    done
    echo "Services stopped successfully."
    exit 0
}

# Trap SIGINT (Ctrl+C) and call the cleanup function
trap cleanup SIGINT

echo "Installing dependencies and starting frontend services..."
run_service "frontend/admin" "Admin Frontend"
run_service "frontend/customer" "Customer Frontend"
run_service "frontend/delivery" "Delivery Frontend"
run_service "frontend/restaurant" "Restaurant Frontend"

echo "Installing dependencies and starting backend services..."
run_service "backend/admin" "Admin Backend"
run_service "backend/customer" "Customer Backend"
run_service "backend/delivery" "Delivery Backend"
run_service "backend/restaurant" "Restaurant Backend"

echo ""
echo "==================================================="
echo "All 8 services are starting up in the background!"
echo "Their outputs will be interleaved in this terminal."
echo "Press Ctrl+C at any time to comprehensively STOP all services."
echo "Ensure that MongoDB is running locally or configured via .env files."
echo "==================================================="

# Wait to hold the terminal open
wait
