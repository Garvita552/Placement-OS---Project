# Backend Setup Script for Windows

# Step 1: Navigate to backend directory
cd backend

# Step 2: Install dependencies (run in PowerShell as Admin)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
npm install

# Step 3: Create .env file if it doesn't exist
if (!(Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created"
} else {
    Write-Host "✅ .env file already exists"
}

# Step 4: Check MongoDB connection
Write-Host "🔍 Checking MongoDB..."
try {
    Get-Service -Name "MongoDB" -ErrorAction Stop | Out-Null
    Write-Host "✅ MongoDB service found"
} catch {
    Write-Host "⚠️ MongoDB service not found. Please install MongoDB or start the service."
    Write-Host "💡 Download MongoDB from: https://www.mongodb.com/try/download/community"
}

# Step 5: Start the backend server
Write-Host "🚀 Starting backend server..."
npm start
