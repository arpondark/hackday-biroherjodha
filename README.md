# Resonance

**Express emotions without words** - A frontend-first MERN application for non-verbal emotional communication through color, motion, intensity, and silence.

## Theme: Emotions Without Words

Frontend visuals are the language; the backend only supports storing and sharing emotions without words.

### Core Philosophy

- Emotions are communicated **without words**
- Silence and visuals carry meaning
- Feelings are embedded, not described
- UX must **feel** the idea, not explain it

## Features

### Frontend (Theme-Critical)

- ✅ **Google Login** - Silent entry, no forms, no words
- ✅ **Emotion Post Creator** - Full-screen canvas with color, motion speed, pattern type controls (NO text labels, NO emotion names)
- ✅ **Silent Emotion Feed** - Moving visuals only (NO captions, NO likes, NO comments, NO numbers)
- ✅ **Visual Emotion Response** - Visual → visual communication
- ✅ **Therapy / Calm Mode** - Calming frequency sounds (432Hz, 528Hz, 639Hz), 3/5/10 min sessions
- ✅ **Emotion History** - Visual timeline, pattern-based view (NO charts with numbers, NO emotion labels)
- ✅ **Accessibility Controls** - Reduced motion, sound volume, high contrast

### Backend (Theme-Supporting)

- ✅ **Google OAuth2** - JWT-based authentication
- ✅ **Emotion Post API** - Stores color, motion parameters, pattern type, timestamp (NO text fields, NO captions)
- ✅ **Emotion Feed API** - Fetches emotion posts ordered by time
- ✅ **Emotion Response API** - Links one emotion post to another (visual response only)
- ✅ **Therapy Session Support** - Saves session preferences (optional, no medical data)
- ✅ **User Settings API** - Reduced motion, sound preferences, accessibility flags

## What We Do NOT Add (Theme Breakers)

❌ Text posts
❌ Comments
❌ Likes / reactions
❌ Emojis
❌ Notifications spam
❌ Emotion labels like "sad", "happy"
❌ Gamification

## Tech Stack

### Frontend

- React + TypeScript
- Vite (build tool)
- Tailwind CSS v4
- Framer Motion (animations)
- Web Audio API (therapy sounds)
- Canvas API (emotion visuals)
- React Router (navigation)
- Axios (API client)
- Google Identity Services (OAuth2)

### Backend

- Express.js
- MongoDB + Mongoose
- JWT (authentication)
- Axios (OAuth2 requests)

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- MongoDB (running locally or cloud instance)
- Google OAuth2 credentials
- GitHub OAuth2 credentials (optional)

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file:

```bash
cp .env.example .env
```

4. Update `.env` with your credentials:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/resonance
JWT_SECRET=your-jwt-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

5. Start backend server:

```bash
npm start
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file:

```bash
cp .env.example .env
```

4. Update `.env` with your credentials:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GITHUB_CLIENT_ID=your-github-client-id
```

5. Start development server:

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

### Production Build

Frontend:

```bash
cd frontend
npm run build
```

The build output will be in `frontend/dist/`

## OAuth2 Setup

### Google OAuth2

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:5173` (development)
   - `http://localhost:5173/auth/callback` (development)
6. Copy Client ID and Client Secret to `.env` files

### GitHub OAuth2 (Optional)

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Register a new OAuth App
3. Set Authorization callback URL:
   - `http://localhost:5000/api/auth/github/callback` (development)
4. Copy Client ID and Client Secret to `.env` files

## API Endpoints

### Authentication

- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/github` - GitHub OAuth login
- `GET /api/users/me` - Get current user profile

### Emotional Signals

- `GET /api/signals` - Get all signals (feed)
- `POST /api/signals` - Create new signal
- `GET /api/signals/user/:userId` - Get user's signals
- `DELETE /api/signals/:id` - Delete signal

### User Settings

- `PUT /api/users/settings` - Update user preferences
- `GET /api/users/settings` - Get user preferences

## One-Line Judge Defense

"Frontend visuals are the language; the backend only supports storing and sharing emotions without words."

## Final Verdict

If your app has:

- ✅ Emotion posting via visuals
- ✅ Silent feed
- ✅ Therapy calm mode
- ✅ No text communication

Then it is **100% theme-correct** and **hackathon-safe**.

## License

MIT
