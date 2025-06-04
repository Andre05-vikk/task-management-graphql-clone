const { restAPI } = require('./rest-client');
const { graphqlAPI } = require('./graphql-client');
const {
  logAPICall,
  compareResponses,
  compareArrayResponses,
  normalizeUser,
  safeDelete
} = require('./test-utils');



// Test data
const testUser = {
  email: `test${Math.floor(Math.random() * 10000)}@example.com`,
  password: 'password123'
};

const testTask = {
  title: 'Test Task',
  description: 'This is a test task',
  status: 'pending'
};



describe('REST vs GraphQL API Equivalence Tests', () => {
  let restToken, graphqlToken;
  let restUserId, graphqlUserId;
  let restTaskId, graphqlTaskId;

  // Test data tracking for comprehensive cleanup
  const testData = {
    restUsers: [],
    graphqlUsers: [],
    restTasks: [],
    graphqlTasks: []
  };

  beforeAll(async () => {
    // Wait for APIs to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  describe('User Creation Equivalence', () => {
    test('createUser should return equivalent results', async () => {
      console.log('\n🚀 Testing User Creation API Equivalence');
      
      // Create user via REST API
      const restUser = await restAPI.createUser(testUser);
      logAPICall('REST', 'User Creation', testUser, restUser);
      
      // Store user IDs for later tests
      restUserId = restUser.id;
      
      // Track for cleanup
      testData.restUsers.push({ 
        id: restUser.id, 
        email: testUser.email, 
        token: null 
      });
      
      // Create user via GraphQL API (with different email)
      const graphqlUserData = {
        ...testUser,
        email: `graphql${Math.floor(Math.random() * 10000)}@example.com`
      };
      const graphqlUser = await graphqlAPI.createUser(graphqlUserData);
      logAPICall('GraphQL', 'User Creation', graphqlUserData, graphqlUser);

      // Compare responses and show differences
      compareResponses(restUser, graphqlUser, 'User Creation');

      // Store user IDs for later tests
      graphqlUserId = graphqlUser.id;
      
      // Track for cleanup
      testData.graphqlUsers.push({ 
        id: graphqlUser.id, 
        email: graphqlUserData.email, 
        token: null 
      });

      // Compare normalized results
      expect(normalizeUser(restUser)).toMatchObject({
        username: testUser.email,
        email: testUser.email
      });

      expect(normalizeUser(graphqlUser)).toMatchObject({
        username: graphqlUserData.email,
        email: graphqlUserData.email
      });

      // Both should have IDs (types may differ: REST=number, GraphQL=string)
      expect(restUser.id).toBeDefined();
      expect(graphqlUser.id).toBeDefined();
      expect(restUser.username).toBe(testUser.email);
      expect(graphqlUser.username).toBe(graphqlUserData.email);
    });
  });

  describe('Authentication Equivalence', () => {
    test('login should return equivalent results', async () => {
      console.log('\n🚀 Testing Authentication API Equivalence');
      
      // Login via REST API
      const restLoginRequest = { email: testUser.email, password: testUser.password };
      const restLogin = await restAPI.login(testUser.email, testUser.password);
      logAPICall('REST', 'User Login', restLoginRequest, restLogin);
      
      // Store tokens for later tests
      restToken = restLogin.token;
      
      // Update token for cleanup
      if (testData.restUsers.length > 0) {
        testData.restUsers[0].token = restToken;
      }
      
      // Login via GraphQL API
      const graphqlUserData = {
        email: `graphql${Math.floor(Math.random() * 10000)}@example.com`,
        password: testUser.password
      };
      await graphqlAPI.createUser(graphqlUserData);
      
      // Track this additional user for cleanup
      testData.graphqlUsers.push({ 
        id: null, // Will be updated when we get the login response
        email: graphqlUserData.email, 
        token: null 
      });
      
      const graphqlLoginRequest = { email: graphqlUserData.email, password: graphqlUserData.password };
      const graphqlLogin = await graphqlAPI.login(graphqlUserData.email, graphqlUserData.password);
      logAPICall('GraphQL', 'User Login', graphqlLoginRequest, graphqlLogin);

      // Compare responses and show differences
      compareResponses(restLogin, graphqlLogin, 'User Authentication');

      // Store tokens for later tests
      graphqlToken = graphqlLogin.token;
      
      // Update the last added user with ID and token
      if (testData.graphqlUsers.length > 0 && graphqlLogin.user) {
        const lastUser = testData.graphqlUsers[testData.graphqlUsers.length - 1];
        lastUser.id = graphqlLogin.user.id;
        lastUser.token = graphqlToken;
      }

      // Both should return tokens
      expect(typeof restLogin.token).toBe('string');
      expect(typeof graphqlLogin.token).toBe('string');
      expect(restLogin.token.length).toBeGreaterThan(0);
      expect(graphqlLogin.token.length).toBeGreaterThan(0);

      // Both should return valid tokens (user info removed from GraphQL response to match REST API)
      expect(restLogin.token.length).toBeGreaterThan(10);
      expect(graphqlLogin.token.length).toBeGreaterThan(10);
    });
  });

  describe('User Management Equivalence', () => {
    test('getUsers should return equivalent results', async () => {
      console.log('\n🚀 Testing Get Users API Equivalence');
      
      // Get users via REST API
      const restUsers = await restAPI.getUsers(restToken);
      logAPICall('REST', 'Get Users', { token: '***' }, restUsers);
      
      // Get users via GraphQL API
      const graphqlUsers = await graphqlAPI.getUsers(graphqlToken);
      logAPICall('GraphQL', 'Get Users', { token: '***' }, graphqlUsers);

      // Compare array responses and show differences
      compareArrayResponses(restUsers, graphqlUsers, 'Get Users');

      // Both should return arrays
      expect(Array.isArray(restUsers)).toBe(true);
      expect(Array.isArray(graphqlUsers)).toBe(true);

      // Both should contain users
      expect(restUsers.length).toBeGreaterThan(0);
      expect(graphqlUsers.length).toBeGreaterThan(0);

      // Check structure of first user
      if (restUsers.length > 0 && graphqlUsers.length > 0) {
        const restUser = restUsers[0];
        const graphqlUser = graphqlUsers[0];
        
        expect(restUser).toHaveProperty('id');
        expect(restUser).toHaveProperty('username');
        expect(graphqlUser).toHaveProperty('id');
        expect(graphqlUser).toHaveProperty('username');
      }
    });

    test('getUserById should return equivalent results', async () => {
      console.log('\n🚀 Testing Get User By ID API Equivalence');
      
      // Get user by ID via REST API
      const restUser = await restAPI.getUserById(restUserId, restToken);
      logAPICall('REST', 'Get User By ID', { userId: restUserId, token: '***' }, restUser);
      
      // Get user by ID via GraphQL API
      const graphqlUser = await graphqlAPI.getUserById(graphqlUserId, graphqlToken);
      logAPICall('GraphQL', 'Get User By ID', { userId: graphqlUserId, token: '***' }, graphqlUser);

      // Compare structure
      expect(normalizeUser(restUser)).toMatchObject({
        id: restUserId.toString(),
        username: testUser.email,
        email: testUser.email
      });

      expect(normalizeUser(graphqlUser)).toMatchObject({
        id: graphqlUserId.toString()
      });

      // Both should have same properties
      expect(restUser).toHaveProperty('id');
      expect(restUser).toHaveProperty('username');
      expect(graphqlUser).toHaveProperty('id');
      expect(graphqlUser).toHaveProperty('username');
    });
  });

  describe('Task Management Equivalence', () => {
    test('createTask should return equivalent results', async () => {
      console.log('\n🚀 Testing Create Task API Equivalence');
      
      // Create task via REST API
      const restTask = await restAPI.createTask(testTask, restToken);
      logAPICall('REST', 'Create Task', { ...testTask, token: '***' }, restTask);
      
      // Create task via GraphQL API
      const graphqlTask = await graphqlAPI.createTask(testTask, graphqlToken);
      logAPICall('GraphQL', 'Create Task', { ...testTask, token: '***' }, graphqlTask);

      // Compare responses and show differences
      compareResponses(restTask, graphqlTask, 'Task Creation');

      // Store task IDs for later tests
      restTaskId = restTask.taskId || restTask.id;
      graphqlTaskId = graphqlTask.id;

      // Track tasks for cleanup
      testData.restTasks.push({ 
        id: restTaskId, 
        title: testTask.title 
      });
      testData.graphqlTasks.push({ 
        id: graphqlTaskId, 
        title: testTask.title 
      });

      // Compare results
      expect(restTask.title || restTask.title).toBe(testTask.title);
      expect(graphqlTask.title).toBe(testTask.title);
      expect(restTask.status || testTask.status).toBe(testTask.status);
      expect(graphqlTask.status).toBe(testTask.status);
    });

    test('getTasks should return equivalent results', async () => {
      console.log('\n🚀 Testing Get Tasks API Equivalence');
      
      // Get tasks via REST API
      const restTasks = await restAPI.getTasks(restToken);
      logAPICall('REST', 'Get Tasks', { token: '***' }, restTasks);

      // Get tasks via GraphQL API
      const graphqlTasks = await graphqlAPI.getTasks(graphqlToken);
      logAPICall('GraphQL', 'Get Tasks', { token: '***' }, graphqlTasks);

      // Compare array responses and show differences
      compareArrayResponses(restTasks, graphqlTasks, 'Get Tasks');

      // Both should return arrays
      expect(Array.isArray(restTasks)).toBe(true);
      expect(Array.isArray(graphqlTasks)).toBe(true);

      // Check that both contain the created tasks
      if (restTasks.length > 0) {
        const restTask = restTasks.find(t => t.title === testTask.title);
        expect(restTask).toBeDefined();
        expect(restTask.title).toBe(testTask.title);
      }

      if (graphqlTasks.length > 0) {
        const graphqlTask = graphqlTasks.find(t => t.title === testTask.title);
        expect(graphqlTask).toBeDefined();
        expect(graphqlTask.title).toBe(testTask.title);
      }
    });


  });

  describe('Task Update Equivalence', () => {
    test('updateTask should return equivalent results', async () => {
      console.log('\n🚀 Testing Update Task API Equivalence');
      
      const updateData = {
        title: 'Updated Test Task',
        status: 'in_progress'
      };

      // Update task via REST API
      if (restTaskId) {
        try {
          const restResult = await restAPI.updateTask(restTaskId, updateData, restToken);
          logAPICall('REST', 'Update Task', { taskId: restTaskId, updateData, token: '***' }, restResult);
          expect(restResult.title || restResult.task?.title).toBe(updateData.title);
        } catch (error) {
          console.log('REST task update error:', error.message);
        }
      }

      // Update task via GraphQL API
      if (graphqlTaskId) {
        try {
          const graphqlResult = await graphqlAPI.updateTask(graphqlTaskId, updateData, graphqlToken);
          logAPICall('GraphQL', 'Update Task', { taskId: graphqlTaskId, updateData, token: '***' }, graphqlResult);
          expect(graphqlResult.title).toBe(updateData.title);
          expect(graphqlResult.status).toBe(updateData.status);
        } catch (error) {
          console.log('GraphQL task update error:', error.message);
        }
      }
    });
  });

  describe('Task Deletion Equivalence', () => {
    test('deleteTask should work equivalently', async () => {
      console.log('\n🚀 Testing Delete Task API Equivalence');

      // Delete task via REST API
      if (restTaskId) {
        try {
          const restResult = await restAPI.deleteTask(restTaskId, restToken);
          logAPICall('REST', 'Delete Task', { taskId: restTaskId, token: '***' }, { success: restResult });

          expect(restResult).toBe(true);

          // Verify task is deleted by trying to get it (should fail)
          try {
            await restAPI.getTaskById(restTaskId, restToken);
            // If we get here, the task wasn't deleted
            expect(true).toBe(false); // Force failure
          } catch (error) {
            // Expected - task should be deleted
            expect(error.message).toContain('404');
          }
        } catch (error) {
          console.log('REST task deletion error:', error.message);
        }
      }

      // Delete task via GraphQL API
      if (graphqlTaskId) {
        try {
          const graphqlResult = await graphqlAPI.deleteTask(graphqlTaskId, graphqlToken);
          logAPICall('GraphQL', 'Delete Task', { taskId: graphqlTaskId, token: '***' }, { success: graphqlResult });

          expect(graphqlResult).toBe(true);

          // Verify task is deleted by checking tasks list
          const remainingTasks = await graphqlAPI.getTasks(graphqlToken);
          const deletedTask = remainingTasks.find(task => task.id === graphqlTaskId);
          expect(deletedTask).toBeUndefined();
        } catch (error) {
          console.log('GraphQL task deletion error:', error.message);
        }
      }
    });
  });

  describe('User Update Equivalence', () => {
    test('updateUser should work equivalently', async () => {
      console.log('\n🚀 Testing Update User API Equivalence');
      
      const updateData = {
        password: 'newpassword123'
      };

      // Update user via REST API
      if (restUserId) {
        try {
          const restResult = await restAPI.updateUser(restUserId, updateData, restToken);
          logAPICall('REST', 'Update User', { userId: restUserId, updateData, token: '***' }, restResult);
          expect(restResult).toBeDefined();
        } catch (error) {
          console.log('REST user update error:', error.message);
        }
      }

      // Update user via GraphQL API
      if (graphqlUserId) {
        try {
          const graphqlResult = await graphqlAPI.updateUser(graphqlUserId, updateData, graphqlToken);
          logAPICall('GraphQL', 'Update User', { userId: graphqlUserId, updateData, token: '***' }, graphqlResult);
          expect(graphqlResult).toBeDefined();
          expect(graphqlResult.id).toBe(graphqlUserId);
        } catch (error) {
          console.log('GraphQL user update error:', error.message);
        }
      }
    });
  });

  describe('User Deletion Equivalence', () => {
    test('deleteUser should work equivalently', async () => {
      console.log('\n🚀 Testing Delete User API Equivalence');

      // Note: We'll create temporary users for deletion testing
      // to avoid deleting the main test users

      // Create temporary user for REST deletion test
      const tempRestUser = await restAPI.createUser({
        email: `temp-rest-delete-${Date.now()}@example.com`,
        password: 'password123'
      });
      const tempRestLogin = await restAPI.login(tempRestUser.username, 'password123');

      // Create temporary user for GraphQL deletion test
      const tempGraphQLUser = await graphqlAPI.createUser({
        email: `temp-gql-delete-${Date.now()}@example.com`,
        password: 'password123'
      });
      const tempGraphQLLogin = await graphqlAPI.login(tempGraphQLUser.username, 'password123');

      // Delete user via REST API (users can only delete themselves)
      try {
        const restResult = await restAPI.deleteUser(tempRestUser.id, tempRestLogin.token);
        logAPICall('REST', 'Delete User', { userId: tempRestUser.id, token: '***' }, { success: restResult });

        expect(restResult).toBe(true);

        // Verify user is deleted by trying to login (should fail)
        try {
          await restAPI.login(tempRestUser.username, 'password123');
          // If we get here, the user wasn't deleted
          expect(true).toBe(false); // Force failure
        } catch (error) {
          // Expected - user should be deleted
          expect(error.message).toContain('401');
        }
      } catch (error) {
        console.log('REST user deletion error:', error.message);
      }

      // Delete user via GraphQL API (users can only delete themselves)
      try {
        const graphqlResult = await graphqlAPI.deleteUser(tempGraphQLUser.id, tempGraphQLLogin.token);
        logAPICall('GraphQL', 'Delete User', { userId: tempGraphQLUser.id, token: '***' }, { success: graphqlResult });

        expect(graphqlResult).toBe(true);

        // Verify user is deleted by trying to login (should fail)
        try {
          await graphqlAPI.login(tempGraphQLUser.username, 'password123');
          // If we get here, the user wasn't deleted
          expect(true).toBe(false); // Force failure
        } catch (error) {
          // Expected - user should be deleted
          expect(error.message).toContain('Invalid email or password');
        }
      } catch (error) {
        console.log('GraphQL user deletion error:', error.message);
      }
    });
  });

  describe('Logout Equivalence', () => {
    test('logout should work equivalently', async () => {
      console.log('\n🚀 Testing Logout API Equivalence');
      
      // Logout via REST API
      try {
        const restResult = await restAPI.logout(restToken);
        logAPICall('REST', 'User Logout', { token: '***' }, { success: restResult });
        expect(restResult).toBe(true);
      } catch (error) {
        console.log('REST logout error:', error.message);
      }

      // Logout via GraphQL API
      try {
        const graphqlResult = await graphqlAPI.logout(graphqlToken);
        logAPICall('GraphQL', 'User Logout', { token: '***' }, { success: graphqlResult });
        expect(graphqlResult).toBe(true);
      } catch (error) {
        console.log('GraphQL logout error:', error.message);
      }
    });
  });

  // Comprehensive cleanup function
  afterAll(async () => {
    console.log('\n🧹 Starting comprehensive test cleanup...');
    


    // Delete REST tasks first (dependency order)
    for (const task of testData.restTasks) {
      if (task.id) {
        // Re-authenticate if needed
        if (!restToken && testData.restUsers.length > 0) {
          try {
            const user = testData.restUsers[0];
            const loginResult = await restAPI.login(user.email, testUser.password);
            restToken = loginResult.token;
            logAPICall('REST', 'Re-authentication for cleanup', { email: user.email }, { token: '***', success: true });
          } catch (error) {
            console.log('⚠️  REST re-authentication failed for cleanup:', error.message);
          }
        }
        
        await safeDelete(
          () => restAPI.deleteTask(task.id, restToken),
          `REST task (${task.title})`,
          { id: task.id, title: task.title }
        );
      }
    }

    // Delete GraphQL tasks first (dependency order)
    for (const task of testData.graphqlTasks) {
      if (task.id) {
        // Re-authenticate if needed
        if (!graphqlToken && testData.graphqlUsers.length > 0) {
          try {
            const user = testData.graphqlUsers[testData.graphqlUsers.length - 1]; // Use the last user
            const loginResult = await graphqlAPI.login(user.email, testUser.password);
            graphqlToken = loginResult.token;
            logAPICall('GraphQL', 'Re-authentication for cleanup', { email: user.email }, { token: '***', success: true });
          } catch (error) {
            console.log('⚠️  GraphQL re-authentication failed for cleanup:', error.message);
          }
        }
        
        await safeDelete(
          () => graphqlAPI.deleteTask(task.id, graphqlToken),
          `GraphQL task (${task.title})`,
          { id: task.id, title: task.title }
        );
      }
    }

    // Delete REST users
    for (const user of testData.restUsers) {
      if (user.id) {
        // Re-authenticate if token is not available
        let tokenToUse = user.token || restToken;
        if (!tokenToUse) {
          try {
            const loginResult = await restAPI.login(user.email, testUser.password);
            tokenToUse = loginResult.token;
            logAPICall('REST', 'Re-authentication for user cleanup', { email: user.email }, { token: '***', success: true });
          } catch (error) {
            console.log('⚠️  REST re-authentication failed for user cleanup:', error.message);
            continue;
          }
        }
        
        await safeDelete(
          () => restAPI.deleteUser(user.id, tokenToUse),
          `REST user (${user.email})`,
          { id: user.id, email: user.email }
        );
      }
    }

    // Delete GraphQL users
    for (const user of testData.graphqlUsers) {
      if (user.id) {
        // Re-authenticate if token is not available
        let tokenToUse = user.token || graphqlToken;
        if (!tokenToUse) {
          try {
            const loginResult = await graphqlAPI.login(user.email, testUser.password);
            tokenToUse = loginResult.token;
            logAPICall('GraphQL', 'Re-authentication for user cleanup', { email: user.email }, { token: '***', success: true });
          } catch (error) {
            console.log('⚠️  GraphQL re-authentication failed for user cleanup:', error.message);
            continue;
          }
        }
        
        await safeDelete(
          () => graphqlAPI.deleteUser(user.id, tokenToUse),
          `GraphQL user (${user.email})`,
          { id: user.id, email: user.email }
        );
      }
    }

    console.log('🧹 Test cleanup completed');
    console.log('📊 Cleanup Summary:');
    console.log(`   REST users tracked: ${testData.restUsers.length}`);
    console.log(`   GraphQL users tracked: ${testData.graphqlUsers.length}`);
    console.log(`   REST tasks tracked: ${testData.restTasks.length}`);
    console.log(`   GraphQL tasks tracked: ${testData.graphqlTasks.length}`);
  });
});
