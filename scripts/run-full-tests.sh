#!/bin/bash

# Full automated test script - starts both APIs and runs equivalence tests

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

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
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
        
        echo "   Attempt $attempt/$max_attempts..."
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
        print_status "Stopping REST API (PID: $REST_PID)..."
        kill $REST_PID 2>/dev/null
        wait $REST_PID 2>/dev/null
    fi
    
    if [ ! -z "$GRAPHQL_PID" ]; then
        print_status "Stopping GraphQL API (PID: $GRAPHQL_PID)..."
        kill $GRAPHQL_PID 2>/dev/null
        wait $GRAPHQL_PID 2>/dev/null
    fi
    
    print_success "Cleanup completed"
}

# Set up trap to cleanup on exit
trap cleanup EXIT

# Main script
echo -e "${BLUE}🚀 Starting Full API Equivalence Test Suite${NC}"
echo "=================================================="

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
npm start &
REST_PID=$!
cd ..

# Wait a moment for REST API to start
sleep 3

# Start GraphQL API
print_status "Starting GraphQL API on port 4000..."
npm start &
GRAPHQL_PID=$!

# Wait for both APIs to be ready
print_status "Waiting for APIs to be ready..."

if ! wait_for_api "http://localhost:5001" "REST API"; then
    print_error "REST API failed to start"
    exit 1
fi

if ! wait_for_api "http://localhost:4000" "GraphQL API"; then
    print_error "GraphQL API failed to start"
    exit 1
fi

# Give APIs a moment to stabilize
print_status "APIs stabilizing..."
sleep 5

print_success "Both APIs are running successfully!"
echo ""
echo "🔗 REST API: http://localhost:5001"
echo "🔗 GraphQL API: http://localhost:4000"
echo ""

# Run tests
print_status "Running equivalence tests..."
echo "=================================================="

# Run basic equivalence tests
echo -e "${YELLOW}📋 Running Basic Equivalence Tests...${NC}"
if npm run test:basic; then
    print_success "Basic equivalence tests passed!"
else
    print_error "Basic equivalence tests failed!"
    exit 1
fi

echo ""

# Run full equivalence tests
echo -e "${YELLOW}📋 Running Full Equivalence Tests...${NC}"
if npm run test:equivalence; then
    print_success "Full equivalence tests passed!"
else
    print_error "Full equivalence tests failed!"
    exit 1
fi

echo ""

# Run GraphQL-only tests
echo -e "${YELLOW}📋 Running GraphQL API Tests...${NC}"
if npm run test:graphql; then
    print_success "GraphQL API tests passed!"
else
    print_error "GraphQL API tests failed!"
    exit 1
fi

echo ""
echo "=================================================="
print_success "🎉 ALL TESTS PASSED SUCCESSFULLY!"
echo ""
echo "📊 Test Summary:"
echo "   ✅ Basic Equivalence Tests"
echo "   ✅ Full Equivalence Tests" 
echo "   ✅ GraphQL API Tests"
echo ""
echo "🔍 APIs tested:"
echo "   ✅ REST API (http://localhost:5001)"
echo "   ✅ GraphQL API (http://localhost:4000)"
echo ""
print_success "Functional equivalence between REST and GraphQL APIs confirmed!"

# Keep APIs running for manual testing if desired
echo ""
read -p "Keep APIs running for manual testing? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "APIs will continue running. Press Ctrl+C to stop."
    echo "🔗 REST API: http://localhost:5001"
    echo "🔗 GraphQL API: http://localhost:4000"
    echo "🔗 GraphQL Playground: http://localhost:4000"
    
    # Wait for user interrupt
    wait
else
    print_status "Stopping APIs..."
fi
