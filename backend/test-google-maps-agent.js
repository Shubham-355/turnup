/**
 * Test Google Maps Integration with AI Agent
 * 
 * Usage:
 * 1. Make sure your backend server is running
 * 2. Update the AUTH_TOKEN with a valid JWT token
 * 3. Run: node test-google-maps-agent.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const AUTH_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AUTH_TOKEN}`
  }
});

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

async function testGoogleMapsFeatures() {
  console.log('\n' + '='.repeat(60));
  log(colors.bright + colors.blue, '🗺️  AI Agent Google Maps Integration Test');
  console.log('='.repeat(60) + '\n');

  try {
    // Test 1: Get directions
    log(colors.yellow, '\n🚗 Test 1: Get Directions');
    console.log('-'.repeat(60));
    const directionsResponse = await api.post('/ai-agent/chat', {
      message: 'Give me directions from San Francisco to Los Angeles'
    });
    log(colors.green, '✅ Success!');
    log(colors.cyan, 'AI Response:', directionsResponse.data.data.message);

    await sleep(1000);

    // Test 2: Search for places
    log(colors.yellow, '\n📍 Test 2: Search for Places');
    console.log('-'.repeat(60));
    const placesResponse = await api.post('/ai-agent/chat', {
      message: 'Find me the best restaurants in Paris'
    });
    log(colors.green, '✅ Success!');
    log(colors.cyan, 'AI Response:', placesResponse.data.data.message);

    await sleep(1000);

    // Test 3: Create plan with directions
    log(colors.yellow, '\n🎯 Test 3: Create Trip with Route');
    console.log('-'.repeat(60));
    const tripWithRouteResponse = await api.post('/ai-agent/chat', {
      message: 'Create a road trip from New York to Boston and show me the route'
    });
    log(colors.green, '✅ Success!');
    log(colors.cyan, 'AI Response:', tripWithRouteResponse.data.data.message);

    await sleep(1000);

    // Test 4: Find activities with places
    log(colors.yellow, '\n🎪 Test 4: Find Activities Near Location');
    console.log('-'.repeat(60));
    const activitiesResponse = await api.post('/ai-agent/chat', {
      message: 'Find fun activities and attractions near Times Square, New York'
    });
    log(colors.green, '✅ Success!');
    log(colors.cyan, 'AI Response:', activitiesResponse.data.data.message);

    await sleep(1000);

    // Test 5: Walking directions
    log(colors.yellow, '\n🚶 Test 5: Walking Directions');
    console.log('-'.repeat(60));
    const walkingResponse = await api.post('/ai-agent/chat', {
      message: 'Show me walking directions from Eiffel Tower to Louvre Museum'
    });
    log(colors.green, '✅ Success!');
    log(colors.cyan, 'AI Response:', walkingResponse.data.data.message);

    // Summary
    console.log('\n' + '='.repeat(60));
    log(colors.bright + colors.green, '🎉 All Google Maps Tests Passed!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    log(colors.red, '\n❌ Test Failed!');
    console.error('Error:', error.response?.data || error.message);
    console.log('\n');
    
    if (error.response?.status === 401) {
      log(colors.yellow, '⚠️  Authentication failed. Please update AUTH_TOKEN with a valid JWT token.');
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run tests
if (AUTH_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
  log(colors.red, '\n❌ Error: Please update AUTH_TOKEN in the script with a valid JWT token\n');
  log(colors.cyan, 'Get a token by logging in first.');
  process.exit(1);
}

testGoogleMapsFeatures();
