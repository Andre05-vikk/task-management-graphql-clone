const { restAPI } = require('./rest-client');
const { graphqlAPI } = require('./graphql-client');

// Console logging helper for API visualization
function logAPICall(apiType, operation, request, response) {
  // Use process.stdout.write to bypass Jest's console suppression
  process.stdout.write(`\n🔵 ${apiType} API - ${operation}\n`);
  process.stdout.write(`📤 Request: ${JSON.stringify(request, null, 2)}\n`);
  process.stdout.write(`📥 Response: ${JSON.stringify(response, null, 2)}\n`);
  process.stdout.write(`${'─'.repeat(80)}\n`);
}

describe('Basic API Equivalence Tests', () => {
  const testEmail = `basictest${Date.now()}@example.com`;
  const testPassword = 'password123';
  
  let restToken, graphqlToken;
  let restUserId, graphqlUserId;

  describe('Core Functionality Equivalence', () => {
    test('User registration should work in both APIs', async () => {
      console.log('\n🚀 Testing User Registration Equivalence');
      
      // Test REST API user creation
      const restRequest = {
        email: testEmail,
        password: testPassword
      };
      const restUser = await restAPI.createUser(restRequest);
      logAPICall('REST', 'User Registration', restRequest, restUser);
      
      expect(restUser).toBeDefined();
      expect(restUser.username).toBe(testEmail);
      restUserId = restUser.id;

      // Test GraphQL API user creation
      const graphqlEmail = `graphql${Date.now()}@example.com`;
      const graphqlRequest = {
        email: graphqlEmail,
        password: testPassword
      };
      const graphqlUser = await graphqlAPI.createUser(graphqlRequest);
      logAPICall('GraphQL', 'User Registration', graphqlRequest, graphqlUser);
      
      expect(graphqlUser).toBeDefined();
      expect(graphqlUser.username).toBe(graphqlEmail);
      graphqlUserId = graphqlUser.id;

      // Both should have IDs (types may differ: REST=number, GraphQL=string)
      expect(restUser.id).toBeDefined();
      expect(graphqlUser.id).toBeDefined();
      expect(restUser.username).toBe(testEmail);
      expect(graphqlUser.username).toBe(graphqlEmail);
    });

    test('Authentication should work in both APIs', async () => {
      console.log('\n🚀 Testing Authentication Equivalence');
      
      // Test REST API login
      const restLoginRequest = { email: testEmail, password: testPassword };
      const restLogin = await restAPI.login(testEmail, testPassword);
      logAPICall('REST', 'User Authentication', restLoginRequest, restLogin);
      
      expect(restLogin.token).toBeDefined();
      expect(typeof restLogin.token).toBe('string');
      restToken = restLogin.token;

      // Test GraphQL API login
      const graphqlEmail = `graphql${Date.now()}@example.com`;
      await graphqlAPI.createUser({
        email: graphqlEmail,
        password: testPassword
      });
      
      const graphqlLoginRequest = { email: graphqlEmail, password: testPassword };
      const graphqlLogin = await graphqlAPI.login(graphqlEmail, testPassword);
      logAPICall('GraphQL', 'User Authentication', graphqlLoginRequest, graphqlLogin);
      
      expect(graphqlLogin.token).toBeDefined();
      expect(typeof graphqlLogin.token).toBe('string');
      expect(graphqlLogin.user).toBeDefined();
      graphqlToken = graphqlLogin.token;

      // Both should return valid tokens
      expect(restLogin.token.length).toBeGreaterThan(10);
      expect(graphqlLogin.token.length).toBeGreaterThan(10);
    });

    test('Task creation should work in both APIs', async () => {
      console.log('\n🚀 Testing Task Creation Equivalence');
      
      const taskData = {
        title: 'Basic Test Task',
        description: 'Testing task creation',
        status: 'pending'
      };

      // Test REST API task creation
      const restTask = await restAPI.createTask(taskData, restToken);
      logAPICall('REST', 'Task Creation', { taskData, token: '***' }, restTask);
      
      expect(restTask).toBeDefined();
      expect(restTask.title || restTask.title).toBe(taskData.title);

      // Test GraphQL API task creation
      const graphqlTask = await graphqlAPI.createTask(taskData, graphqlToken);
      logAPICall('GraphQL', 'Task Creation', { taskData, token: '***' }, graphqlTask);
      
      expect(graphqlTask).toBeDefined();
      expect(graphqlTask.title).toBe(taskData.title);
      expect(graphqlTask.status).toBe(taskData.status);

      // Both should create tasks successfully
      expect(restTask.success || restTask.id || restTask.taskId).toBeTruthy();
      expect(graphqlTask.id).toBeDefined();
    });

    test('Task retrieval should work in both APIs', async () => {
      console.log('\n🚀 Testing Task Retrieval Equivalence');
      
      // Test REST API task retrieval
      const restTasks = await restAPI.getTasks(restToken);
      logAPICall('REST', 'Task Retrieval', { token: '***' }, restTasks);
      
      expect(Array.isArray(restTasks)).toBe(true);

      // Test GraphQL API task retrieval
      const graphqlTasks = await graphqlAPI.getTasks(graphqlToken);
      logAPICall('GraphQL', 'Task Retrieval', { token: '***' }, graphqlTasks);
      
      expect(Array.isArray(graphqlTasks)).toBe(true);

      // Both should return task arrays
      // Note: Tasks might be different due to different users, but structure should be similar
      if (restTasks.length > 0) {
        expect(restTasks[0]).toHaveProperty('title');
      }

      if (graphqlTasks.length > 0) {
        expect(graphqlTasks[0]).toHaveProperty('title');
        expect(graphqlTasks[0]).toHaveProperty('status');
      }
    });



    test('User retrieval should work in both APIs', async () => {
      console.log('\n🚀 Testing User Retrieval Equivalence');
      
      // Test REST API user retrieval
      const restUsers = await restAPI.getUsers(restToken);
      logAPICall('REST', 'User Retrieval', { token: '***' }, restUsers);
      
      expect(Array.isArray(restUsers)).toBe(true);
      expect(restUsers.length).toBeGreaterThan(0);

      // Test GraphQL API user retrieval
      const graphqlUsers = await graphqlAPI.getUsers(graphqlToken);
      logAPICall('GraphQL', 'User Retrieval', { token: '***' }, graphqlUsers);
      
      expect(Array.isArray(graphqlUsers)).toBe(true);
      expect(graphqlUsers.length).toBeGreaterThan(0);

      // Both should return user arrays with similar structure
      expect(restUsers[0]).toHaveProperty('id');
      expect(restUsers[0]).toHaveProperty('username');
      expect(graphqlUsers[0]).toHaveProperty('id');
      expect(graphqlUsers[0]).toHaveProperty('username');
    });
  });

  describe('Error Handling Equivalence', () => {
    test('Invalid login should fail in both APIs', async () => {
      console.log('\n🚀 Testing Invalid Login Error Handling');
      
      const invalidEmail = 'nonexistent@example.com';
      const invalidPassword = 'wrongpassword';
      const invalidRequest = { email: invalidEmail, password: invalidPassword };

      // Test REST API error handling
      try {
        await restAPI.login(invalidEmail, invalidPassword);
      } catch (error) {
        logAPICall('REST', 'Invalid Login (Error)', invalidRequest, { error: error.message });
      }
      await expect(restAPI.login(invalidEmail, invalidPassword))
        .rejects.toThrow();

      // Test GraphQL API error handling
      try {
        await graphqlAPI.login(invalidEmail, invalidPassword);
      } catch (error) {
        logAPICall('GraphQL', 'Invalid Login (Error)', invalidRequest, { error: error.message });
      }
      await expect(graphqlAPI.login(invalidEmail, invalidPassword))
        .rejects.toThrow();
    });

    test('Duplicate user creation should fail in both APIs', async () => {
      console.log('\n🚀 Testing Duplicate User Creation Error Handling');
      
      // Create a unique email for this test
      const duplicateTestEmail = `duplicate${Date.now()}@example.com`;
      const userRequest = { email: duplicateTestEmail, password: testPassword };

      // First, create a user in REST API
      const firstUser = await restAPI.createUser(userRequest);
      logAPICall('REST', 'First User Creation', userRequest, firstUser);

      // Then try to create the same user again - should fail
      try {
        await restAPI.createUser(userRequest);
      } catch (error) {
        logAPICall('REST', 'Duplicate User Creation (Error)', userRequest, { error: error.message });
      }
      await expect(restAPI.createUser(userRequest)).rejects.toThrow();

      // Create a user in GraphQL API
      const graphqlDuplicateEmail = `gqlduplicate${Date.now()}@example.com`;
      const graphqlUserRequest = { email: graphqlDuplicateEmail, password: testPassword };
      
      const firstGraphQLUser = await graphqlAPI.createUser(graphqlUserRequest);
      logAPICall('GraphQL', 'First User Creation', graphqlUserRequest, firstGraphQLUser);

      // Try to create the same user again - should fail
      try {
        await graphqlAPI.createUser(graphqlUserRequest);
      } catch (error) {
        logAPICall('GraphQL', 'Duplicate User Creation (Error)', graphqlUserRequest, { error: error.message });
      }
      await expect(graphqlAPI.createUser(graphqlUserRequest)).rejects.toThrow();
    });

    test('Unauthorized access should fail in both APIs', async () => {
      console.log('\n🚀 Testing Unauthorized Access Error Handling');
      
      const invalidToken = 'invalid-token';
      const unauthorizedRequest = { token: invalidToken };

      // Test REST API unauthorized access
      try {
        await restAPI.getTasks(invalidToken);
      } catch (error) {
        logAPICall('REST', 'Unauthorized Access (Error)', unauthorizedRequest, { error: error.message });
      }
      await expect(restAPI.getTasks(invalidToken)).rejects.toThrow();

      // Test GraphQL API unauthorized access
      try {
        await graphqlAPI.getTasks(invalidToken);
      } catch (error) {
        logAPICall('GraphQL', 'Unauthorized Access (Error)', unauthorizedRequest, { error: error.message });
      }
      await expect(graphqlAPI.getTasks(invalidToken)).rejects.toThrow();
    });
  });

  afterAll(async () => {
    // Cleanup: try to delete created users
    try {
      if (restUserId && restToken) {
        await restAPI.deleteUser(restUserId, restToken);
      }
    } catch (error) {
      console.log('REST cleanup failed:', error.message);
    }

    try {
      if (graphqlUserId && graphqlToken) {
        await graphqlAPI.deleteUser(graphqlUserId, graphqlToken);
      }
    } catch (error) {
      console.log('GraphQL cleanup failed:', error.message);
    }
  });
});
