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

// REST API client functions
const restAPI = {
  // Auth endpoints
  async createUser(userData) {
    const response = await restClient.post('/users', userData);
    return response.data;
  },

  async login(email, password) {
    const response = await restClient.post('/sessions', { email, password });
    return response.data;
  },

  async logout(token) {
    const response = await restClient.delete('/sessions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.status === 204;
  },

  // User endpoints
  async getUsers(token) {
    const response = await restClient.get('/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async getUserById(userId, token) {
    const response = await restClient.get(`/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async updateUser(userId, userData, token) {
    const response = await restClient.patch(`/users/${userId}`, userData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async deleteUser(userId, token) {
    const response = await restClient.delete(`/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.status === 204;
  },

  // Task endpoints
  async getTasks(token, params = {}) {
    const response = await restClient.get('/tasks', {
      headers: { Authorization: `Bearer ${token}` },
      params
    });
    // REST API returns {page, limit, total, tasks}, we need just tasks array
    return response.data.tasks || response.data;
  },

  async getTaskById(taskId, token) {
    const response = await restClient.get(`/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async createTask(taskData, token) {
    const response = await restClient.post('/tasks', taskData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async updateTask(taskId, taskData, token) {
    const response = await restClient.patch(`/tasks/${taskId}`, taskData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async deleteTask(taskId, token) {
    const response = await restClient.delete(`/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.status === 204;
  }
};

module.exports = { restAPI };
