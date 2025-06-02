#!/bin/bash

# Change to the project root directory
cd "$(dirname "$0")/.."

# Function to check if a port is in use
check_port() {
  local port=$1
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    return 0  # Port is in use
  else
    return 1  # Port is free
  fi
}

# Function to check if Docker is running
check_docker() {
  if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
  fi
}

# Function to wait for service to be ready
wait_for_service() {
  local url=$1
  local service_name=$2
  local max_attempts=30
  local attempt=1
  
  echo "⏳ Waiting for $service_name to be ready..."
  
  while [ $attempt -le $max_attempts ]; do
    if curl -s "$url" >/dev/null 2>&1; then
      echo "✅ $service_name is ready!"
      return 0
    fi
    echo "Attempt $attempt/$max_attempts - waiting..."
    sleep 2
    attempt=$((attempt + 1))
  done
  
  echo "❌ $service_name failed to start after $max_attempts attempts"
  return 1
}

echo "🚀 Task Management GraphQL Clone - One Command Setup"
echo "=================================================="

# Check if user wants Docker or manual setup
if [ "$1" = "--manual" ] || [ "$1" = "-m" ]; then
  echo "📦 Manual setup selected"
  
  # Check if ports are in use
  if check_port 4000; then
    echo "❌ Port 4000 is already in use. Please stop the service or use Docker setup."
    exit 1
  fi
  
  # Install dependencies if needed
  if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
  fi
  
  echo "🚀 Starting GraphQL server..."
  echo "📍 GraphQL API will be available at: http://localhost:4000"
  echo "🎮 GraphQL Playground will be available at: http://localhost:4000"
  echo ""
  echo "ℹ️  Note: For full functionality including REST API and tests,"
  echo "   use Docker setup: ./scripts/run.sh --docker"
  echo ""
  npm start
  
else
  echo "🐳 Docker setup selected (recommended)"
  
  # Check if Docker is running
  check_docker
  
  # Stop existing containers if running
  echo "🛑 Stopping any existing containers..."
  docker-compose down >/dev/null 2>&1
  
  # Start all services with Docker
  echo "🚀 Starting all services with Docker..."
  docker-compose up -d
  
  if [ $? -eq 0 ]; then
    echo ""
    echo "⏳ Services are starting up..."
    
    # Wait for services to be ready
    if wait_for_service "http://localhost:4000" "GraphQL API" && \
       wait_for_service "http://localhost:5001" "REST API"; then
      
      echo ""
      echo "🎉 All services are running successfully!"
      echo "=================================================="
      echo "📍 Available services:"
      echo "   • GraphQL API: http://localhost:4000"
      echo "   • REST API: http://localhost:5001"
      echo "   • GraphQL Playground: http://localhost:4000"
      echo ""
      echo "🧪 Run tests:"
      echo "   npm run test:auto    # Automated test suite"
      echo "   npm run test:basic   # Basic equivalence tests"
      echo ""
      echo "🛑 Stop services:"
      echo "   docker-compose down"
      echo ""
      echo "📊 View logs:"
      echo "   docker-compose logs -f"
      echo "=================================================="
    else
      echo "❌ Some services failed to start. Check logs with: docker-compose logs"
      exit 1
    fi
  else
    echo "❌ Failed to start Docker containers"
    exit 1
  fi
fi
