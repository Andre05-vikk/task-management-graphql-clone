# API Equivalence Testing Documentation

This document describes the implementation of automated tests that prove functional equivalence between the REST API and GraphQL API.

## Overview

The GraphQL API has been modified to match the REST API functionality exactly, ensuring both APIs provide identical business logic and behavior.

## Changes Made to GraphQL API

### 1. Task Status Enumeration
- **Changed from**: `['TO_DO', 'IN_PROGRESS', 'DONE']`
- **Changed to**: `['pending', 'in_progress', 'completed']`
- **Files modified**: `schema/schema.graphql`, `src/models/task.js`

### 2. User Creation Process
- **Changed from**: Separate `username`, `email`, `password` fields
- **Changed to**: Only `email` and `password` (username = email)
- **Files modified**: `schema/schema.graphql`, `src/resolvers.js`

### 3. User Update Functionality
- **Changed from**: All user fields updateable
- **Changed to**: Only password updates allowed
- **Files modified**: `schema/schema.graphql`, `src/resolvers.js`

### 4. JWT Token Structure
- **Changed from**: `{ userId: user.id }`
- **Changed to**: `{ id: user.id, email: user.username }`
- **Files modified**: `src/resolvers.js`, `src/context.js`

### 5. Token Expiration
- **Changed from**: 1 hour
- **Changed to**: 7 days (matching REST API)
- **Files modified**: `src/resolvers.js`

### 6. Task Access Control
- **Changed from**: All tasks visible to all users
- **Changed to**: Users can only see their own tasks
- **Files modified**: `src/resolvers.js`

### 7. Error Messages
- **Standardized**: Error messages to match REST API responses
- **Files modified**: `src/resolvers.js`

## Test Implementation

### Test Files Created

1. **`tests/rest-client.js`**
   - REST API client functions
   - Handles all REST endpoints with proper authentication

2. **`tests/graphql-client.js`**
   - GraphQL API client functions
   - Handles all GraphQL operations with proper authentication

3. **`tests/api-equivalence.test.js`**
   - Comprehensive equivalence tests
   - Tests all major operations in both APIs
   - Compares results and behavior

4. **`tests/basic-equivalence.test.js`**
   - Simplified equivalence tests
   - Focuses on core functionality
   - Better error handling and cleanup

5. **`tests/setup.js`**
   - Jest test configuration
   - Global test setup and teardown

6. **`jest.config.js`**
   - Jest configuration file
   - Test environment and timeout settings

### Test Scripts

1. **`scripts/test-apis.sh`**
   - Automated script to run both APIs
   - Waits for APIs to be ready
   - Runs equivalence tests
   - Handles cleanup

### Package.json Scripts

- `npm run test:equivalence` - Run full equivalence tests
- `npm run test:basic` - Run basic equivalence tests
- `npm run test:graphql` - Run GraphQL-only tests
- `npm run test:apis` - Run complete test suite with API startup
- `npm test` - Run all tests

## Test Coverage

### User Management
- ✅ User creation with email/password
- ✅ User authentication (login)
- ✅ User retrieval (all users, by ID)
- ✅ User updates (password only)
- ✅ User deletion (own account only)
- ✅ Current user info (me query)

### Task Management
- ✅ Task creation with proper status values
- ✅ Task retrieval (user-specific)
- ✅ Task updates with authorization
- ✅ Task deletion with authorization
- ✅ Task status validation

### Authentication & Authorization
- ✅ JWT token generation and validation
- ✅ Token-based authentication
- ✅ User-specific data access
- ✅ Proper authorization checks

### Error Handling
- ✅ Invalid login credentials
- ✅ Duplicate user creation
- ✅ Unauthorized access attempts
- ✅ Invalid token handling
- ✅ Resource not found errors

## Running the Tests

### Prerequisites
1. REST API running on port 3000
2. MongoDB available for GraphQL API
3. MariaDB available for REST API

### Quick Start
```bash
# Install dependencies
npm install

# Run basic equivalence tests
npm run test:basic

# Run full equivalence tests
npm run test:equivalence

# Run complete test suite (starts GraphQL API automatically)
npm run test:apis
```

### Manual Testing
```bash
# Start REST API (in notion-clone-api directory)
cd notion-clone-api && npm start

# Start GraphQL API (in project root)
npm start

# Run tests (in another terminal)
npm run test:equivalence
```

## Test Results Interpretation

The tests prove functional equivalence by:

1. **Identical Operations**: Same operations work in both APIs
2. **Consistent Data**: Similar data structures and responses
3. **Equivalent Behavior**: Same business logic and validation
4. **Error Consistency**: Similar error handling and messages
5. **Authentication Parity**: Compatible token-based authentication

## Conclusion

The implemented tests demonstrate that the GraphQL API provides functionally equivalent capabilities to the REST API, ensuring that both APIs can be used interchangeably for the same business requirements.
