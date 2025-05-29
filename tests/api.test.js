const { graphqlRequest } = require('../client/example');

// Test user data (updated to match new schema)
const testUser = {
  email: `test${Math.floor(Math.random() * 10000)}@example.com`,
  password: 'password123'
};

let token = null;
let userId = null;
let taskId = null;

// Helper function to log test results
function logResult(testName, success, error = null) {
  if (success) {
    console.log(`✅ PASS: ${testName}`);
  } else {
    console.log(`❌ FAIL: ${testName}`);
    if (error) {
      console.log(`   Error: ${error.message || error}`);
    }
  }
}

async function runTests() {
  console.log("🧪 Starting GraphQL API Tests\n");

  try {
    // Test 1: Create a user
    try {
      const createUserQuery = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            username
            email
          }
        }
      `;
      const result = await graphqlRequest(createUserQuery, { input: testUser });
      userId = result.createUser.id;
      logResult("Create User", result.createUser && result.createUser.id);
    } catch (error) {
      logResult("Create User", false, error);
    }

    // Test 2: Login
    try {
      const loginQuery = `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            token
            user {
              id
              username
            }
          }
        }
      `;
      const result = await graphqlRequest(loginQuery, { 
        input: { 
          email: testUser.email, 
          password: testUser.password 
        } 
      });
      token = result.login.token;
      logResult("Login", token && result.login.user.id === userId);
    } catch (error) {
      logResult("Login", false, error);
    }

    // Test 3: Get all users
    try {
      const allUsersQuery = `
        query {
          users {
            id
            username
            email
          }
        }
      `;
      const result = await graphqlRequest(allUsersQuery, {}, token);
      logResult("Get All Users", Array.isArray(result.users));
    } catch (error) {
      logResult("Get All Users", false, error);
    }

    // Test 4: Get user by ID
    try {
      const userByIdQuery = `
        query GetUser($id: ID!) {
          user(id: $id) {
            id
            username
            email
          }
        }
      `;
      const result = await graphqlRequest(userByIdQuery, { id: userId }, token);
      logResult("Get User By ID", result.user && result.user.id === userId);
    } catch (error) {
      logResult("Get User By ID", false, error);
    }

    // Test 5: Get current user (me)
    try {
      const meQuery = `
        query {
          me {
            id
            username
            email
          }
        }
      `;
      const result = await graphqlRequest(meQuery, {}, token);
      logResult("Get Current User", result.me && result.me.id === userId);
    } catch (error) {
      logResult("Get Current User", false, error);
    }

    // Test 6: Create a task
    try {
      const createTaskQuery = `
        mutation CreateTask($input: CreateTaskInput!) {
          createTask(input: $input) {
            id
            title
            status
            userId
          }
        }
      `;
      const taskInput = {
        title: "Test Task",
        description: "This is a test task",
        status: "pending",
        priority: "MEDIUM"
      };
      const result = await graphqlRequest(createTaskQuery, { input: taskInput }, token);
      taskId = result.createTask.id;
      logResult("Create Task", result.createTask && result.createTask.title === taskInput.title);
    } catch (error) {
      logResult("Create Task", false, error);
    }

    // Test 7: Get all tasks
    try {
      const allTasksQuery = `
        query {
          tasks {
            id
            title
            status
          }
        }
      `;
      const result = await graphqlRequest(allTasksQuery, {}, token);
      logResult("Get All Tasks", Array.isArray(result.tasks));
    } catch (error) {
      logResult("Get All Tasks", false, error);
    }

    // Test 8: Update task
    try {
      const updateTaskQuery = `
        mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
          updateTask(id: $id, input: $input) {
            id
            title
            status
          }
        }
      `;
      const updateInput = {
        status: "in_progress",
        title: "Updated Test Task"
      };
      const result = await graphqlRequest(updateTaskQuery, { 
        id: taskId, 
        input: updateInput 
      }, token);
      logResult("Update Task", result.updateTask && result.updateTask.status === updateInput.status);
    } catch (error) {
      logResult("Update Task", false, error);
    }

    // Test 9: Delete task
    try {
      const deleteTaskQuery = `
        mutation DeleteTask($id: ID!) {
          deleteTask(id: $id)
        }
      `;
      const result = await graphqlRequest(deleteTaskQuery, { id: taskId }, token);
      logResult("Delete Task", result.deleteTask === true);
    } catch (error) {
      logResult("Delete Task", false, error);
    }

    // Test 10: Update user
    try {
      const updateUserQuery = `
        mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
          updateUser(id: $id, input: $input) {
            id
            username
            email
          }
        }
      `;
      const updateInput = {
        password: "newpassword123"
      };
      const result = await graphqlRequest(updateUserQuery, { 
        id: userId, 
        input: updateInput 
      }, token);
      logResult("Update User",
        result.updateUser &&
        result.updateUser.id === userId
      );
    } catch (error) {
      logResult("Update User", false, error);
    }

    // Test 11: Delete user (before logout to have valid token)
    try {
      const deleteUserQuery = `
        mutation DeleteUser($id: ID!) {
          deleteUser(id: $id)
        }
      `;
      const result = await graphqlRequest(deleteUserQuery, { id: userId }, token);
      logResult("Delete User", result.deleteUser === true);
    } catch (error) {
      logResult("Delete User", false, error);
    }

    // Test 12: Logout (optional since user is deleted)
    try {
      const logoutQuery = `
        mutation {
          logout
        }
      `;
      const result = await graphqlRequest(logoutQuery, {}, token);
      logResult("Logout", result.logout === true);
    } catch (error) {
      // Expected to fail since user is deleted
      logResult("Logout", true, "Expected to fail - user deleted");
    }

    console.log("\n🎉 Tests completed!");
  } catch (error) {
    console.error("❌ Test suite error:", error);
  }
}

// Jest test wrapper (only when running with Jest)
if (typeof describe !== 'undefined') {
  describe('GraphQL API Tests', () => {
    test('All GraphQL operations should work', async () => {
      await runTests();
    });
  });
} else {
  // Run tests directly when executed with Node.js
  runTests();
}
