# Manual Testing Guide for Eco_Finds API

## Prerequisites
- Server running on http://localhost:5000
- Use Postman, Insomnia, or browser for testing

## Test 1: Health Check
**GET** `http://localhost:5000/`

Expected Response:
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
    "seller": "/api/seller",
    "categories": "/api/categories",
    "search": "/api/search",
    "analytics": "/api/analytics"
  }
}
```

## Test 2: Register a Seller
**POST** `http://localhost:5000/api/auth/register`

Headers:
```
Content-Type: application/json
```

Body:
```json
{
  "name": "Test Seller",
  "email": "seller@test.com",
  "password": "password123",
  "role": "seller"
}
```

Expected Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "Test Seller",
    "email": "seller@test.com",
    "role": "seller"
  }
}
```

## Test 3: Create a Product
**POST** `http://localhost:5000/api/products`

Headers:
```
Content-Type: application/json
Authorization: Bearer YOUR_SELLER_TOKEN_FROM_STEP_2
```

Body:
```json
{
  "title": "Eco-Friendly Water Bottle",
  "description": "Reusable stainless steel water bottle",
  "category": "Home & Garden",
  "price": 25.99,
  "stock_quantity": 50,
  "product_condition": "new"
}
```

## Test 4: Get All Products
**GET** `http://localhost:5000/api/products`

Should return your created product.

## Test 5: Register a Buyer
**POST** `http://localhost:5000/api/auth/register`

Body:
```json
{
  "name": "Test Buyer",
  "email": "buyer@test.com",
  "password": "password123",
  "role": "buyer"
}
```

## Test 6: Search Products
**GET** `http://localhost:5000/api/search?q=water&category=Home & Garden`

Should return search results.

## Test 7: Buyer Dashboard
**GET** `http://localhost:5000/api/buyer/home`

Headers:
```
Authorization: Bearer YOUR_BUYER_TOKEN
```

## Test 8: Seller Dashboard
**GET** `http://localhost:5000/api/seller/home`

Headers:
```
Authorization: Bearer YOUR_SELLER_TOKEN
```

## 🎯 What Each Test Verifies

1. **Health Check** - Server is running and responding
2. **User Registration** - Authentication system works
3. **Product Creation** - CRUD operations work
4. **Product Retrieval** - Database queries work
5. **Role-based Access** - JWT authentication works
6. **Search Functionality** - Advanced search works
7. **Dashboard Access** - Role-based endpoints work

If all these tests pass, your backend is fully functional!
