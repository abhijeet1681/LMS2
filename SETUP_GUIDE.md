# LearnLab Setup Guide

## Quick Fix for Current Issues

### 1. Frontend TypeScript Error (FIXED ✅)
The TypeScript interface syntax error has been fixed by converting the interface to a type alias in the Chatbot component.

### 2. Backend Stripe Error (FIXED ✅)
The Stripe initialization error has been fixed by adding proper error handling for missing API keys.

## Environment Setup

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGO_URI=mongodb://localhost:27017/learnlab

# JWT Configuration
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
ACCESS_TOKEN_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d

# Session Configuration
SESSION_SECRET=your_session_secret_here

# Client Configuration
CLIENT_URL=http://localhost:5173

# Google OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Email Configuration (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# Cloudinary Configuration (Optional)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe Configuration (Optional - for payments)
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# OpenAI Configuration (Required for chatbot)
OPENAI_API_KEY=sk-your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=400
OPENAI_TEMPERATURE=0.7
```

## Required vs Optional Services

### Required for Basic Functionality:
- `MONGO_URI` - MongoDB connection string
- `ACCESS_TOKEN_SECRET` - JWT signing secret
- `REFRESH_TOKEN_SECRET` - JWT refresh secret
- `SESSION_SECRET` - Session encryption secret
- `CLIENT_URL` - Frontend URL

### Optional Services:
- **Google OAuth** - For Google login (can use email/password instead)
- **Email Service** - For password reset emails
- **Cloudinary** - For image uploads (can use local storage)
- **Stripe** - For payment processing (can disable payments)
- **OpenAI** - For chatbot AI responses (falls back to predefined responses)

## Quick Start (Minimal Setup)

For a minimal setup to get the application running:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/learnlab
ACCESS_TOKEN_SECRET=your_secret_key_here
REFRESH_TOKEN_SECRET=your_refresh_secret_here
SESSION_SECRET=your_session_secret_here
CLIENT_URL=http://localhost:5173
```

## Installation Steps

### 1. Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 2. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On Windows (if installed as service)
# MongoDB should start automatically

# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

### 3. Start the Application

```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend
cd frontend
npm run dev
```

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check if the connection string is correct
   - Try using MongoDB Atlas for cloud hosting

2. **Port Already in Use**
   - Change the PORT in .env file
   - Kill processes using the port: `npx kill-port 5000`

3. **Module Not Found Errors**
   - Run `npm install` in both frontend and backend directories
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`

4. **TypeScript Errors**
   - Ensure all TypeScript files have proper syntax
   - Check for missing type definitions

### Getting API Keys:

1. **OpenAI API Key** (for chatbot):
   - Visit: https://platform.openai.com/api-keys
   - Create a new API key
   - Add to .env as `OPENAI_API_KEY`

2. **Stripe Keys** (for payments):
   - Visit: https://dashboard.stripe.com/apikeys
   - Get test keys for development
   - Add to .env as `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY`

3. **Google OAuth** (for Google login):
   - Visit: https://console.cloud.google.com/
   - Create OAuth 2.0 credentials
   - Add to .env as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

4. **Cloudinary** (for image uploads):
   - Visit: https://cloudinary.com/
   - Get cloud name, API key, and secret
   - Add to .env as `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## Features Status

### ✅ Working (No API Keys Required):
- User authentication (email/password)
- Course management
- User profiles
- Basic chat functionality
- Course enrollment (without payments)
- Progress tracking
- Quiz system

### 🔧 Working (With API Keys):
- **Chatbot AI responses** (OpenAI API key)
- **Payment processing** (Stripe API keys)
- **Google OAuth login** (Google API keys)
- **Image uploads** (Cloudinary API keys)
- **Email notifications** (Email service)

### 🚀 Ready to Use:
- All core LMS functionality
- Enhanced About and Contact pages
- Modern UI/UX design
- Responsive design
- Dark mode support

## Next Steps

1. **Start with minimal setup** to get the application running
2. **Add OpenAI API key** to enable AI chatbot responses
3. **Add other API keys** as needed for additional features
4. **Customize the application** for your specific needs

The application will work perfectly with just the minimal setup, and you can add more features gradually as needed!
