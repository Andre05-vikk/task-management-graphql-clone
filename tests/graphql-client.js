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
    return result.login;
  },

  async logout(token) {
    const mutation = `
      mutation {
        logout
      }
    `;
    const result = await graphqlRequest(mutation, {}, token);
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
    return result.updateUser;
  },

  async deleteUser(userId, token) {
    const mutation = `
      mutation DeleteUser($id: ID!) {
        deleteUser(id: $id)
      }
    `;
    const result = await graphqlRequest(mutation, { id: userId }, token);
    return result.deleteUser;
  },

  // Task operations
  async getTasks(token) {
    const query = `
      query {
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
    `;
    const result = await graphqlRequest(query, {}, token);
    return result.tasks;
  },



  async createTask(taskData, token) {
    const mutation = `
      mutation CreateTask($input: CreateTaskInput!) {
        createTask(input: $input) {
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
    const result = await graphqlRequest(mutation, { input: taskData }, token);
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
    return result.updateTask;
  },

  async deleteTask(taskId, token) {
    const mutation = `
      mutation DeleteTask($id: ID!) {
        deleteTask(id: $id)
      }
    `;
    const result = await graphqlRequest(mutation, { id: taskId }, token);
    return result.deleteTask;
  }
};

module.exports = { graphqlAPI };
