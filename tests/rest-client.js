const axios = require('axios');

// REST API base URL
const REST_BASE_URL = 'http://localhost:5001';

// Create axios instance for REST API
const restClient = axios.create({
  baseURL: REST_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper function to handle REST API errors
const handleRestError = (error) => {
  if (error.response) {
    // Server responded with error status
    throw new Error(`Request failed with status code ${error.response.status}`);
  } else if (error.request) {
    // Request was made but no response received
    throw new Error('No response received from server');
  } else {
    // Something else happened
    throw new Error(error.message);
  }
};

// REST API client functions
const restAPI = {
  // Auth endpoints
  async createUser(userData) {
    try {
      const response = await restClient.post('/users', userData);
      console.log('REST createUser:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      handleRestError(error);
    }
  },

  async login(email, password) {
    try {
      const response = await restClient.post('/sessions', { email, password });
      console.log('REST login:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      handleRestError(error);
    }
  },

  async logout(token) {
    try {
      const response = await restClient.delete('/sessions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('REST logout status:', response.status);
      return response.status === 204;
    } catch (error) {
      handleRestError(error);
    }
  },

  // User endpoints
  async getUsers(token) {
    try {
      const response = await restClient.get('/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('REST getUsers:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      handleRestError(error);
    }
  },

  async getUserById(userId, token) {
    try {
      const response = await restClient.get(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('REST getUserById:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      handleRestError(error);
    }
  },

  async updateUser(userId, userData, token) {
    try {
      const response = await restClient.patch(`/users/${userId}`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('REST updateUser:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      handleRestError(error);
    }
  },

  async deleteUser(userId, token) {
    try {
      const response = await restClient.delete(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('REST deleteUser status:', response.status);
      return response.status === 204;
    } catch (error) {
      handleRestError(error);
    }
  },

  // Task endpoints
  async getTasks(token, params = {}) {
    try {
      const response = await restClient.get('/tasks', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      console.log('REST getTasks:', JSON.stringify(response.data, null, 2));
      // REST API returns {page, limit, total, tasks}, we need just tasks array
      return response.data.tasks || response.data;
    } catch (error) {
      handleRestError(error);
    }
  },

  async getTaskById(taskId, token) {
    try {
      const response = await restClient.get(`/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('REST getTaskById:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      handleRestError(error);
    }
  },

  async createTask(taskData, token) {
    try {
      const response = await restClient.post('/tasks', taskData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('REST createTask:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      handleRestError(error);
    }
  },

  async updateTask(taskId, taskData, token) {
    try {
      const response = await restClient.patch(`/tasks/${taskId}`, taskData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('REST updateTask:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      handleRestError(error);
    }
  },

  async deleteTask(taskId, token) {
    try {
      const response = await restClient.delete(`/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('REST deleteTask status:', response.status);
      return response.status === 204;
    } catch (error) {
      handleRestError(error);
    }
  }
};

module.exports = { restAPI };
