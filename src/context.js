const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server');
const User = require('./models/user');

// Create context object for each request
const createContext = async ({ req }) => {
  // Get the auth token from the headers
  const token = req?.headers?.authorization || '';
  
  // If no token, return empty context
  if (!token.startsWith('Bearer ')) {
    return { user: null };
  }
  
  try {
    // Verify the token
    const decoded = jwt.verify(
      token.replace('Bearer ', ''),
      process.env.JWT_SECRET || 'your-secret-key'
    );

    // Find the user (decoded.id instead of decoded.userId to match REST API)
    const user = await User.findById(decoded.id);

    // Return the user in the context
    return { user };
  } catch (err) {
    // Invalid token
    return { user: null };
  }
};

// Helper function for protected resolvers
const checkAuth = (context) => {
  if (!context.user) {
    throw new AuthenticationError('Authentication required');
  }
  return context.user;
};

module.exports = {
  createContext,
  checkAuth
};
