@echo off
REM Qumail Setup Script for Windows
REM This script helps set up the Qumail application for development

echo 🚀 Setting up Qumail Application...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

echo ✅ Backend dependencies installed

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ✅ .env file created
    echo ⚠️  Please edit backend\.env with your configuration
) else (
    echo ✅ .env file already exists
)

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd ..\frontend
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo ✅ Frontend dependencies installed

REM Go back to root directory
cd ..

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Edit backend\.env with your configuration
echo 2. Set up your Gmail app password (if not already done)
echo 3. Start MongoDB (if running locally)
echo 4. Run 'npm start' in the backend directory
echo 5. Run 'npm run dev' in the frontend directory
echo.
echo 📚 For detailed setup instructions, see README_DEPLOYMENT.md
echo 🧪 For testing, see MANUAL_TEST_CHECKLIST.md
echo.
echo Happy coding! 🚀
pause
