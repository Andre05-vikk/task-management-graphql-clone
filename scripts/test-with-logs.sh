#!/bin/bash

# Test script with detailed console logs for API visualization
set -e

echo "🚀 API Equivalence Tests with Detailed Logging"
echo "=============================================="

# Start REST API in background
echo "[$(date +'%H:%M:%S')] Starting REST API on port 5001..."
cd notion-clone-api
npm start > /dev/null 2>&1 &
REST_PID=$!
cd ..

# Start GraphQL API in background  
echo "[$(date +'%H:%M:%S')] Starting GraphQL API on port 4000..."
npm start > /dev/null 2>&1 &
GRAPHQL_PID=$!

# Function to cleanup processes
cleanup() {
    echo "[$(date +'%H:%M:%S')] Cleaning up processes..."
    kill $REST_PID $GRAPHQL_PID 2>/dev/null || true
    sleep 2
    echo "✅ Cleanup completed"
}

# Set trap for cleanup
trap cleanup EXIT

# Wait for REST API to be ready
echo "[$(date +'%H:%M:%S')] Waiting for REST API to be ready..."
timeout=30
count=0
while ! curl -s http://localhost:5001/health > /dev/null 2>&1; do
    sleep 1
    count=$((count + 1))
    if [ $count -gt $timeout ]; then
        echo "❌ REST API failed to start"
        exit 1
    fi
done
echo "✅ REST API is ready!"

# Wait for GraphQL API to be ready
echo "[$(date +'%H:%M:%S')] Waiting for GraphQL API to be ready..."
count=0
while ! curl -s http://localhost:4000 > /dev/null 2>&1; do
    sleep 1
    count=$((count + 1))
    if [ $count -gt $timeout ]; then
        echo "❌ GraphQL API failed to start"
        exit 1
    fi
done
echo "✅ GraphQL API is ready!"

# Let APIs stabilize
echo "[$(date +'%H:%M:%S')] APIs stabilizing..."
sleep 5
echo "✅ Both APIs are running successfully!"

echo "[$(date +'%H:%M:%S')] Running tests with detailed logging..."
echo "=============================================="

# Run tests with console output enabled
npx jest tests/basic-equivalence.test.js --verbose --silent=false --no-coverage

echo ""
echo "=============================================="
echo "✅ Tests completed with detailed API logs!"
