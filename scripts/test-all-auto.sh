#!/bin/bash

# Automated test script - starts both APIs, runs tests, and stops APIs
# Non-interactive version for CI/CD

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
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
    
    print_status "Waiting for $name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            print_success "$name is ready!"
            return 0
        fi
        
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$name failed to start within timeout"
    return 1
}

# Function to cleanup processes
cleanup() {
    print_status "Cleaning up processes..."
    
    if [ ! -z "$REST_PID" ]; then
        kill $REST_PID 2>/dev/null
        wait $REST_PID 2>/dev/null
    fi
    
    if [ ! -z "$GRAPHQL_PID" ]; then
        kill $GRAPHQL_PID 2>/dev/null
        wait $GRAPHQL_PID 2>/dev/null
    fi
    
    print_success "Cleanup completed"
}

# Set up trap to cleanup on exit
trap cleanup EXIT

# Main script
echo -e "${BLUE}🚀 Automated API Equivalence Test Suite${NC}"
echo "=============================================="

# Change to project root
cd "$(dirname "$0")/.."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
fi

# Check if REST API directory exists
if [ ! -d "notion-clone-api" ]; then
    print_error "REST API directory 'notion-clone-api' not found!"
    exit 1
fi

# Install REST API dependencies if needed
if [ ! -d "notion-clone-api/node_modules" ]; then
    print_status "Installing REST API dependencies..."
    cd notion-clone-api
    npm install
    cd ..
fi

print_status "Starting APIs..."

# Start REST API
print_status "Starting REST API on port 5001..."
cd notion-clone-api
npm start > /tmp/rest-api.log 2>&1 &
REST_PID=$!
cd ..

# Start GraphQL API
print_status "Starting GraphQL API on port 4000..."
npm start > /tmp/graphql-api.log 2>&1 &
GRAPHQL_PID=$!

# Wait for both APIs to be ready
if ! wait_for_api "http://localhost:5001" "REST API"; then
    print_error "REST API failed to start"
    echo "REST API logs:"
    cat /tmp/rest-api.log
    exit 1
fi

if ! wait_for_api "http://localhost:4000" "GraphQL API"; then
    print_error "GraphQL API failed to start"
    echo "GraphQL API logs:"
    cat /tmp/graphql-api.log
    exit 1
fi

# Give APIs a moment to stabilize
print_status "APIs stabilizing..."
sleep 5

print_success "Both APIs are running successfully!"

# Run tests
print_status "Running equivalence tests..."
echo "=============================================="

TEST_FAILED=0

# Run basic equivalence tests
echo -e "${YELLOW}📋 Running Basic Equivalence Tests...${NC}"
if npm run test:basic; then
    print_success "Basic equivalence tests passed!"
else
    print_error "Basic equivalence tests failed!"
    TEST_FAILED=1
fi

# Run full equivalence tests
echo -e "${YELLOW}📋 Running Full Equivalence Tests...${NC}"
if npm run test:equivalence; then
    print_success "Full equivalence tests passed!"
else
    print_error "Full equivalence tests failed!"
    TEST_FAILED=1
fi

# Note: GraphQL-only tests removed as they were using outdated schema

echo ""
echo "=============================================="

if [ $TEST_FAILED -eq 0 ]; then
    print_success "🎉 ALL TESTS PASSED SUCCESSFULLY!"
    echo ""
    echo "📊 Test Summary:"
    echo "   ✅ Basic Equivalence Tests"
    echo "   ✅ Full Equivalence Tests"
    echo ""
    print_success "Functional equivalence between REST and GraphQL APIs confirmed!"
    exit 0
else
    print_error "❌ SOME TESTS FAILED!"
    exit 1
fi
