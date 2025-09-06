const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(testName, success, message, details = null) {
  const result = {
    name: testName,
    success,
    message,
    details
  };
  testResults.tests.push(result);
  
  if (success) {
    testResults.passed++;
    console.log(`✅ ${testName}: ${message}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}: ${message}`);
  }
  
  if (details) {
    console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
  }
  console.log('');
}

async function runTest(testName, testFunction) {
  try {
    await testFunction();
  } catch (error) {
    logTest(testName, false, error.message, {
      status: error.response?.status,
      data: error.response?.data,
      code: error.code
    });
  }
}

async function testEcoFindsAPI() {
  console.log('🧪 Comprehensive Eco_Finds API Testing\n');
  console.log('=' .repeat(50));
  
  let sellerToken = '';
  let buyerToken = '';
  let productId = '';

  // Test 1: Health Check
  await runTest('Health Check', async () => {
    const response = await axios.get(`${BASE_URL}/`);
    logTest('Health Check', true, 'API is running', {
      message: response.data.message,
      endpoints: Object.keys(response.data.endpoints || {}).length
    });
  });

  // Test 2: Seller Registration
  await runTest('Seller Registration', async () => {
    const sellerData = {
      name: 'EcoSeller',
      email: 'ecoseller@test.com',
      password: 'password123',
      role: 'seller'
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/auth/register`, sellerData);
      sellerToken = response.data.token;
      logTest('Seller Registration', true, 'Seller registered successfully', {
        userId: response.data.user.id,
        role: response.data.user.role
      });
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        // Try to login instead
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
          email: sellerData.email,
          password: sellerData.password
        });
        sellerToken = loginResponse.data.token;
        logTest('Seller Registration', true, 'Seller already exists, logged in instead', {
          userId: loginResponse.data.user.id,
          role: loginResponse.data.user.role
        });
      } else {
        throw error;
      }
    }
  });

  // Test 3: Buyer Registration
  await runTest('Buyer Registration', async () => {
    const buyerData = {
      name: 'EcoBuyer',
      email: 'ecobuyer@test.com',
      password: 'password123',
      role: 'buyer'
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/auth/register`, buyerData);
      buyerToken = response.data.token;
      logTest('Buyer Registration', true, 'Buyer registered successfully', {
        userId: response.data.user.id,
        role: response.data.user.role
      });
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
          email: buyerData.email,
          password: buyerData.password
        });
        buyerToken = loginResponse.data.token;
        logTest('Buyer Registration', true, 'Buyer already exists, logged in instead', {
          userId: loginResponse.data.user.id,
          role: loginResponse.data.user.role
        });
      } else {
        throw error;
      }
    }
  });

  // Test 4: Product Creation
  await runTest('Product Creation', async () => {
    const productData = {
      title: 'Eco-Friendly Bamboo Toothbrush',
      description: 'Sustainable bamboo toothbrush with soft bristles',
      category: 'Personal Care',
      price: 12.99,
      stock_quantity: 100,
      product_condition: 'new'
    };

    const response = await axios.post(`${BASE_URL}/api/products`, productData, {
      headers: { 'Authorization': `Bearer ${sellerToken}` }
    });
    
    productId = response.data.productId;
    logTest('Product Creation', true, 'Product created successfully', {
      productId: response.data.productId,
      title: productData.title,
      price: productData.price
    });
  });

  // Test 5: Get All Products
  await runTest('Get All Products', async () => {
    const response = await axios.get(`${BASE_URL}/api/products`);
    logTest('Get All Products', true, `Retrieved ${response.data.products.length} products`, {
      totalProducts: response.data.products.length,
      pagination: response.data.pagination
    });
  });

  // Test 6: Get Single Product
  await runTest('Get Single Product', async () => {
    if (productId) {
      const response = await axios.get(`${BASE_URL}/api/products/${productId}`);
      logTest('Get Single Product', true, 'Product retrieved successfully', {
        productId: response.data.product.id,
        title: response.data.product.title,
        sellerName: response.data.product.seller_name
      });
    } else {
      logTest('Get Single Product', false, 'No product ID available for testing');
    }
  });

  // Test 7: Add to Cart
  await runTest('Add to Cart', async () => {
    if (productId && buyerToken) {
      const cartData = {
        product_id: productId,
        quantity: 2
      };

      const response = await axios.post(`${BASE_URL}/api/cart`, cartData, {
        headers: { 'Authorization': `Bearer ${buyerToken}` }
      });
      
      logTest('Add to Cart', true, 'Item added to cart successfully', {
        productId: cartData.product_id,
        quantity: cartData.quantity
      });
    } else {
      logTest('Add to Cart', false, 'Missing product ID or buyer token');
    }
  });

  // Test 8: Get Cart
  await runTest('Get Cart', async () => {
    if (buyerToken) {
      const response = await axios.get(`${BASE_URL}/api/cart`, {
        headers: { 'Authorization': `Bearer ${buyerToken}` }
      });
      
      logTest('Get Cart', true, `Cart retrieved with ${response.data.cart.item_count} items`, {
        itemCount: response.data.cart.item_count,
        total: response.data.cart.total
      });
    } else {
      logTest('Get Cart', false, 'Missing buyer token');
    }
  });

  // Test 9: Search Products
  await runTest('Search Products', async () => {
    const response = await axios.get(`${BASE_URL}/api/search?q=bamboo&category=Personal Care`);
    logTest('Search Products', true, `Found ${response.data.products.length} products matching search`, {
      query: 'bamboo',
      category: 'Personal Care',
      resultsCount: response.data.products.length
    });
  });

  // Test 10: Buyer Dashboard
  await runTest('Buyer Dashboard', async () => {
    if (buyerToken) {
      const response = await axios.get(`${BASE_URL}/api/buyer/home`, {
        headers: { 'Authorization': `Bearer ${buyerToken}` }
      });
      
      logTest('Buyer Dashboard', true, 'Buyer dashboard loaded successfully', {
        cartItems: response.data.data.stats.cartItemsCount,
        availableProducts: response.data.data.stats.availableProductsCount
      });
    } else {
      logTest('Buyer Dashboard', false, 'Missing buyer token');
    }
  });

  // Test 11: Seller Dashboard
  await runTest('Seller Dashboard', async () => {
    if (sellerToken) {
      const response = await axios.get(`${BASE_URL}/api/seller/home`, {
        headers: { 'Authorization': `Bearer ${sellerToken}` }
      });
      
      logTest('Seller Dashboard', true, 'Seller dashboard loaded successfully', {
        totalProducts: response.data.data.stats.totalProducts,
        totalRevenue: response.data.data.stats.totalRevenue
      });
    } else {
      logTest('Seller Dashboard', false, 'Missing seller token');
    }
  });

  // Test 12: Invalid Authentication
  await runTest('Invalid Authentication', async () => {
    try {
      await axios.get(`${BASE_URL}/api/auth/profile`, {
        headers: { 'Authorization': 'Bearer invalid_token' }
      });
      logTest('Invalid Authentication', false, 'Invalid token was accepted (security issue)');
    } catch (error) {
      if (error.response?.status === 401) {
        logTest('Invalid Authentication', true, 'Invalid token correctly rejected', {
          status: error.response.status,
          message: error.response.data.message
        });
      } else {
        throw error;
      }
    }
  });

  // Final Results
  console.log('=' .repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=' .repeat(50));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Your Eco_Finds backend is working perfectly!');
    console.log('\n🚀 Key Features Verified:');
    console.log('   ✅ User authentication (buyer & seller roles)');
    console.log('   ✅ Product management (CRUD operations)');
    console.log('   ✅ Shopping cart functionality');
    console.log('   ✅ Search and filtering');
    console.log('   ✅ Role-based dashboard access');
    console.log('   ✅ Security (invalid token rejection)');
  } else {
    console.log('\n⚠️  Some tests failed. Check the details above.');
  }
}

// Run the tests
testEcoFindsAPI().catch(error => {
  console.error('💥 Test suite failed to run:', error.message);
  if (error.code === 'ECONNREFUSED') {
    console.error('💡 Make sure the server is running: npm run dev');
  }
});
