#!/bin/bash

# Script to run both APIs for testing

echo "🚀 Starting API Equivalence Tests"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to wait for API to be ready
wait_for_api() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for $name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $name is ready!${NC}"
            return 0
        fi
        
        echo "   Attempt $attempt/$max_attempts..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $name failed to start within timeout${NC}"
    return 1
}

# Check if REST API is running
if check_port 3000; then
    echo -e "${GREEN}✅ REST API is already running on port 3000${NC}"
else
    echo -e "${YELLOW}⚠️  REST API is not running on port 3000${NC}"
    echo "Please start the REST API first:"
    echo "cd notion-clone-api && npm start"
    exit 1
fi

# Check if GraphQL API is running
if check_port 4000; then
    echo -e "${GREEN}✅ GraphQL API is already running on port 4000${NC}"
else
    echo -e "${YELLOW}🚀 Starting GraphQL API...${NC}"
    # Start GraphQL API in background
    npm start &
    GRAPHQL_PID=$!
    
    # Wait for GraphQL API to be ready
    if ! wait_for_api "http://localhost:4000" "GraphQL API"; then
        echo -e "${RED}❌ Failed to start GraphQL API${NC}"
        kill $GRAPHQL_PID 2>/dev/null
        exit 1
    fi
fi

# Wait a bit more to ensure both APIs are stable
echo "⏳ Waiting for APIs to stabilize..."
sleep 3

# Run the equivalence tests
echo -e "${YELLOW}🧪 Running API Equivalence Tests...${NC}"
npm run test:equivalence

# Capture test exit code
TEST_EXIT_CODE=$?

# Clean up GraphQL API if we started it
if [ ! -z "$GRAPHQL_PID" ]; then
    echo "🧹 Cleaning up GraphQL API..."
    kill $GRAPHQL_PID 2>/dev/null
    wait $GRAPHQL_PID 2>/dev/null
fi

# Report results
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}🎉 All API equivalence tests passed!${NC}"
else
    echo -e "${RED}❌ Some tests failed${NC}"
fi

exit $TEST_EXIT_CODE
