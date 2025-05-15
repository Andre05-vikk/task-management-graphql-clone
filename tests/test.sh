#!/bin/bash

# Change to the project root directory
cd "$(dirname "$0")/.."

# Check if the server is running
if ! curl -s http://localhost:4000 > /dev/null; then
  echo "Starting GraphQL server..."
  npm start &
  SERVER_PID=$!
  # Wait for server to start
  sleep 5
  echo "Server started with PID: $SERVER_PID"
else
  echo "Server is already running"
fi

# Run the tests
echo "Running tests..."
node tests/api.test.js

# If we started the server, shut it down
if [ -n "$SERVER_PID" ]; then
  echo "Shutting down server..."
  kill $SERVER_PID
fi
