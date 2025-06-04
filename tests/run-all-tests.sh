#!/bin/bash

echo "🧪 Running All Organized Tests"
echo "==============================="
echo ""

# Check if APIs are running
echo "🔍 Checking API availability..."
if ! curl -s http://localhost:5001/health > /dev/null 2>&1; then
    echo "❌ REST API not available on port 5001"
    echo "   Please start with: cd notion-clone-api && npm start"
    exit 1
fi

if ! curl -s http://localhost:4000 > /dev/null 2>&1; then
    echo "❌ GraphQL API not available on port 4000"
    echo "   Please start with: npm start"
    exit 1
fi

echo "✅ Both APIs are running"
echo ""

# Run user lifecycle test
echo "🔄 Running User Lifecycle Test..."
echo "=================================="
cd tests && node test-user-lifecycle.js
echo ""

# Run basic equivalence tests
echo "🎯 Running Basic Equivalence Tests..."
echo "====================================="
cd .. && npm run test:basic
echo ""

echo "🎉 All organized tests completed successfully!"
echo ""
echo "📂 Test Files Structure:"
echo "   tests/"
echo "   ├── test-user-lifecycle.js     - User create/delete/verify test"
echo "   ├── basic-equivalence.test.js  - Core API equivalence tests"
echo "   ├── api-equivalence.test.js    - Comprehensive equivalence tests"
echo "   ├── rest-client.js            - REST API client functions"
echo "   ├── graphql-client.js          - GraphQL API client functions"
echo "   ├── clear-mongodb.js           - MongoDB database cleanup script"
echo "   ├── clear-all-databases.sh     - Combined database cleanup script"
echo "   └── README.md                  - Testing documentation"
echo ""
echo "🧹 Database Cleanup:"
echo "   - Run: ./clear-all-databases.sh (clears both MySQL and MongoDB)"
echo "   - Run: node clear-mongodb.js (clears only MongoDB)"
