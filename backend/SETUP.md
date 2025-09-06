# Quick Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MySQL database

## Setup Steps

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Create Environment File
Create a `.env` file in the backend directory with your database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=eco_finds

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production_environment
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 3. Create MySQL Database
```sql
CREATE DATABASE eco_finds;
```

### 4. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

### 5. Test the API (Optional)
```bash
# Install axios for testing
npm install axios

# Run authentication tests
npm run test-auth
```

## API Endpoints

### Authentication
- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - Login user
- **GET** `/api/auth/profile` - Get user profile (requires JWT token)

### Health Check
- **GET** `/` - Check if API is running

## Example Requests

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Profile (with JWT token)
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Validation Rules
- **Name:** Required
- **Email:** Required, must be valid email format
- **Password:** Required, minimum 6 characters

## Security Features
- Passwords are hashed using bcrypt
- JWT tokens for authentication
- CORS protection for frontend integration
- Input validation and sanitization
