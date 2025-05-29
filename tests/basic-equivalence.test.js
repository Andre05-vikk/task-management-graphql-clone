const { restAPI } = require('./rest-client');
const { graphqlAPI } = require('./graphql-client');

describe('Basic API Equivalence Tests', () => {
  const testEmail = `basictest${Date.now()}@example.com`;
  const testPassword = 'password123';
  
  let restToken, graphqlToken;
  let restUserId, graphqlUserId;

  describe('Core Functionality Equivalence', () => {
    test('User registration should work in both APIs', async () => {
      // Test REST API user creation
      const restUser = await restAPI.createUser({
        email: testEmail,
        password: testPassword
      });
      
      expect(restUser).toBeDefined();
      expect(restUser.username).toBe(testEmail);
      restUserId = restUser.id;

      // Test GraphQL API user creation
      const graphqlEmail = `graphql${Date.now()}@example.com`;
      const graphqlUser = await graphqlAPI.createUser({
        email: graphqlEmail,
        password: testPassword
      });
      
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
      // Test REST API login
      const restLogin = await restAPI.login(testEmail, testPassword);
      expect(restLogin.token).toBeDefined();
      expect(typeof restLogin.token).toBe('string');
      restToken = restLogin.token;

      // Test GraphQL API login
      const graphqlEmail = `graphql${Date.now()}@example.com`;
      await graphqlAPI.createUser({
        email: graphqlEmail,
        password: testPassword
      });
      
      const graphqlLogin = await graphqlAPI.login(graphqlEmail, testPassword);
      expect(graphqlLogin.token).toBeDefined();
      expect(typeof graphqlLogin.token).toBe('string');
      expect(graphqlLogin.user).toBeDefined();
      graphqlToken = graphqlLogin.token;

      // Both should return valid tokens
      expect(restLogin.token.length).toBeGreaterThan(10);
      expect(graphqlLogin.token.length).toBeGreaterThan(10);
    });

    test('Task creation should work in both APIs', async () => {
      const taskData = {
        title: 'Basic Test Task',
        description: 'Testing task creation',
        status: 'pending'
      };

      // Test REST API task creation
      const restTask = await restAPI.createTask(taskData, restToken);
      expect(restTask).toBeDefined();
      expect(restTask.title || restTask.title).toBe(taskData.title);

      // Test GraphQL API task creation
      const graphqlTask = await graphqlAPI.createTask(taskData, graphqlToken);
      expect(graphqlTask).toBeDefined();
      expect(graphqlTask.title).toBe(taskData.title);
      expect(graphqlTask.status).toBe(taskData.status);

      // Both should create tasks successfully
      expect(restTask.success || restTask.id || restTask.taskId).toBeTruthy();
      expect(graphqlTask.id).toBeDefined();
    });

    test('Task retrieval should work in both APIs', async () => {
      // Test REST API task retrieval
      const restTasks = await restAPI.getTasks(restToken);
      expect(Array.isArray(restTasks)).toBe(true);

      // Test GraphQL API task retrieval
      const graphqlTasks = await graphqlAPI.getTasks(graphqlToken);
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
      // Test REST API user retrieval
      const restUsers = await restAPI.getUsers(restToken);
      expect(Array.isArray(restUsers)).toBe(true);
      expect(restUsers.length).toBeGreaterThan(0);

      // Test GraphQL API user retrieval
      const graphqlUsers = await graphqlAPI.getUsers(graphqlToken);
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
      const invalidEmail = 'nonexistent@example.com';
      const invalidPassword = 'wrongpassword';

      // Test REST API error handling
      await expect(restAPI.login(invalidEmail, invalidPassword))
        .rejects.toThrow();

      // Test GraphQL API error handling
      await expect(graphqlAPI.login(invalidEmail, invalidPassword))
        .rejects.toThrow();
    });

    test('Duplicate user creation should fail in both APIs', async () => {
      // Create a unique email for this test
      const duplicateTestEmail = `duplicate${Date.now()}@example.com`;

      // First, create a user in REST API
      await restAPI.createUser({
        email: duplicateTestEmail,
        password: testPassword
      });

      // Then try to create the same user again - should fail
      await expect(restAPI.createUser({
        email: duplicateTestEmail,
        password: testPassword
      })).rejects.toThrow();

      // Create a user in GraphQL API
      const graphqlDuplicateEmail = `gqlduplicate${Date.now()}@example.com`;
      await graphqlAPI.createUser({
        email: graphqlDuplicateEmail,
        password: testPassword
      });

      // Try to create the same user again - should fail
      await expect(graphqlAPI.createUser({
        email: graphqlDuplicateEmail,
        password: testPassword
      })).rejects.toThrow();
    });

    test('Unauthorized access should fail in both APIs', async () => {
      const invalidToken = 'invalid-token';

      // Test REST API unauthorized access
      await expect(restAPI.getTasks(invalidToken))
        .rejects.toThrow();

      // Test GraphQL API unauthorized access
      await expect(graphqlAPI.getTasks(invalidToken))
        .rejects.toThrow();
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
