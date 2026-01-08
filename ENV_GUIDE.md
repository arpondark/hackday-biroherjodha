# Environment Variables Guide

## Frontend (.env)

Required variables for the frontend:

```bash
# API endpoint for backend
VITE_API_URL=http://localhost:5000

# Google OAuth Client ID for authentication
# Get from: https://console.cloud.google.com/apis/credentials
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## Backend (.env)

Required variables for the backend:

```bash
# Server Configuration
PORT=5000

# Database Connection
MONGODB_URI=mongodb://localhost:27017/silent-signal

# JWT Secret for token generation
# Use a strong random string in production
JWT_SECRET=your-jwt-secret-key-here

# Google OAuth Client ID
# Same as frontend - used for validation (optional)
# Note: Backend decodes the JWT credential directly, doesn't need client secret
GOOGLE_CLIENT_ID=your-google-client-id
```

## What Each Variable Does

### Frontend

- **VITE_API_URL**: Backend API base URL
- **VITE_GOOGLE_CLIENT_ID**: Google OAuth client ID for login button

### Backend

- **PORT**: Server port (default: 5000)
- **MONGODB_URI**: MongoDB connection string
- **JWT_SECRET**: Secret key for signing JWT tokens
- **GOOGLE_CLIENT_ID**: Google OAuth client ID (optional, for validation)

## Removed Variables

The following variables were removed as they are not used:

- ~~VITE_GITHUB_CLIENT_ID~~ (frontend)
- ~~GOOGLE_CLIENT_SECRET~~ (backend)
- ~~GITHUB_CLIENT_ID~~ (backend)
- ~~GITHUB_CLIENT_SECRET~~ (backend)
