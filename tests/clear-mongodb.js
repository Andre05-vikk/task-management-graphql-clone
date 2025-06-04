const mongoose = require('mongoose');

// Import models to ensure they're defined
const User = require('../src/models/user');
const Task = require('../src/models/task');

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/task-management';

async function clearMongoDB() {
    try {
        console.log(`Connecting to MongoDB at: ${DB_URI}`);
        
        // Connect to MongoDB
        await mongoose.connect(DB_URI);
        console.log('Connected to MongoDB successfully');
        
        // Clear all tasks first (due to references)
        console.log('Counting tasks...');
        const taskCount = await Task.countDocuments();
        console.log(`Found ${taskCount} tasks`);
        
        console.log('Deleting tasks...');
        await Task.deleteMany({});
        console.log(`Deleted ${taskCount} tasks from MongoDB`);
        
        // Clear all users
        console.log('Counting users...');
        const userCount = await User.countDocuments();
        console.log(`Found ${userCount} users`);
        
        console.log('Deleting users...');
        await User.deleteMany({});
        console.log(`Deleted ${userCount} users from MongoDB`);
        
        console.log('MongoDB database cleared successfully');
        
    } catch (err) {
        console.error('Error clearing MongoDB database:', err);
        console.error('Stack trace:', err.stack);
    } finally {
        // Close the connection
        console.log('Closing MongoDB connection...');
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        process.exit(0);
    }
}

console.log('Starting MongoDB cleanup script...');
clearMongoDB();
