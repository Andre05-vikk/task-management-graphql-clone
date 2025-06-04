#!/bin/bash

echo "🧹 Clearing both REST (MySQL) and GraphQL (MongoDB) databases..."
echo ""

echo "📊 Clearing MySQL database (REST API)..."
cd ../notion-clone-api && node clear-db.js
echo ""

echo "📊 Clearing MongoDB database (GraphQL API)..."
cd ../tests && node clear-mongodb.js
echo ""

echo "✅ Both databases have been cleared successfully!"
echo "   - MySQL: All users and tasks deleted, auto-increment counters reset"
echo "   - MongoDB: All users and tasks deleted"
