# College Service Request System — one-shot local setup (Windows / PowerShell)
# Run this from the folder that CONTAINS "college-service-request-system"
# (i.e. run it after unzipping, from inside the project root), in VS Code's
# integrated terminal (View > Terminal), or any PowerShell prompt.
#
# Prerequisites: Python 3.10+, Node.js 18+, and a running MongoDB instance
# (local mongod on localhost:27017, or a MongoDB Atlas connection string).

Write-Host "== College Service Request System — Setup ==" -ForegroundColor Cyan

# --- Backend ---
Write-Host "`n[1/4] Creating Python virtual environment..." -ForegroundColor Yellow
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1

Write-Host "[2/4] Installing backend dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

if (-Not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "Created backend\.env from .env.example — edit MONGODB_URI if needed." -ForegroundColor Green
}

Write-Host "[3/4] Seeding demo data into MongoDB..." -ForegroundColor Yellow
python -m app.seed.seed_data

cd ..

# --- Frontend ---
Write-Host "[4/4] Installing frontend dependencies..." -ForegroundColor Yellow
cd frontend
if (-Not (Test-Path .env)) {
    Copy-Item .env.example .env
}
npm install
cd ..

Write-Host "`nSetup complete." -ForegroundColor Cyan
Write-Host "Start the backend:  cd backend; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --reload"
Write-Host "Start the frontend: cd frontend; npm run dev"
Write-Host "Then open http://localhost:5173 and log in with student@college.demo / Demo@1234"
