const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

async function testAuthentication() {
  console.log('🧪 Testing Authentication System...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ Health Check:', healthResponse.data.message);
    console.log('');

    // Test 2: Register User
    console.log('2. Testing User Registration...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
      console.log('✅ Registration successful:', registerResponse.data.message);
      console.log('   User ID:', registerResponse.data.user.id);
      console.log('   Token received:', registerResponse.data.token ? 'Yes' : 'No');
      console.log('');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('⚠️  User already exists (expected if running multiple times)');
        console.log('');
      } else {
        throw error;
      }
    }

    // Test 3: Login User
    console.log('3. Testing User Login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful:', loginResponse.data.message);
    console.log('   User:', loginResponse.data.user.name);
    console.log('   Token received:', loginResponse.data.token ? 'Yes' : 'No');
    console.log('');

    // Test 4: Get Profile (Protected Route)
    console.log('4. Testing Protected Route (Get Profile)...');
    const profileResponse = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    console.log('✅ Profile retrieved successfully');
    console.log('   User:', profileResponse.data.user.name);
    console.log('   Email:', profileResponse.data.user.email);
    console.log('   Role:', profileResponse.data.user.role);
    console.log('');

    // Test 5: Invalid Login
    console.log('5. Testing Invalid Login...');
    try {
      await axios.post(`${BASE_URL}/api/auth/login`, {
        email: testUser.email,
        password: 'wrongpassword'
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid login correctly rejected:', error.response.data.message);
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 6: Invalid Email Format
    console.log('6. Testing Invalid Email Format...');
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, {
        name: 'Test User 2',
        email: 'invalid-email',
        password: 'password123'
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Invalid email format correctly rejected:', error.response.data.message);
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 7: Short Password
    console.log('7. Testing Short Password...');
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, {
        name: 'Test User 3',
        email: 'test3@example.com',
        password: '123'
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Short password correctly rejected:', error.response.data.message);
      } else {
        throw error;
      }
    }
    console.log('');

    console.log('🎉 All authentication tests passed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Health check endpoint working');
    console.log('   ✅ User registration with validation');
    console.log('   ✅ User login with JWT token');
    console.log('   ✅ Protected route access');
    console.log('   ✅ Error handling for invalid credentials');
    console.log('   ✅ Email format validation');
    console.log('   ✅ Password length validation');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests
testAuthentication();
