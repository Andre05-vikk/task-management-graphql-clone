#!/bin/bash

# Change to the project root directory
cd "$(dirname "$0")/.."

echo "Validating GraphQL schema..."
npx graphql validate schema/schema.graphql
