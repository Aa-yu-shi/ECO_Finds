// // const express = require('express');
// // const cors = require('cors');
// // const mysql = require('mysql2/promise');
// // require('dotenv').config();

// // const app = express();
// // const port = process.env.PORT || 5000;

// // // Middleware
// // app.use(cors());
// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // // Database connection
// // const pool = mysql.createPool({
// //   host: process.env.DB_HOST,
// //   user: process.env.DB_USER,
// //   password: process.env.DB_PASS,
// //   database: process.env.DB_NAME,
// //   waitForConnections: true,
// //   connectionLimit: 10,
// //   queueLimit: 0
// // });

// // const testDatabase = async () => {
// //   try {
// //     const connection = await pool.getConnection();
// //     console.log('✅ Database connected successfully');
// //     connection.release();
// //   } catch (err) {
// //     console.error('❌ Database connection failed:', err);
// //     process.exit(1);
// //   }
// // };

// // // Base route
// // app.get('/', (req, res) => {
// //   res.json({ success: true, message: 'Backend is running and DB is connected' });
// // });

// // // 404 handler
// // app.use((req, res) => {
// //   res.status(404).json({ success: false, message: 'Route not found' });
// // });

// // // Global error handler
// // app.use((err, req, res, next) => {
// //   console.error(err);
// //   res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
// // });

// // // Start server
// // const startServer = async () => {
// //   await testDatabase();
// //   app.listen(port, () => {
// //     console.log(`🚀 Server running on http://localhost:${port}`);
// //   });
// // };

// // startServer();



// const express = require('express');
// const dotenv = require('dotenv');

// // Import your route files
// const authRoutes = require('./routes/authRoutes');
// const productRoutes = require('./routes/productRoutes');

// // Import your database configuration/connection file
// // Make sure the path matches where your db.js file is located (e.g., './config/db' or './db')
// const db = require('./config/db'); 

// // Load environment variables from your .env file
// dotenv.config();

// // Initialize the Express application
// const app = express();

// // --- Middleware ---
// // Built-in Express middleware to parse JSON request bodies
// app.use(express.json());

// // If you need to parse URL-encoded data (e.g., from HTML forms), add this:
// // app.use(express.urlencoded({ extended: true }));


// // --- Routes ---
// // Mount your authentication routes under /api/auth
// app.use('/api/auth', authRoutes);

// // Mount your product routes under /api/products
// app.use('/api/products', productRoutes);

// // Basic root route for testing if the API is running
// app.get('/', (req, res) => {
//   res.send('API is running successfully!');
// });


// // --- Server Start ---
// // Define the port for the server to listen on
// // It uses the PORT environment variable if set, otherwise defaults to 5000
// const PORT = process.env.PORT || 5000;

// // Start the server and listen for incoming requests
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
//   console.log('Press Ctrl+C to stop');
// });



// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const buyerRoutes = require('./routes/buyerRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const searchRoutes = require('./routes/searchRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Import database configuration
const { testConnection, initializeTables } = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Eco_Finds Backend API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      cart: '/api/cart',
      purchases: '/api/purchases',
      buyer: '/api/buyer',
      seller: '/api/seller',
      categories: '/api/categories',
      search: '/api/search',
      analytics: '/api/analytics'
    }
  });
});

// 404 handler (fixed)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Initialize database tables
    await initializeTables();

    // Start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Eco_Finds Backend Server running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
      console.log('✅ Server is ready to accept requests!');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();
