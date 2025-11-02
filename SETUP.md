# Kartsique Setup Guide

## Quick Start

### 1. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Or use the start script:
```bash
cd backend
./start.sh
```

The backend will run on `http://localhost:8000`

### 2. Frontend Setup

```bash
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port)

## API Endpoints

- `GET /` - API status
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Get current user (requires Bearer token)

## Testing the API

### Signup:
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### Login:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Get Current User:
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Environment Variables

Create a `.env` file in the root directory:
```
VITE_API_URL=http://localhost:8000
```

## Database

The backend uses SQLite. The database file `kartsique.db` will be created automatically in the `backend/` directory.

## Features

✅ User signup with password hashing  
✅ User login with JWT tokens  
✅ Protected routes  
✅ Password validation  
✅ Email validation  
✅ CORS enabled for frontend  
✅ Token-based authentication  

