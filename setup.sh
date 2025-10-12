#!/bin/bash

# Qumail Setup Script
# This script helps set up the Qumail application for development

echo "🚀 Setting up Qumail Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo "✅ Backend dependencies installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please edit backend/.env with your configuration"
else
    echo "✅ .env file already exists"
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo "✅ Frontend dependencies installed"

# Go back to root directory
cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit backend/.env with your configuration"
echo "2. Set up your Gmail app password (if not already done)"
echo "3. Start MongoDB (if running locally)"
echo "4. Run 'npm start' in the backend directory"
echo "5. Run 'npm run dev' in the frontend directory"
echo ""
echo "📚 For detailed setup instructions, see README_DEPLOYMENT.md"
echo "🧪 For testing, see MANUAL_TEST_CHECKLIST.md"
echo ""
echo "Happy coding! 🚀"
