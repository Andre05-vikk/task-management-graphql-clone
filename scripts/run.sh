#!/bin/bash

# Change to the project root directory
cd "$(dirname "$0")/.."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Run the server
echo "Starting GraphQL server..."
npm start
