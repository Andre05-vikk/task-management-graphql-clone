const { UserInputError, AuthenticationError } = require('apollo-server');
const jwt = require('jsonwebtoken');
const { GraphQLScalarType, Kind } = require('graphql');
const { checkAuth } = require('./context');

// Import models
const User = require('./models/user');
const Task = require('./models/task');

// Resolver functions for GraphQL queries and mutations
const resolvers = {
  // Custom scalar for DateTime
  DateTime: {
    // Serialize Date to ISO String
    serialize(value) {
      return value.toISOString();
    },
    // Parse value to Date
    parseValue(value) {
      return new Date(value);
    },
    // Parse literal to Date
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        return new Date(ast.value);
      }
      return null;
    }
  },

  // Type resolvers
  User: {
    tasks: async (parent) => {
      return await Task.find({ userId: parent.id });
    }
  },
  
  Task: {
    user: async (parent) => {
      return await User.findById(parent.userId);
    }
  },

  // Query resolvers
  Query: {
    // Get all users
    users: async (_, __, context) => {
      // Authenticate user
      checkAuth(context);
      // Return all users
      return await User.find({});
    },
    
    // Get a single user by ID
    user: async (_, { id }, context) => {
      // Authenticate user
      checkAuth(context);
      // Return the user with the specified ID
      return await User.findById(id);
    },
    
    // Get all tasks
    tasks: async (_, __, context) => {
      // Authenticate user
      checkAuth(context);
      // Return all tasks
      return await Task.find({});
    },
    
    // Get a single task by ID
    task: async (_, { id }, context) => {
      // Authenticate user
      checkAuth(context);
      // Return the task with the specified ID
      return await Task.findById(id);
    },
    
    // Get the currently authenticated user
    me: async (_, __, context) => {
      // Authenticate user
      return checkAuth(context);
    }
  },

  // Mutation resolvers
  Mutation: {
    // Create a new user
    createUser: async (_, { input }) => {
      // Check if a user with the same username or email already exists
      const existingUser = await User.findOne({
        $or: [{ username: input.username }, { email: input.email }]
      });
      
      if (existingUser) {
        throw new UserInputError('Username or email already in use');
      }
      
      // Create and save the new user
      const user = new User(input);
      await user.save();
      
      return user;
    },
    
    // Update an existing user
    updateUser: async (_, { id, input }, context) => {
      // Authenticate user
      const authUser = checkAuth(context);
      
      // Check if the authenticated user is trying to update their own account
      // or if they're an admin (you could add an isAdmin field to the User model)
      if (id !== authUser.id.toString()) {
        throw new AuthenticationError('Not authorized to update this user');
      }
      
      // Update the user
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true }
      );
      
      if (!updatedUser) {
        throw new UserInputError('User not found');
      }
      
      return updatedUser;
    },
    
    // Delete a user
    deleteUser: async (_, { id }, context) => {
      // Authenticate user
      const authUser = checkAuth(context);
      
      // Check if the authenticated user is trying to delete their own account
      // or if they're an admin
      if (id !== authUser.id.toString()) {
        throw new AuthenticationError('Not authorized to delete this user');
      }
      
      // Delete the user and their tasks
      await Task.deleteMany({ userId: id });
      const result = await User.findByIdAndDelete(id);
      
      return !!result; // Return true if user was deleted, false otherwise
    },
    
    // Create a new task
    createTask: async (_, { input }, context) => {
      // Authenticate user
      const user = checkAuth(context);
      
      // Create and save the new task
      const task = new Task({
        ...input,
        userId: user.id
      });
      
      await task.save();
      return task;
    },
    
    // Update an existing task
    updateTask: async (_, { id, input }, context) => {
      // Authenticate user
      const user = checkAuth(context);
      
      // Find the task
      const task = await Task.findById(id);
      
      if (!task) {
        throw new UserInputError('Task not found');
      }
      
      // Check if the authenticated user owns this task
      if (task.userId.toString() !== user.id.toString()) {
        throw new AuthenticationError('Not authorized to update this task');
      }
      
      // Update the task
      const updatedTask = await Task.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true }
      );
      
      return updatedTask;
    },
    
    // Delete a task
    deleteTask: async (_, { id }, context) => {
      // Authenticate user
      const user = checkAuth(context);
      
      // Find the task
      const task = await Task.findById(id);
      
      if (!task) {
        throw new UserInputError('Task not found');
      }
      
      // Check if the authenticated user owns this task
      if (task.userId.toString() !== user.id.toString()) {
        throw new AuthenticationError('Not authorized to delete this task');
      }
      
      // Delete the task
      const result = await Task.findByIdAndDelete(id);
      
      return !!result; // Return true if task was deleted, false otherwise
    },
    
    // User login
    login: async (_, { input }) => {
      const { email, password } = input;
      
      // Find the user by email
      const user = await User.findOne({ email });
      
      if (!user) {
        throw new UserInputError('Invalid email or password');
      }
      
      // Check if the password is correct
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        throw new UserInputError('Invalid email or password');
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );
      
      return {
        token,
        user
      };
    },
    
    // User logout
    logout: async (_, __, context) => {
      // In GraphQL, logout is typically handled on the client side by removing the token
      // But we can still check if the user is authenticated
      checkAuth(context);
      
      // Return true to indicate successful logout
      return true;
    }
  }
};

module.exports = resolvers;
