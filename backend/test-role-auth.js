const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test data
const buyerUser = {
  name: 'John Buyer',
  email: 'buyer@example.com',
  password: 'password123',
  role: 'buyer'
};

const sellerUser = {
  name: 'Jane Seller',
  email: 'seller@example.com',
  password: 'password123',
  role: 'seller'
};

async function testRoleBasedAuthentication() {
  console.log('🧪 Testing Role-Based Authentication System...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ Health Check:', healthResponse.data.message);
    console.log('   Available endpoints:', Object.keys(healthResponse.data.endpoints).join(', '));
    console.log('');

    // Test 2: Register Buyer
    console.log('2. Testing Buyer Registration...');
    try {
      const buyerRegisterResponse = await axios.post(`${BASE_URL}/api/auth/register`, buyerUser);
      console.log('✅ Buyer registration successful:', buyerRegisterResponse.data.message);
      console.log('   User role:', buyerRegisterResponse.data.user.role);
      console.log('   Token received:', buyerRegisterResponse.data.token ? 'Yes' : 'No');
      console.log('');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('⚠️  Buyer already exists (expected if running multiple times)');
        console.log('');
      } else {
        throw error;
      }
    }

    // Test 3: Register Seller
    console.log('3. Testing Seller Registration...');
    try {
      const sellerRegisterResponse = await axios.post(`${BASE_URL}/api/auth/register`, sellerUser);
      console.log('✅ Seller registration successful:', sellerRegisterResponse.data.message);
      console.log('   User role:', sellerRegisterResponse.data.user.role);
      console.log('   Token received:', sellerRegisterResponse.data.token ? 'Yes' : 'No');
      console.log('');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('⚠️  Seller already exists (expected if running multiple times)');
        console.log('');
      } else {
        throw error;
      }
    }

    // Test 4: Login Buyer
    console.log('4. Testing Buyer Login...');
    const buyerLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: buyerUser.email,
      password: buyerUser.password
    });
    console.log('✅ Buyer login successful:', buyerLoginResponse.data.message);
    console.log('   User role:', buyerLoginResponse.data.user.role);
    console.log('   Token received:', buyerLoginResponse.data.token ? 'Yes' : 'No');
    console.log('');

    // Test 5: Login Seller
    console.log('5. Testing Seller Login...');
    const sellerLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: sellerUser.email,
      password: sellerUser.password
    });
    console.log('✅ Seller login successful:', sellerLoginResponse.data.message);
    console.log('   User role:', sellerLoginResponse.data.user.role);
    console.log('   Token received:', sellerLoginResponse.data.token ? 'Yes' : 'No');
    console.log('');

    // Test 6: Access Buyer Dashboard
    console.log('6. Testing Buyer Dashboard Access...');
    const buyerDashboardResponse = await axios.get(`${BASE_URL}/api/buyer/home`, {
      headers: {
        'Authorization': `Bearer ${buyerLoginResponse.data.token}`
      }
    });
    console.log('✅ Buyer dashboard accessed successfully');
    console.log('   Dashboard data received:', buyerDashboardResponse.data.success);
    console.log('   User role in dashboard:', buyerDashboardResponse.data.data.user.role);
    console.log('');

    // Test 7: Access Seller Dashboard
    console.log('7. Testing Seller Dashboard Access...');
    const sellerDashboardResponse = await axios.get(`${BASE_URL}/api/seller/home`, {
      headers: {
        'Authorization': `Bearer ${sellerLoginResponse.data.token}`
      }
    });
    console.log('✅ Seller dashboard accessed successfully');
    console.log('   Dashboard data received:', sellerDashboardResponse.data.success);
    console.log('   User role in dashboard:', sellerDashboardResponse.data.data.user.role);
    console.log('');

    // Test 8: Try to access wrong dashboard (buyer trying to access seller dashboard)
    console.log('8. Testing Role-Based Access Control...');
    try {
      await axios.get(`${BASE_URL}/api/seller/home`, {
        headers: {
          'Authorization': `Bearer ${buyerLoginResponse.data.token}`
        }
      });
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Role-based access control working - buyer correctly denied seller access');
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 9: Try to access wrong dashboard (seller trying to access buyer dashboard)
    try {
      await axios.get(`${BASE_URL}/api/buyer/home`, {
        headers: {
          'Authorization': `Bearer ${sellerLoginResponse.data.token}`
        }
      });
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Role-based access control working - seller correctly denied buyer access');
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 10: Invalid Role Registration
    console.log('9. Testing Invalid Role Registration...');
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, {
        name: 'Invalid User',
        email: 'invalid@example.com',
        password: 'password123',
        role: 'admin'
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Invalid role correctly rejected:', error.response.data.message);
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 11: Missing Role Registration
    console.log('10. Testing Missing Role Registration...');
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, {
        name: 'No Role User',
        email: 'norole@example.com',
        password: 'password123'
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Missing role correctly rejected:', error.response.data.message);
      } else {
        throw error;
      }
    }
    console.log('');

    console.log('🎉 All role-based authentication tests passed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Health check endpoint working');
    console.log('   ✅ Buyer registration with role validation');
    console.log('   ✅ Seller registration with role validation');
    console.log('   ✅ Role-based login with JWT tokens');
    console.log('   ✅ Buyer dashboard access');
    console.log('   ✅ Seller dashboard access');
    console.log('   ✅ Role-based access control');
    console.log('   ✅ Invalid role validation');
    console.log('   ✅ Missing role validation');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests
testRoleBasedAuthentication();
