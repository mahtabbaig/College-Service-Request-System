#!/usr/bin/env bash
# College Service Request System — one-shot local setup (macOS / Linux)
set -e

echo "== College Service Request System — Setup =="

echo "[1/4] Creating Python virtual environment..."
cd backend
python3 -m venv venv
source venv/bin/activate

echo "[2/4] Installing backend dependencies..."
pip install -r requirements.txt

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created backend/.env from .env.example — edit MONGODB_URI if needed."
fi

echo "[3/4] Seeding demo data into MongoDB..."
python -m app.seed.seed_data

cd ..

echo "[4/4] Installing frontend dependencies..."
cd frontend
[ -f .env ] || cp .env.example .env
npm install
cd ..

echo ""
echo "Setup complete."
echo "Start the backend:  cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "Start the frontend: cd frontend && npm run dev"
echo "Then open http://localhost:5173 and log in with student@college.demo / Demo@1234"
