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
          createdAt
        }
      }
    `;
    const createUserVars = {
      input: {
        email: `test${Date.now()}@example.com`,
        password: 'password123'
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
        }
      }
    `;
    const loginVars = {
      input: {
        email: createUserVars.input.email,
        password: 'password123'
      }
    };
    
    const loginData = await graphqlRequest(loginQuery, loginVars);
    console.log('Logged in successfully. Token received.');
    const token = loginData.login.token;
    
    // 3. Get all users
    console.log('\n3. Getting all users:');
    const usersQuery = `
      query Users {
        users {
          id
          username
        }
      }
    `;
    
    const usersData = await graphqlRequest(usersQuery, {}, token);
    console.log('All users:', usersData.users.slice(0, 3)); // Show first 3 users
    
    // 4. Create a new task
    console.log('\n4. Creating a new task:');
    const createTaskQuery = `
      mutation CreateTask($input: CreateTaskInput!) {
        createTask(input: $input) {
          success
          message
          taskId
          title
          description
          status
        }
      }
    `;
    const createTaskVars = {
      input: {
        title: 'Complete GraphQL Implementation',
        description: 'Implement a GraphQL API that mirrors the REST API functionality',
        status: 'in_progress'
      }
    };
    
    const newTask = await graphqlRequest(createTaskQuery, createTaskVars, token);
    console.log('Task created:', newTask.createTask);
    const taskId = newTask.createTask.taskId;
    
    // 5. Get all tasks
    console.log('\n5. Getting all tasks:');
    const tasksQuery = `
      query GetTasks {
        tasks {
          tasks {
            id
            title
            status
            user_id
          }
        }
      }
    `;
    
    const tasksData = await graphqlRequest(tasksQuery, {}, token);
    console.log('All tasks:', tasksData.tasks.tasks);
    
    // 6. Update task
    console.log('\n6. Updating task:');
    const updateTaskQuery = `
      mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
        updateTask(id: $id, input: $input) {
          success
          message
        }
      }
    `;
    const updateTaskVars = {
      id: taskId,
      input: {
        status: 'completed'
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
      id: newUser.createUser.id
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
