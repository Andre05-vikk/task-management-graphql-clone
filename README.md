# Task Management GraphQL Clone

A GraphQL implementation of a task management API that provides equivalent functionality to a REST API.

## Project Purpose

This project demonstrates how to create a GraphQL API that provides the same functionality as an existing REST API, allowing comparison of both approaches for managing users and tasks.

## Requirements

- Docker & Docker Compose
- Node.js 16+ (for development only)

## Building and Running

### Start the services (one command):
```bash
./run.sh
```

This will:
- Start both GraphQL and REST APIs using Docker
- GraphQL API: http://localhost:4000
- REST API: http://localhost:5001
- GraphQL Playground: http://localhost:4000

### Stop the services:
```bash
docker-compose down
```

## Testing

Run all automated tests:
```bash
./tests/test.sh
```

## API Examples

### GraphQL Examples (JavaScript):
```bash
node client/example.js
```

### GraphQL Examples (curl):
```bash
chmod +x client/curl-examples.sh
./client/curl-examples.sh
```

## Available Operations

### Users
- Create user (signup)
- Login/logout
- Get user by ID
- Get all users
- Update user
- Delete user

### Tasks
- Create task
- Get all tasks (with pagination)
- Update task
- Delete task

All operations are available in both GraphQL (mutations/queries) and REST (HTTP endpoints) formats with equivalent functionality and response structures.