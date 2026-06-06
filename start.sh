#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
    echo "Shutting down..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

echo "=== ChargeSpot - EV Charger Finder ==="
echo ""

# Backend
echo "[1/2] Starting backend..."
cd "$ROOT/backend"
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Frontend
echo "[2/2] Starting frontend..."
cd "$ROOT/frontend"
if [ ! -d "node_modules" ]; then
    npm install
fi
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev -- -p 3000 &
FRONTEND_PID=$!

echo ""
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "API docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop."

wait
