const axios = require('axios');

// GraphQL API base URL
const GRAPHQL_BASE_URL = 'http://localhost:4000';

// GraphQL request function
async function graphqlRequest(query, variables = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await axios.post(GRAPHQL_BASE_URL, {
    query,
    variables
  }, { headers });

  if (response.data.errors) {
    throw new Error(response.data.errors[0].message);
  }

  return response.data.data;
}

// GraphQL API client functions
const graphqlAPI = {
  // Auth operations
  async createUser(userData) {
    const mutation = `
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          username
          createdAt
          updatedAt
        }
      }
    `;
    const result = await graphqlRequest(mutation, { input: userData });
    console.log('GraphQL createUser:', JSON.stringify(result.createUser, null, 2));
    return result.createUser;
  },

  async login(email, password) {
    const mutation = `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          token
        }
      }
    `;
    const result = await graphqlRequest(mutation, { input: { email, password } });
    console.log('GraphQL login:', JSON.stringify(result.login, null, 2));
    return result.login;
  },

  async logout(token) {
    const mutation = `
      mutation {
        logout
      }
    `;
    const result = await graphqlRequest(mutation, {}, token);
    console.log('GraphQL logout:', JSON.stringify(result.logout, null, 2));
    return result.logout;
  },

  // User operations
  async getUsers(token) {
    const query = `
      query {
        users {
          id
          username
          createdAt
          updatedAt
        }
      }
    `;
    const result = await graphqlRequest(query, {}, token);
    console.log('GraphQL getUsers:', JSON.stringify(result.users, null, 2));
    return result.users;
  },

  async getUserById(userId, token) {
    const query = `
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          username
          createdAt
          updatedAt
        }
      }
    `;
    const result = await graphqlRequest(query, { id: userId }, token);
    console.log('GraphQL getUserById:', JSON.stringify(result.user, null, 2));
    return result.user;
  },



  async updateUser(userId, userData, token) {
    const mutation = `
      mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
        updateUser(id: $id, input: $input) {
          id
          username
          email
          createdAt
          updatedAt
        }
      }
    `;
    const result = await graphqlRequest(mutation, { id: userId, input: userData }, token);
    console.log('GraphQL updateUser:', JSON.stringify(result.updateUser, null, 2));
    return result.updateUser;
  },

  async deleteUser(userId, token) {
    const mutation = `
      mutation DeleteUser($id: ID!) {
        deleteUser(id: $id)
      }
    `;
    const result = await graphqlRequest(mutation, { id: userId }, token);
    console.log('GraphQL deleteUser:', JSON.stringify(result.deleteUser, null, 2));
    return result.deleteUser;
  },

  // Task operations
  async getTasks(token) {
    const query = `
      query {
        tasks {
          page
          limit
          total
          tasks {
            id
            title
            description
            status
            user_id
            createdAt
            updatedAt
          }
        }
      }
    `;
    const result = await graphqlRequest(query, {}, token);
    console.log('GraphQL getTasks:', JSON.stringify(result.tasks, null, 2));
    // Return the tasks array to match REST API format (which gets the tasks from response.data.tasks)
    return result.tasks.tasks || [];
  },



  async createTask(taskData, token) {
    const mutation = `
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
    const result = await graphqlRequest(mutation, { input: taskData }, token);
    console.log('GraphQL createTask:', JSON.stringify(result.createTask, null, 2));
    
    // Add id field for compatibility with test expectations
    if (result.createTask && result.createTask.taskId) {
      result.createTask.id = result.createTask.taskId;
    }
    
    return result.createTask;
  },

  async updateTask(taskId, taskData, token) {
    const mutation = `
      mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
        updateTask(id: $id, input: $input) {
          id
          title
          description
          status
          user_id
          createdAt
          updatedAt
        }
      }
    `;
    const result = await graphqlRequest(mutation, { id: taskId, input: taskData }, token);
    console.log('GraphQL updateTask:', JSON.stringify(result.updateTask, null, 2));
    return result.updateTask;
  },

  async deleteTask(taskId, token) {
    const mutation = `
      mutation DeleteTask($id: ID!) {
        deleteTask(id: $id)
      }
    `;
    const result = await graphqlRequest(mutation, { id: taskId }, token);
    console.log('GraphQL deleteTask:', JSON.stringify(result.deleteTask, null, 2));
    return result.deleteTask;
  }
};

module.exports = { graphqlAPI };
