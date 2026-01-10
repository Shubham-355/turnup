/**
 * Test script for AI Agent functionality
 * 
 * Usage:
 * 1. Make sure your backend server is running
 * 2. Update the AUTH_TOKEN with a valid JWT token
 * 3. Run: node test-ai-agent.js
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

// Color codes for console output
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

async function testAIAgent() {
  console.log('\n' + '='.repeat(60));
  log(colors.bright + colors.blue, '🤖 AI Agent Test Suite');
  console.log('='.repeat(60) + '\n');

  try {
    // Test 1: Get available tools
    log(colors.yellow, '\n📋 Test 1: Get Available Tools');
    console.log('-'.repeat(60));
    const toolsResponse = await api.get('/ai-agent/tools');
    log(colors.green, `✅ Success! Found ${toolsResponse.data.data.tools.length} tools`);
    console.log('Sample tools:', toolsResponse.data.data.tools.slice(0, 3).map(t => t.name).join(', '));

    // Test 2: Create a plan
    log(colors.yellow, '\n🎯 Test 2: Create a Trip Plan');
    console.log('-'.repeat(60));
    const createPlanResponse = await api.post('/ai-agent/chat', {
      message: 'Create a 3-day trip to Paris starting next Friday'
    });
    log(colors.green, '✅ Success!');
    log(colors.cyan, 'AI Response:', createPlanResponse.data.data.message);
    console.log('Tools called:', createPlanResponse.data.data.toolCalls.map(t => t.name).join(', '));

    // Wait a bit
    await sleep(1000);

    // Test 3: Add activities
    log(colors.yellow, '\n🎪 Test 3: Add Activities');
    console.log('-'.repeat(60));
    const addActivitiesResponse = await api.post('/ai-agent/chat', {
      message: 'Add visiting Eiffel Tower and Louvre Museum as activities'
    });
    log(colors.green, '✅ Success!');
    log(colors.cyan, 'AI Response:', addActivitiesResponse.data.data.message);

    // Wait a bit
    await sleep(1000);

    // Test 4: List plans
    log(colors.yellow, '\n📝 Test 4: List User Plans');
    console.log('-'.repeat(60));
    const listPlansResponse = await api.post('/ai-agent/chat', {
      message: 'Show me all my plans'
    });
    log(colors.green, '✅ Success!');
    log(colors.cyan, 'AI Response:', listPlansResponse.data.data.message);

    // Wait a bit
    await sleep(1000);

    // Test 5: Add expense
    log(colors.yellow, '\n💰 Test 5: Add Expense');
    console.log('-'.repeat(60));
    const expenseResponse = await api.post('/ai-agent/chat', {
      message: 'Add a $50 dinner expense that we\'ll split equally'
    });
    log(colors.green, '✅ Success!');
    log(colors.cyan, 'AI Response:', expenseResponse.data.data.message);

    // Test 6: Get conversation history
    log(colors.yellow, '\n📜 Test 6: Get Conversation History');
    console.log('-'.repeat(60));
    const historyResponse = await api.get('/ai-agent/history');
    log(colors.green, `✅ Success! Found ${historyResponse.data.data.length} messages in history`);

    // Test 7: Natural language query
    log(colors.yellow, '\n💬 Test 7: Natural Conversation');
    console.log('-'.repeat(60));
    const naturalResponse = await api.post('/ai-agent/chat', {
      message: 'What activities do I have planned?'
    });
    log(colors.green, '✅ Success!');
    log(colors.cyan, 'AI Response:', naturalResponse.data.data.message);

    // Test 8: Reset conversation
    log(colors.yellow, '\n🔄 Test 8: Reset Conversation');
    console.log('-'.repeat(60));
    const resetResponse = await api.post('/ai-agent/reset');
    log(colors.green, '✅ Success!');
    console.log('Message:', resetResponse.data.data.message);

    // Summary
    console.log('\n' + '='.repeat(60));
    log(colors.bright + colors.green, '🎉 All Tests Passed!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    log(colors.red, '\n❌ Test Failed!');
    console.error('Error:', error.response?.data || error.message);
    console.log('\n');
    
    if (error.response?.status === 401) {
      log(colors.yellow, '⚠️  Authentication failed. Please update AUTH_TOKEN with a valid JWT token.');
      log(colors.cyan, 'You can get a token by logging in first:');
      console.log(`curl -X POST ${API_URL}/auth/login -H "Content-Type: application/json" -d '{"email":"your@email.com","password":"yourpassword"}'`);
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run tests
if (AUTH_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
  log(colors.red, '\n❌ Error: Please update AUTH_TOKEN in the script with a valid JWT token\n');
  log(colors.cyan, 'Steps to get a token:');
  console.log('1. Start your backend server: npm run dev');
  console.log('2. Login to get a token (or register if you don\'t have an account)');
  console.log(`3. curl -X POST ${API_URL}/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password"}'`);
  console.log('4. Copy the token from the response');
  console.log('5. Update AUTH_TOKEN in this file');
  console.log('6. Run this script again: node test-ai-agent.js\n');
  process.exit(1);
}

testAIAgent();
