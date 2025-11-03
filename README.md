# Kartsique - Democratic Discourse Platform

A modern web platform for live debates and democratic discourse with real-time video calls.

## Features

- ✅ User authentication (signup/login)
- ✅ Live debate video calls (WebRTC + Socket.io)
- ✅ Multi-device support
- ✅ Modern UI with Tailwind CSS
- ✅ Dark/Light theme support
- ✅ Public debates (no sign-in required for calls)

## Quick Start

### Local Development

1. **Start Backend API** (optional - for auth):
   ```bash
   cd backend
   python main.py
   ```

2. **Start Signaling Server**:
   ```bash
   npm run server
   ```

3. **Start Frontend**:
   ```bash
   npm run dev
   ```

### Share Locally (Same WiFi)

**Start with network access:**
```bash
npm run dev:network
```

Share the IP address shown in terminal with friends on same WiFi.

## Deployment

See [QUICK_SHARE.md](./QUICK_SHARE.md) for detailed deployment instructions.

### Quick Deploy:

- **Frontend**: Deploy to [Vercel](https://vercel.com) (free)
- **Signaling Server**: Deploy to [Railway](https://railway.app) (free tier)
- **Backend**: Deploy to Railway or Render (free tier)

## Project Structure

```
kartsique/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components (DebateCall)
│   └── App.jsx         # Main app with routing
├── backend/            # FastAPI backend (auth)
├── server.js           # Socket.io signaling server
└── package.json
```

## Environment Variables

Create `.env` file:
```
VITE_API_URL=http://localhost:8000
VITE_SIGNALING_SERVER=http://localhost:3001
```

For production, set these in your hosting platform.

## Share Your App

Once deployed, share your public URL with friends!
