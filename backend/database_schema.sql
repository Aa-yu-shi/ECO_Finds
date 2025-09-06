-- Eco_Finds Database Schema
-- This file contains the complete database schema for the Eco_Finds application

-- Create database (run this first)
CREATE DATABASE IF NOT EXISTS eco_finds;
USE eco_finds;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(500),
    stock_quantity INT DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_category (category),
    INDEX idx_price (price),
    INDEX idx_available (is_available)
);

-- Cart table
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_purchase_date (purchase_date)
);

-- Insert sample data (optional - for testing)
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@ecofinds.com', '$2b$10$example_hashed_password', 'admin'),
('john_doe', 'john@example.com', '$2b$10$example_hashed_password', 'user'),
('jane_smith', 'jane@example.com', '$2b$10$example_hashed_password', 'user');

-- Insert sample products (optional - for testing)
INSERT INTO products (user_id, title, description, category, price, image, stock_quantity) VALUES 
(2, 'Vintage Wooden Chair', 'Beautiful vintage wooden chair, perfect for eco-friendly home decor', 'Furniture', 75.00, 'https://example.com/chair.jpg', 5),
(3, 'Organic Cotton Tote Bag', 'Handmade organic cotton tote bag, perfect for shopping', 'Accessories', 25.00, 'https://example.com/tote.jpg', 10),
(2, 'Bamboo Kitchen Set', 'Sustainable bamboo kitchen utensils set', 'Kitchen', 45.00, 'https://example.com/bamboo.jpg', 8),
(3, 'Recycled Glass Vase', 'Beautiful vase made from recycled glass', 'Home Decor', 35.00, 'https://example.com/vase.jpg', 3);

-- Create indexes for better performance
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_cart_user_id ON cart(user_id);
CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_purchases_product_id ON purchases(product_id);
