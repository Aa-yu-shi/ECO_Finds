# EcoFinds Dashboard API Documentation

## Overview
This document describes the complete backend API for the EcoFinds dashboard system. The API supports both buyer and seller dashboards with full e-commerce functionality.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### 1. Authentication (`/api/auth`)

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "buyer" // or "seller"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### 2. Products (`/api/products`)

#### Get All Products (Public)
```http
GET /api/products?category=Electronics&search=laptop&page=1&limit=12
```

#### Get Product by ID (Public)
```http
GET /api/products/123
```

#### Create Product (Seller Only)
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Vintage Leather Jacket",
  "description": "Beautiful vintage leather jacket",
  "category": "Clothing",
  "price": 89.99,
  "image": "https://example.com/jacket.jpg",
  "stock_quantity": 1
}
```

#### Get User's Products (Seller Only)
```http
GET /api/products/user/my-products
Authorization: Bearer <token>
```

#### Update Product (Seller Only)
```http
PUT /api/products/123
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Product Title",
  "price": 99.99,
  "stock_quantity": 5
}
```

#### Delete Product (Seller Only)
```http
DELETE /api/products/123
Authorization: Bearer <token>
```

### 3. Categories (`/api/categories`)

#### Get All Categories
```http
GET /api/categories
```

#### Get Products by Category
```http
GET /api/categories/Clothing?page=1&limit=12&sort=newest&min_price=10&max_price=100
```

#### Get Category Statistics
```http
GET /api/categories/stats/overview
```

### 4. Search (`/api/search`)

#### Search Products
```http
GET /api/search?q=laptop&category=Electronics&min_price=100&max_price=1000&sort=price_low&page=1&limit=12
```

#### Get Search Suggestions
```http
GET /api/search/suggestions?q=leat
```

#### Get Popular Searches
```http
GET /api/search/popular
```

### 5. Dashboards

#### Buyer Dashboard
```http
GET /api/buyer/home
Authorization: Bearer <token>
```

**Response includes:**
- User information
- Recent purchases
- Cart items
- Available products
- Purchase statistics

#### Seller Dashboard
```http
GET /api/seller/home
Authorization: Bearer <token>
```

**Response includes:**
- User information
- Seller's products
- Recent sales
- Pending orders
- Sales statistics

### 6. Analytics (`/api/analytics`)

#### Seller Analytics
```http
GET /api/analytics/seller?period=30
Authorization: Bearer <token>
```

**Response includes:**
- Sales overview (orders, revenue, items sold)
- Sales by category
- Daily sales chart data
- Top selling products
- Inventory status

#### Buyer Analytics
```http
GET /api/analytics/buyer?period=30
Authorization: Bearer <token>
```

**Response includes:**
- Purchase overview
- Purchases by category
- Recent purchases
- Cart summary

#### Platform Analytics (Admin Only)
```http
GET /api/analytics/platform?period=30
Authorization: Bearer <token>
```

### 7. Cart (`/api/cart`)

#### Get Cart Items
```http
GET /api/cart
Authorization: Bearer <token>
```

#### Add to Cart
```http
POST /api/cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "product_id": 123,
  "quantity": 2
}
```

#### Update Cart Item
```http
PUT /api/cart/123
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}
```

#### Remove from Cart
```http
DELETE /api/cart/123
Authorization: Bearer <token>
```

### 8. Purchases (`/api/purchases`)

#### Get Purchase History
```http
GET /api/purchases
Authorization: Bearer <token>
```

#### Create Purchase
```http
POST /api/purchases
Authorization: Bearer <token>
Content-Type: application/json

{
  "product_id": 123,
  "quantity": 1
}
```

#### Update Purchase Status (Seller Only)
```http
PUT /api/purchases/123
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed"
}
```

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

## Query Parameters

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Filtering
- `category`: Filter by product category
- `min_price`: Minimum price filter
- `max_price`: Maximum price filter
- `search` or `q`: Search query
- `sort`: Sort order (newest, oldest, price_low, price_high, relevance)

### Analytics
- `period`: Time period in days (default: 30)

## Categories

The system supports these main categories:
- **Clothing**: Apparel, accessories, shoes
- **Furniture**: Tables, chairs, sofas, storage
- **Electronics**: Laptops, phones, gadgets, accessories
- **Books**: Fiction, non-fiction, textbooks, magazines

## Error Codes

- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

## Testing

Run the comprehensive dashboard test:
```bash
npm run test-dashboard
```

This will test all endpoints and create sample data for development.

## Frontend Integration

The API is designed to support all dashboard features shown in the UI:

1. **Category Browsing**: Use `/api/categories` endpoints
2. **Product Search**: Use `/api/search` endpoints
3. **Product Management**: Use `/api/products` endpoints
4. **Dashboard Data**: Use `/api/buyer/home` and `/api/seller/home`
5. **Analytics**: Use `/api/analytics` endpoints
6. **Shopping Cart**: Use `/api/cart` endpoints
7. **Purchase History**: Use `/api/purchases` endpoints

All endpoints are ready for frontend integration and will provide real-time data for the dashboard components.
