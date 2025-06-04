# Testing Documentation

This directory contains comprehensive automated tests that prove functional equivalence between the REST API and GraphQL API implementations.

## Test Overview

The testing suite validates that the GraphQL API provides identical functionality to the existing REST API through three main test categories:

1. **Basic Equivalence Tests** - Core functionality comparison
2. **Full Equivalence Tests** - Comprehensive feature comparison

## Test Files

### Core Test Files

- **`basic-equivalence.test.js`** - Simplified equivalence tests focusing on core operations
- **`api-equivalence.test.js`** - Comprehensive tests covering all API features
- **`test-user-lifecycle.js`** - User lifecycle test (create → delete → verify deletion)

### Support Files

- **`rest-client.js`** - REST API client with all endpoint functions
- **`graphql-client.js`** - GraphQL API client with all query/mutation functions
- **`setup.js`** - Jest test configuration and global setup
- **`test.sh`** - Legacy test script for manual execution

### Database Cleanup Scripts

- **`clear-mongodb.js`** - MongoDB database cleanup script (removes all users and tasks)
- **`clear-all-databases.sh`** - Combined cleanup script for both MySQL and MongoDB databases

## Running Tests

### Quick Test Commands

```bash
# 🚀 RECOMMENDED: Automated full test suite
npm run test:auto

# Interactive full test suite (asks to keep APIs running)
npm run test:full

# Run basic equivalence tests (requires APIs running)
npm run test:basic

# Run comprehensive equivalence tests (requires APIs running)
npm run test:equivalence

# Run all tests (requires APIs running)
npm test
```

### Manual Test Execution

```bash
# Run user lifecycle test (requires APIs running)
cd tests && node test-user-lifecycle.js

# Direct Jest execution
npx jest tests/basic-equivalence.test.js --verbose
```

### Database Cleanup

```bash
# Clear both databases (MySQL + MongoDB)
cd tests && ./clear-all-databases.sh

# Clear only MongoDB
cd tests && node clear-mongodb.js

# Clear only MySQL
cd notion-clone-api && node clear-db.js
```

## Test Requirements

### Prerequisites

1. **REST API** running on port 5001
2. **MongoDB** available for GraphQL API
3. **MariaDB** available for REST API
4. **Node.js** v16+ with npm

### Environment Setup

```bash
# Start REST API (in notion-clone-api directory)
cd notion-clone-api && npm start

# Start GraphQL API (in project root)
npm start

# Run tests (in another terminal)
npm run test:equivalence
```

## Test Coverage

### User Management Tests
- ✅ User registration (email/password)
- ✅ User authentication (login/logout)
- ✅ User retrieval (all users, by ID, current user)
- ✅ User updates (password changes)
- ✅ User deletion (own account)

### Task Management Tests
- ✅ Task creation with status validation
- ✅ Task retrieval (user-specific filtering)
- ✅ Task updates with authorization
- ✅ Task deletion with authorization
- ✅ Task status enum validation

### Authentication & Authorization Tests
- ✅ JWT token generation and validation
- ✅ Token-based API access
- ✅ User-specific data isolation
- ✅ Unauthorized access prevention

### Error Handling Tests
- ✅ Invalid login credentials
- ✅ Duplicate user creation attempts
- ✅ Unauthorized API access
- ✅ Invalid token handling
- ✅ Resource not found scenarios

### Data Validation Tests
- ✅ Input validation consistency
- ✅ Business rule enforcement
- ✅ Error message standardization
- ✅ Response format consistency

## Test Architecture

### Equivalence Testing Strategy

The tests prove functional equivalence by:

1. **Parallel Execution** - Same operations run on both APIs
2. **Result Comparison** - Responses normalized and compared
3. **Behavior Validation** - Business logic consistency verified
4. **Error Consistency** - Error handling matches between APIs

### Data Normalization

Tests handle differences in data formats:
- **ID Types**: REST uses numbers, GraphQL uses strings
- **Response Structure**: Different wrapping but same core data
- **Timestamps**: Ignored for comparison due to timing differences
- **Field Names**: Mapped between different naming conventions

### Test Isolation

Each test:
- Uses unique test data to avoid conflicts
- Cleans up created resources
- Handles API startup/shutdown gracefully
- Provides detailed error reporting

## Test Results Interpretation

### Success Criteria

Tests pass when:
- ✅ Both APIs return successful responses
- ✅ Core data matches after normalization
- ✅ Business logic behaves identically
- ✅ Error conditions trigger same responses

### Common Issues

- **Port Conflicts**: Ensure APIs run on correct ports (REST: 5001, GraphQL: 4000)
- **Database Connectivity**: Verify MongoDB and MariaDB are accessible
- **Timing Issues**: Tests include appropriate delays for API startup
- **Data Conflicts**: Tests use random data to avoid collisions

## Continuous Integration

The test suite is designed for CI/CD integration:

```bash
# CI-friendly test execution
npm ci                    # Clean dependency install
npm run test:apis        # Full test suite with API management
```

## Troubleshooting

### Common Problems

1. **API Not Running**: Check if REST API is on port 5001
2. **Database Issues**: Verify MongoDB/MariaDB connectivity
3. **Port Conflicts**: Ensure ports 4000 and 5001 are available
4. **Timeout Errors**: Increase test timeout in Jest config

### Debug Mode

```bash
# Run tests with verbose output
npm run test:basic -- --verbose

# Run specific test file
npx jest tests/basic-equivalence.test.js --detectOpenHandles
```

## Contributing

When adding new tests:

1. Follow existing naming conventions
2. Include both REST and GraphQL variants
3. Add proper cleanup in `afterAll` blocks
4. Use descriptive test names and error messages
5. Update this documentation for new test categories
