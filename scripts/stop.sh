#!/bin/bash

# Change to the project root directory
cd "$(dirname "$0")/.."

echo "🛑 Stopping Task Management GraphQL Clone services..."

# Stop Docker containers
if docker-compose ps -q >/dev/null 2>&1; then
  echo "🐳 Stopping Docker containers..."
  docker-compose down
  echo "✅ Docker containers stopped"
else
  echo "ℹ️  No Docker containers running"
fi

# Stop any manually running Node.js processes
if pgrep -f "node src/index.js" >/dev/null 2>&1; then
  echo "🚫 Stopping manually started GraphQL server..."
  pkill -f "node src/index.js"
  echo "✅ GraphQL server stopped"
else
  echo "ℹ️  No manual GraphQL server running"
fi

echo "🎉 All services stopped successfully!"
