#!/bin/bash

# Simple run script for Task Management GraphQL Clone
# Starts the GraphQL server and REST API using Docker

cd "$(dirname "$0")"

echo "🚀 Starting Task Management GraphQL Clone"
echo "========================================="

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down >/dev/null 2>&1

# Start services
echo "🚀 Starting services..."
docker-compose up -d

if [ $? -eq 0 ]; then
    echo ""
    echo "⏳ Waiting for services to start..."
    sleep 10
    
    echo ""
    echo "🎉 Services started successfully!"
    echo "================================="
    echo "📍 GraphQL API: http://localhost:4000"
    echo "📍 REST API: http://localhost:5001"
    echo "📍 GraphQL Playground: http://localhost:4000"
    echo ""
    echo "🧪 Run tests: ./tests/test.sh"
    echo "🛑 Stop: docker-compose down"
    echo "================================="
else
    echo "❌ Failed to start services"
    exit 1
fi
