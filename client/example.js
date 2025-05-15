// Client example using fetch API to interact with the GraphQL server
const API_URL = 'http://localhost:4000/graphql';

// Helper function to make GraphQL requests
async function graphqlRequest(query, variables = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const data = await response.json();
  
  if (data.errors) {
    console.error('GraphQL Errors:', data.errors);
    throw new Error(data.errors[0].message);
  }
  
  return data.data;
}

// Example operations
async function runExamples() {
  try {
    console.log('--- Running GraphQL Client Examples ---');
    
    // 1. Create a new user
    console.log('\n1. Creating a new user:');
    const createUserQuery = `
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          username
          email
          firstName
          lastName
          createdAt
        }
      }
    `;
    const createUserVars = {
      input: {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      }
    };
    
    const newUser = await graphqlRequest(createUserQuery, createUserVars);
    console.log('User created:', newUser.createUser);
    
    // 2. Login with the new user
    console.log('\n2. Logging in:');
    const loginQuery = `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          token
          user {
            id
            username
            email
          }
        }
      }
    `;
    const loginVars = {
      input: {
        email: 'test@example.com',
        password: 'password123'
      }
    };
    
    const loginData = await graphqlRequest(loginQuery, loginVars);
    console.log('Logged in successfully. Token received.');
    const token = loginData.login.token;
    
    // 3. Get current user info (me)
    console.log('\n3. Getting current user info:');
    const meQuery = `
      query Me {
        me {
          id
          username
          email
          firstName
          lastName
        }
      }
    `;
    
    const meData = await graphqlRequest(meQuery, {}, token);
    console.log('Current user:', meData.me);
    
    // 4. Create a new task
    console.log('\n4. Creating a new task:');
    const createTaskQuery = `
      mutation CreateTask($input: CreateTaskInput!) {
        createTask(input: $input) {
          id
          title
          description
          status
          priority
          createdAt
        }
      }
    `;
    const createTaskVars = {
      input: {
        title: 'Complete GraphQL Implementation',
        description: 'Implement a GraphQL API that mirrors the REST API functionality',
        status: 'IN_PROGRESS',
        priority: 'HIGH'
      }
    };
    
    const newTask = await graphqlRequest(createTaskQuery, createTaskVars, token);
    console.log('Task created:', newTask.createTask);
    const taskId = newTask.createTask.id;
    
    // 5. Get all tasks
    console.log('\n5. Getting all tasks:');
    const tasksQuery = `
      query GetTasks {
        tasks {
          id
          title
          status
          priority
          user {
            username
          }
        }
      }
    `;
    
    const tasksData = await graphqlRequest(tasksQuery, {}, token);
    console.log('All tasks:', tasksData.tasks);
    
    // 6. Update task
    console.log('\n6. Updating task:');
    const updateTaskQuery = `
      mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
        updateTask(id: $id, input: $input) {
          id
          title
          status
          updatedAt
        }
      }
    `;
    const updateTaskVars = {
      id: taskId,
      input: {
        status: 'DONE'
      }
    };
    
    const updatedTask = await graphqlRequest(updateTaskQuery, updateTaskVars, token);
    console.log('Task updated:', updatedTask.updateTask);
    
    // 7. Delete task
    console.log('\n7. Deleting task:');
    const deleteTaskQuery = `
      mutation DeleteTask($id: ID!) {
        deleteTask(id: $id)
      }
    `;
    const deleteTaskVars = {
      id: taskId
    };
    
    const deleteResult = await graphqlRequest(deleteTaskQuery, deleteTaskVars, token);
    console.log('Task deleted:', deleteResult.deleteTask ? 'Success' : 'Failed');
    
    // 8. Logout
    console.log('\n8. Logging out:');
    const logoutQuery = `
      mutation Logout {
        logout
      }
    `;
    
    const logoutResult = await graphqlRequest(logoutQuery, {}, token);
    console.log('Logout successful:', logoutResult.logout);
    
    // 9. Delete user (cleanup)
    console.log('\n9. Deleting test user:');
    const deleteUserQuery = `
      mutation DeleteUser($id: ID!) {
        deleteUser(id: $id)
      }
    `;
    const deleteUserVars = {
      id: loginData.login.user.id
    };
    
    const deleteUserResult = await graphqlRequest(deleteUserQuery, deleteUserVars, token);
    console.log('User deleted:', deleteUserResult.deleteUser ? 'Success' : 'Failed');
    
  } catch (error) {
    console.error('Error in example operations:', error.message);
  }
}

// Run the examples if this file is executed directly
if (require.main === module) {
  runExamples();
}

module.exports = {
  graphqlRequest
};
