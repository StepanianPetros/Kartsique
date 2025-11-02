# Kartsique Backend API

FastAPI backend for Kartsique authentication and user management.

## Setup

1. Create a virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
python main.py
# Or using uvicorn directly:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/me` - Get current user information (requires authentication)
- `POST /api/auth/google` - Google OAuth (not yet implemented)

## Environment Variables

- `SECRET_KEY` - JWT secret key (default: "your-secret-key-change-in-production")

Set it in production:
```bash
export SECRET_KEY="your-secure-random-secret-key"
```

## Database

The backend uses SQLite for simplicity. The database file `kartsique.db` will be created automatically on first run.

## Security Notes

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- CORS is configured for the frontend origin

