// Shared test utilities for REST vs GraphQL API testing

// Console logging helper for API visualization
function logAPICall(apiType, operation, request, response) {
  console.log(`\n🔵 ${apiType} API - ${operation}`);
  console.log('📤 Request:', JSON.stringify(request, null, 2));
  console.log('📥 Response:', JSON.stringify(response, null, 2));
  console.log('─'.repeat(80));
}

// Console logging helper that bypasses Jest's console suppression
function logAPICallForced(apiType, operation, request, response) {
  // Use process.stdout.write to bypass Jest's console suppression
  process.stdout.write(`\n🔵 ${apiType} API - ${operation}\n`);
  process.stdout.write(`📤 Request: ${JSON.stringify(request, null, 2)}\n`);
  process.stdout.write(`📥 Response: ${JSON.stringify(response, null, 2)}\n`);
  process.stdout.write(`${'─'.repeat(80)}\n`);
}

// Helper function to compare responses and log differences
function compareResponses(restResponse, graphqlResponse, operationName) {
  console.log(`\n🔍 DETAILED COMPARISON: ${operationName}`);
  console.log('=' .repeat(60));
  
  console.log('📊 REST API Response:');
  console.log(JSON.stringify(restResponse, null, 2));
  
  console.log('\n📊 GraphQL API Response:');
  console.log(JSON.stringify(graphqlResponse, null, 2));
  
  console.log('\n⚖️  DIFFERENCES ANALYSIS:');
  
  // Compare ID types
  if (restResponse?.id && graphqlResponse?.id) {
    const restIdType = typeof restResponse.id;
    const graphqlIdType = typeof graphqlResponse.id;
    if (restIdType !== graphqlIdType) {
      console.log(`❌ ID Type Difference (UNAVOIDABLE - Platform Constraint):`);
      console.log(`   REST: ${restIdType} (${restResponse.id}) - MySQL auto-increment`);
      console.log(`   GraphQL: ${graphqlIdType} (${graphqlResponse.id}) - MongoDB ObjectId`);
    } else {
      console.log(`✅ ID Types match: both ${restIdType}`);
    }
  }
  
  // Compare structure
  const restKeys = Object.keys(restResponse || {});
  const graphqlKeys = Object.keys(graphqlResponse || {});
  
  const onlyInRest = restKeys.filter(key => !graphqlKeys.includes(key));
  const onlyInGraphql = graphqlKeys.filter(key => !restKeys.includes(key));
  
  if (onlyInRest.length > 0) {
    console.log(`❌ Fields only in REST: ${onlyInRest.join(', ')}`);
    console.log(`   NOTE: These differences may be due to platform constraints`);
  }
  
  if (onlyInGraphql.length > 0) {
    console.log(`❌ Fields only in GraphQL: ${onlyInGraphql.join(', ')}`);
    console.log(`   NOTE: These differences may be due to platform constraints`);
  }
  
  // Compare common fields
  const commonKeys = restKeys.filter(key => graphqlKeys.includes(key));
  let hasFieldDifferences = false;
  
  commonKeys.forEach(key => {
    if (key === 'id') return; // Already handled above
    
    const restValue = restResponse[key];
    const graphqlValue = graphqlResponse[key];
    
    if (JSON.stringify(restValue) !== JSON.stringify(graphqlValue)) {
      if (!hasFieldDifferences) {
        console.log(`❌ Field Value Differences:`);
        hasFieldDifferences = true;
      }
      console.log(`   ${key}: REST="${restValue}" vs GraphQL="${graphqlValue}"`);
    }
  });
  
  if (onlyInRest.length === 0 && onlyInGraphql.length === 0 && !hasFieldDifferences) {
    console.log(`✅ Structure and values match perfectly (except ID type - platform constraint)`);
  }
  
  console.log('=' .repeat(60));
}

// Helper function to compare array responses
function compareArrayResponses(restArray, graphqlArray, operationName) {
  console.log(`\n🔍 DETAILED ARRAY COMPARISON: ${operationName}`);
  console.log('=' .repeat(60));
  
  console.log(`📊 REST API Response (${restArray.length} items):`);
  if (restArray.length > 0) {
    console.log('First item:', JSON.stringify(restArray[0], null, 2));
  }
  
  console.log(`\n📊 GraphQL API Response (${graphqlArray.length} items):`);
  if (graphqlArray.length > 0) {
    console.log('First item:', JSON.stringify(graphqlArray[0], null, 2));
  }
  
  console.log('\n⚖️  ARRAY DIFFERENCES ANALYSIS:');
  
  if (restArray.length !== graphqlArray.length) {
    console.log(`❌ Array Length Difference (EXPECTED - Different databases):`);
    console.log(`   REST: ${restArray.length} items (MySQL database)`);
    console.log(`   GraphQL: ${graphqlArray.length} items (MongoDB database)`);
  } else {
    console.log(`✅ Array lengths match: ${restArray.length} items`);
  }
  
  // Compare structure of first items if both exist
  if (restArray.length > 0 && graphqlArray.length > 0) {
    console.log('\n🔍 Comparing first item structure:');
    compareResponses(restArray[0], graphqlArray[0], `${operationName} - First Item`);
  }
  
  console.log('=' .repeat(60));
}

// Helper functions to normalize data for comparison
function normalizeUser(user) {
  return {
    id: user.id?.toString(),
    username: user.username,
    // REST API doesn't return email field, only username (which is email)
    email: user.email || user.username,
    // Ignore timestamps for comparison as they might differ slightly
  };
}

function normalizeTask(task) {
  return {
    id: task.id?.toString(),
    title: task.title,
    description: task.description,
    status: task.status,
    userId: task.userId?.toString() || task.user_id?.toString()
  };
}

function normalizeTaskArray(tasks) {
  return tasks.map(normalizeTask).sort((a, b) => a.title.localeCompare(b.title));
}

// Helper function for safe deletion with logging
const safeDelete = async (deleteFunction, description, data) => {
  try {
    console.log(`🗑️  Deleting ${description}:`, data);
    const result = await deleteFunction();
    console.log(`✅ Successfully deleted ${description}`);
    return result;
  } catch (error) {
    console.log(`⚠️  Failed to delete ${description}:`, error.message);
    return false;
  }
};

// Helper function for re-authentication during cleanup
const reAuthenticate = async (apiClient, user, password, apiType, purpose = 'cleanup') => {
  try {
    const loginResult = await apiClient.login(user.email, password);
    logAPICall(apiType, `Re-authentication for ${purpose}`, { email: user.email }, { token: '***', success: true });
    return loginResult.token;
  } catch (error) {
    console.log(`⚠️  ${apiType} re-authentication failed for ${purpose}:`, error.message);
    return null;
  }
};

module.exports = {
  logAPICall,
  logAPICallForced,
  compareResponses,
  compareArrayResponses,
  normalizeUser,
  normalizeTask,
  normalizeTaskArray,
  safeDelete,
  reAuthenticate
};
