# Eco_Finds Backend API

A Node.js backend API built with Express and MySQL for user authentication and e-commerce functionality.

## Features

- User registration and login with JWT authentication
- Role-based authentication (buyer/seller)
- Password hashing using bcrypt
- Email validation with regex
- Role validation during registration
- Role-based dashboard access
- CORS support for frontend integration
- MySQL database integration
- Comprehensive error handling

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory with the following variables:

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

### 3. Database Setup

1. Create a MySQL database named `eco_finds`
2. The application will automatically create the required tables on startup

### 4. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

#### Register User
- **POST** `/api/auth/register`
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "buyer"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer"
  }
}
```

#### Login User
- **POST** `/api/auth/login`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Get User Profile
- **GET** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Role-Based Dashboards

#### Buyer Dashboard
- **GET** `/api/buyer/home`
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Access:** Buyers only
- **Response:**
```json
{
  "success": true,
  "message": "Buyer dashboard data retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Buyer",
      "email": "buyer@example.com",
      "role": "buyer"
    },
    "recentPurchases": [...],
    "cartItems": [...],
    "availableProducts": [...],
    "stats": {
      "totalPurchases": 5,
      "cartItemsCount": 3,
      "availableProductsCount": 20
    }
  }
}
```

#### Seller Dashboard
- **GET** `/api/seller/home`
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Access:** Sellers only
- **Response:**
```json
{
  "success": true,
  "message": "Seller dashboard data retrieved successfully",
  "data": {
    "user": {
      "id": 2,
      "name": "Jane Seller",
      "email": "seller@example.com",
      "role": "seller"
    },
    "products": [...],
    "recentSales": [...],
    "pendingOrders": [...],
    "stats": {
      "totalProducts": 10,
      "totalOrders": 25,
      "totalRevenue": 1500.00,
      "totalItemsSold": 50,
      "pendingOrdersCount": 3
    }
  }
}
```

### Health Check
- **GET** `/`
- **Response:**
```json
{
  "success": true,
  "message": "Eco_Finds Backend API is running!",
  "version": "1.0.0",
    "endpoints": {
      "auth": "/api/auth",
      "products": "/api/products",
      "cart": "/api/cart",
      "purchases": "/api/purchases",
      "buyer": "/api/buyer",
      "seller": "/api/seller"
    }
}
```

## Validation Rules

### Registration
- **Name:** Required, will be stored as username in database
- **Email:** Required, must be valid email format (regex validation)
- **Password:** Required, minimum 6 characters
- **Role:** Required, must be either "buyer" or "seller"

### Login
- **Email:** Required, must be valid email format
- **Password:** Required

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common error scenarios:
- Invalid email format
- Password too short
- Duplicate email/name
- Invalid credentials
- Missing required fields
- Server errors

## Security Features

- Passwords are hashed using bcrypt with salt rounds of 10
- JWT tokens for authentication
- CORS protection
- Input validation and sanitization
- SQL injection protection using parameterized queries

## Dependencies

- **express:** Web framework
- **mysql2:** MySQL database driver
- **bcrypt:** Password hashing
- **jsonwebtoken:** JWT token generation
- **cors:** Cross-origin resource sharing
- **dotenv:** Environment variable management
- **nodemon:** Development auto-restart (dev dependency)