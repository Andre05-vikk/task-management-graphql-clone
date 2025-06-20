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

  // Type resolvers to transform data for REST API compatibility
  User: {
    id: (user) => user.userId || parseInt(user._id.toString().slice(-8), 16)
  },

  Task: {
    // Transformation handled directly in tasks query
  },

  TaskCreationResponse: {
    taskId: (response) => {
      // If taskId is already an integer, return it
      if (typeof response.taskId === 'number') {
        return response.taskId;
      }
      // If taskId is a string (ObjectId), convert to integer
      if (typeof response.taskId === 'string') {
        return parseInt(response.taskId.slice(-8), 16);
      }
      return response.taskId;
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
      // Find user by userId (integer) field, not ObjectId
      return await User.findOne({ userId: parseInt(id) });
    },
    
    // Get all tasks (user-specific, like REST API) with pagination
    tasks: async (_, __, context) => {
      // Authenticate user
      const user = checkAuth(context);
      // Get tasks for the authenticated user only using ObjectId
      const tasks = await Task.find({ userId: user.id });

      // Transform tasks to match REST API format exactly
      const transformedTasks = tasks.map(task => ({
        id: Math.abs(task._id.toString().slice(-8).split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0)),
        title: task.title,
        description: task.description,
        status: task.status,
        user_id: user.userId || Math.abs(user._id.toString().slice(-8).split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0)),
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }));

      // Return in REST API pagination format
      return {
        page: 1,
        limit: 10,
        total: transformedTasks.length,
        tasks: transformedTasks
      };
    },
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
      await User.findByIdAndDelete(id);

      // Return null to match REST 204 No Content
      return null;
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

      // Return task in REST API format with metadata
      return {
        success: true,
        message: "Task created successfully",
        taskId: task._id.toString(), // Use MongoDB ObjectId as string to match GraphQL conventions
        title: task.title,
        description: task.description,
        status: task.status
      };
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
      await Task.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true }
      );

      // Return update response to match REST API format
      return {
        success: true,
        message: 'Task updated successfully'
      };
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
      await Task.findByIdAndDelete(id);
      
      // Return null to match REST 204 No Content
      return null;
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
        token
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
