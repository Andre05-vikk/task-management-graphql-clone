# Task Management GraphQL Clone

This project provides a GraphQL implementation of an existing task management REST API. It demonstrates functional equivalence between REST and GraphQL architectures by offering identical functionality through a GraphQL interface.

## Project Goal

Create a GraphQL clone of an existing REST API that:
- Models REST endpoints as GraphQL queries and mutations using Schema Definition Language (SDL)
- Implements identical business logic, data validation, and error handling
- Provides functional equivalence proven by automated tests
- Follows GraphQL best practices and conventions

## Features

The GraphQL API provides equivalent functionality to the REST API:
- **Authentication**: Login/logout with JWT tokens
- **User Management**: Create, read, update, delete users
- **Task Management**: CRUD operations for tasks with proper authorization
- **Error Handling**: Consistent error responses and validation
- **Data Validation**: Input validation matching REST API business rules

## GraphQL vs REST Endpoints Mapping

| REST Endpoint                | HTTP Method | GraphQL Operation              |
|-----------------------------:|-------------|--------------------------------|
| `/auth`                      | POST        | `mutation login`               |
| `/auth`                      | DELETE      | `mutation logout`              |
| `/users`                     | POST        | `mutation createUser`          |
| `/users`                     | GET         | `query users`                  |
| `/users/{userId}`            | GET         | `query user(id)`               |
| `/users/{userId}`            | DELETE      | `mutation deleteUser(id)`      |
| `/users/{userId}`            | PATCH       | `mutation updateUser(id)`      |
| `/tasks`                     | GET         | `query tasks`                  |
| `/tasks`                     | POST        | `mutation createTask`          |
| `/tasks/{taskId}`            | DELETE      | `mutation deleteTask(id)`      |
| `/tasks/{taskId}`            | PATCH       | `mutation updateTask(id)`      |

## Project Structure

```
├── schema/            # GraphQL schema definition files
├── src/               # Source code for the GraphQL server
├── scripts/run.sh     # Script to build and run the server
├── client/example.js  # Example client script for API interaction
├── tests/test.sh      # Automated tests comparing REST and GraphQL responses
├── docker-compose.yml # Docker Compose configuration
├── Dockerfile         # Docker configuration for GraphQL server
└── README.md          # This file
```

## Requirements

- Node.js (v16 or higher)
- npm (v8 or higher)
- Docker and Docker Compose (for containerized setup)

## Quick Start

### One-Command Setup
```bash
./scripts/run.sh
```
This script will:
1. Install dependencies if needed
2. Start the GraphQL server on port 4000

### Manual Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The GraphQL server will be available at `http://localhost:4000` with GraphQL Playground for interactive queries.

### Using Docker

1. Build and start the containers:
```
docker-compose up -d
```

2. Stop the containers:
```
docker-compose down
```

To view logs:
```
docker-compose logs -f
```

## Testing

The project includes comprehensive automated tests to verify both GraphQL API functionality and equivalence with the REST API:

### GraphQL API Tests
```bash
npm run test:graphql
```

### API Equivalence Tests
```bash
npm run test:equivalence
```

### Complete Test Suite (Both APIs)
```bash
npm run test:apis
```

### Automated Full Test Suite (Recommended)
```bash
npm run test:auto
```
This command automatically:
1. Starts both REST and GraphQL APIs
2. Waits for them to be ready
3. Runs all equivalence tests
4. Stops the APIs when done

### Interactive Full Test Suite
```bash
npm run test:full
```
Same as above but asks if you want to keep APIs running for manual testing.

### All Tests (requires APIs to be running)
```bash
npm test
```

### Legacy Test Script
```bash
./tests/test.sh
```

### Running tests with Docker
If using Docker, make sure both containers are running, then execute:
```
docker exec -it task-management-graphql-clone-graphql-server-1 node tests/api.test.js
```

The tests cover:
- **Functional Equivalence**: Proves that GraphQL API provides identical functionality to REST API
- **User Management**: Creation, authentication, updates, and deletion
- **Task Management**: CRUD operations with proper authorization
- **Error Handling**: Consistent error responses between APIs
- **Data Validation**: Input validation and business rules
- **Authentication**: JWT token handling and session management

### Test Requirements
- REST API must be running on port 5001 (for equivalence tests)
- GraphQL API will be started automatically for equivalence tests
- MongoDB and MariaDB should be available for respective APIs

## API Documentation

The GraphQL API exposes the following main operations:

### Authentication
- Login: Returns a JWT token
- Logout: Invalidates the current session

### Users
- Create User
- Get All Users
- Get User by ID
- Update User
- Delete User

### Tasks
- Create Task
- Get All Tasks
- Update Task
- Delete Task

For detailed schema information and query examples, see the `schema/` directory or use the GraphQL Playground available at `http://localhost:4000` when the server is running (both with direct Node.js execution or Docker).

## Docker Environment

The Docker setup includes:

1. MongoDB container:
   - Image: mongo:latest
   - Port: 27017
   - Persistent volume: mongodb_data

2. GraphQL Server container:
   - Built from local Dockerfile
   - Port: 4000
   - Connects to MongoDB container

The containers are configured to restart automatically and the MongoDB data is persisted using Docker volumes.