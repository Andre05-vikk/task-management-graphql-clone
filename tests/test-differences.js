#!/usr/bin/env node

const { restAPI } = require('./rest-client');
const { graphqlAPI } = require('./graphql-client');
const { compareResponses } = require('./test-utils');

async function testDifferences() {
  console.log('🚀 TESTING REST vs GraphQL API DIFFERENCES');
  console.log('🎯 This test shows all unavoidable platform differences\n');

  try {
    // Test data
    const testUser = {
      email: `test-diff-${Date.now()}@example.com`,
      password: 'password123'
    };

    const testTask = {
      title: 'Difference Test Task',
      description: 'Testing API differences',
      status: 'pending'
    };

    console.log('📝 Test Data:');
    console.log('User:', testUser);
    console.log('Task:', testTask);

    // 1. User Creation
    console.log('\n\n1️⃣ USER CREATION TEST');
    const restUser = await restAPI.createUser(testUser);
    const graphqlUser = await graphqlAPI.createUser({
      ...testUser,
      email: `gql-${testUser.email}`
    });
    
    compareResponses(restUser, graphqlUser, 'User Creation');

    // 2. Authentication
    console.log('\n\n2️⃣ AUTHENTICATION TEST');
    const restLogin = await restAPI.login(testUser.email, testUser.password);
    const graphqlLogin = await graphqlAPI.login(`gql-${testUser.email}`, testUser.password);
    
    compareResponses(restLogin, graphqlLogin, 'Authentication');

    // 3. Task Creation
    console.log('\n\n3️⃣ TASK CREATION TEST');
    const restTask = await restAPI.createTask(testTask, restLogin.token);
    const graphqlTask = await graphqlAPI.createTask(testTask, graphqlLogin.token);
    
    compareResponses(restTask, graphqlTask, 'Task Creation');

    // 4. Task Retrieval
    console.log('\n\n4️⃣ TASK RETRIEVAL TEST');
    const restTasks = await restAPI.getTasks(restLogin.token);
    const graphqlTasks = await graphqlAPI.getTasks(graphqlLogin.token);
    
    console.log(`\n🔍 DETAILED ARRAY COMPARISON: Task Retrieval`);
    console.log('=' .repeat(60));
    console.log(`📊 REST API Response (${restTasks.length} items):`);
    if (restTasks.length > 0) {
      console.log('First item:', JSON.stringify(restTasks[0], null, 2));
    }
    console.log(`\n📊 GraphQL API Response (${graphqlTasks.length} items):`);
    if (graphqlTasks.length > 0) {
      console.log('First item:', JSON.stringify(graphqlTasks[0], null, 2));
    }
    
    if (restTasks.length > 0 && graphqlTasks.length > 0) {
      compareResponses(restTasks[0], graphqlTasks[0], 'Task Retrieval - First Item');
    }

    // Cleanup
    console.log('\n\n🧹 CLEANUP');
    try {
      await restAPI.deleteUser(restUser.id, restLogin.token);
      await graphqlAPI.deleteUser(graphqlUser.id, graphqlLogin.token);
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.log('⚠️ Cleanup error:', error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testDifferences().then(() => {
  console.log('\n🎉 Difference analysis completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
