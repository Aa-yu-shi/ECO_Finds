# Role-Based Authentication Setup Guide

## Overview
This backend now supports role-based authentication with two user types:
- **Buyers**: Can browse products, add to cart, make purchases
- **Sellers**: Can create products, manage inventory, view sales

## Quick Start

### 1. Environment Setup
Create a `.env` file in the backend directory:
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

### 2. Database Setup
```sql
CREATE DATABASE eco_finds;
```

### 3. Start Server
```bash
# Install dependencies
npm install

# Start server
npm start
# or for development with auto-restart
npm run dev
```

## API Usage Examples

### Register a Buyer
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Buyer",
    "email": "buyer@example.com",
    "password": "password123",
    "role": "buyer"
  }'
```

### Register a Seller
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Seller",
    "email": "seller@example.com",
    "password": "password123",
    "role": "seller"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@example.com",
    "password": "password123"
  }'
```

### Access Buyer Dashboard
```bash
curl -X GET http://localhost:5000/api/buyer/home \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Access Seller Dashboard
```bash
curl -X GET http://localhost:5000/api/seller/home \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Frontend Integration

### After Login Redirect Logic
```javascript
// Example frontend logic after successful login
const handleLogin = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store token
    localStorage.setItem('token', data.token);
    
    // Redirect based on role
    if (data.user.role === 'buyer') {
      window.location.href = '/buyer-dashboard';
    } else if (data.user.role === 'seller') {
      window.location.href = '/seller-dashboard';
    }
  }
};
```

### Making Authenticated Requests
```javascript
// Example: Fetch buyer dashboard data
const fetchBuyerDashboard = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/buyer/home', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data;
};
```

## Testing

### Run Role-Based Tests
```bash
npm run test-roles
```

This will test:
- Buyer and seller registration
- Role validation
- Login with role information
- Dashboard access control
- Cross-role access prevention

## Security Features

1. **Role Validation**: Only "buyer" and "seller" roles are accepted
2. **JWT with Role**: Tokens include user role information
3. **Route Protection**: Dashboards are protected by role-specific middleware
4. **Access Control**: Users cannot access dashboards for other roles
5. **Password Hashing**: All passwords are securely hashed with bcrypt

## Error Handling

The API returns consistent error responses for:
- Invalid role during registration
- Missing role during registration
- Unauthorized access to role-specific endpoints
- Invalid JWT tokens
- Expired tokens

## Database Schema

The users table now has:
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('buyer', 'seller') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Next Steps

1. Create your `.env` file with database credentials
2. Set up MySQL database
3. Start the server
4. Test with the provided test script
5. Integrate with your frontend application
