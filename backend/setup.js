#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🌱 Eco_Finds Backend Setup Script');
console.log('==================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file...');
    
    const envContent = `# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=eco_finds

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production_${Date.now()}
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
    console.log('⚠️  Please update the database password in .env file if needed\n');
} else {
    console.log('✅ .env file already exists\n');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Installing dependencies...');
    console.log('Run: npm install\n');
} else {
    console.log('✅ Dependencies already installed\n');
}

console.log('🚀 Setup Instructions:');
console.log('=====================');
console.log('1. Make sure MySQL is running on your system');
console.log('2. Create a database named "eco_finds" in MySQL');
console.log('3. Update the .env file with your MySQL credentials');
console.log('4. Run: npm install (if not already done)');
console.log('5. Run: npm run dev (for development) or npm start (for production)');
console.log('\n📚 The application will automatically create all necessary tables when it starts!');
console.log('\n🔗 API will be available at: http://localhost:5000');
console.log('📖 Check README.md for detailed API documentation');
console.log('\n✨ Happy coding with Eco_Finds!');
