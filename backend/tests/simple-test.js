const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAPI() {
  console.log('🧪 Testing Eco_Finds API...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ Health Check Response:', healthResponse.data);
    console.log('');

    // Test 2: Register a seller
    console.log('2. Testing Seller Registration...');
    const sellerData = {
      name: 'Test Seller',
      email: 'seller@test.com',
      password: 'password123',
      role: 'seller'
    };

    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, sellerData);
      console.log('✅ Seller Registration:', registerResponse.data.message);
      console.log('   Token received:', registerResponse.data.token ? 'Yes' : 'No');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('⚠️  Seller already exists (expected if running multiple times)');
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 3: Login seller
    console.log('3. Testing Seller Login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: sellerData.email,
      password: sellerData.password
    });
    console.log('✅ Seller Login:', loginResponse.data.message);
    const sellerToken = loginResponse.data.token;
    console.log('');

    // Test 4: Create a product
    console.log('4. Testing Product Creation...');
    const productData = {
      title: 'Eco-Friendly Water Bottle',
      description: 'Reusable stainless steel water bottle',
      category: 'Home & Garden',
      price: 25.99,
      stock_quantity: 50,
      product_condition: 'new'
    };

    const productResponse = await axios.post(`${BASE_URL}/api/products`, productData, {
      headers: { 'Authorization': `Bearer ${sellerToken}` }
    });
    console.log('✅ Product Created:', productResponse.data.message);
    console.log('   Product ID:', productResponse.data.productId);
    console.log('');

    // Test 5: Get all products
    console.log('5. Testing Get All Products...');
    const productsResponse = await axios.get(`${BASE_URL}/api/products`);
    console.log('✅ Products Retrieved:', productsResponse.data.products.length, 'products found');
    console.log('');

    // Test 6: Register a buyer
    console.log('6. Testing Buyer Registration...');
    const buyerData = {
      name: 'Test Buyer',
      email: 'buyer@test.com',
      password: 'password123',
      role: 'buyer'
    };

    try {
      const buyerRegisterResponse = await axios.post(`${BASE_URL}/api/auth/register`, buyerData);
      console.log('✅ Buyer Registration:', buyerRegisterResponse.data.message);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('⚠️  Buyer already exists (expected if running multiple times)');
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 7: Login buyer
    console.log('7. Testing Buyer Login...');
    const buyerLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: buyerData.email,
      password: buyerData.password
    });
    console.log('✅ Buyer Login:', buyerLoginResponse.data.message);
    const buyerToken = buyerLoginResponse.data.token;
    console.log('');

    // Test 8: Test search functionality
    console.log('8. Testing Search Functionality...');
    const searchResponse = await axios.get(`${BASE_URL}/api/search?q=water&category=Home & Garden`);
    console.log('✅ Search Results:', searchResponse.data.products.length, 'products found');
    console.log('');

    // Test 9: Test buyer dashboard
    console.log('9. Testing Buyer Dashboard...');
    const buyerDashboardResponse = await axios.get(`${BASE_URL}/api/buyer/home`, {
      headers: { 'Authorization': `Bearer ${buyerToken}` }
    });
    console.log('✅ Buyer Dashboard:', buyerDashboardResponse.data.message);
    console.log('');

    // Test 10: Test seller dashboard
    console.log('10. Testing Seller Dashboard...');
    const sellerDashboardResponse = await axios.get(`${BASE_URL}/api/seller/home`, {
      headers: { 'Authorization': `Bearer ${sellerToken}` }
    });
    console.log('✅ Seller Dashboard:', sellerDashboardResponse.data.message);
    console.log('');

    console.log('🎉 All tests passed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Health check endpoint');
    console.log('   ✅ User registration (seller & buyer)');
    console.log('   ✅ User authentication');
    console.log('   ✅ Product creation');
    console.log('   ✅ Product retrieval');
    console.log('   ✅ Search functionality');
    console.log('   ✅ Role-based dashboard access');
    console.log('\n🚀 Your Eco_Finds backend is working perfectly!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure the server is running on http://localhost:5000');
    }
  }
}

testAPI();
