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
    
    // Get all tasks (user-specific, like REST API)
    tasks: async (_, __, context) => {
      // Authenticate user
      const user = checkAuth(context);
      // Return tasks for the authenticated user only
      return await Task.find({ userId: user.id });
    },
    
    // Get a single task by ID (user-specific)
    task: async (_, { id }, context) => {
      // Authenticate user
      const user = checkAuth(context);
      // Return the task only if it belongs to the authenticated user
      return await Task.findOne({ _id: id, userId: user.id });
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
      const { email, password } = input;

      // Validate input
      if (!email || !password) {
        throw new UserInputError('Email and password are required');
      }

      if (password.length < 6) {
        throw new UserInputError('Password must be at least 6 characters long');
      }

      // Check if a user with the same email already exists
      const existingUser = await User.findOne({
        $or: [{ username: email }, { email: email }]
      });

      if (existingUser) {
        throw new UserInputError('Email already exists');
      }

      // Create and save the new user (username = email to match REST API)
      const user = new User({
        username: email,
        email: email,
        password: password
      });
      await user.save();

      return user;
    },
    
    // Update an existing user
    updateUser: async (_, { id, input }, context) => {
      // Authenticate user
      const authUser = checkAuth(context);

      // Check if the authenticated user is trying to update their own account
      if (id !== authUser.id.toString()) {
        throw new AuthenticationError('You can only update your own account');
      }

      const { password } = input;

      // Validate password
      if (!password || password.length < 6) {
        throw new UserInputError('Password must be at least 6 characters long');
      }

      // Update the user with new password
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: { password: password } },
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
      if (id !== authUser.id.toString()) {
        throw new AuthenticationError('You can only delete your own account');
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
        throw new UserInputError('Task not found or you do not have permission');
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
        throw new UserInputError('Task not found or you do not have permission');
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
      
      // Generate JWT token (match REST API format)
      const token = jwt.sign(
        { id: user.id, email: user.username },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
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
