const { ApolloServer } = require('apollo-server');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Import type definitions (schema)
const typeDefs = fs.readFileSync(
  path.join(__dirname, '../schema/schema.graphql'),
  'utf8'
);

// Import resolvers
const resolvers = require('./resolvers');

// Import context function
const { createContext } = require('./context');

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: createContext,
  formatError: (err) => {
    // Don't expose internal server errors to clients in production
    if (err.extensions?.code === 'INTERNAL_SERVER_ERROR') {
      console.error('Internal server error:', err);
      return new Error('Internal server error');
    }
    
    // Format the error and return it
    return {
      message: err.message,
      path: err.path,
      extensions: err.extensions
    };
  }
});

// Connect to database and start server
const PORT = process.env.PORT || 4000;
const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/task-management';

mongoose
  .connect(DB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    return server.listen(PORT);
  })
  .then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  })
  .catch((err) => {
    console.error('Error starting server:', err);
  });
