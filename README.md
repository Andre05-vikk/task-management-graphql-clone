# Task Management GraphQL API

This project provides a GraphQL implementation of a task management REST API. It offers identical functionality to the original REST API but through a GraphQL interface.

## Project Overview

The GraphQL API allows users to:
- Authenticate (login, logout)
- Manage users (create, read, update, delete)
- Manage tasks (create, read, update, delete)

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

## Building and Running

### Using Node.js directly

1. Install dependencies:
```
npm install
```

2. Run the server:
```
./scripts/run.sh
```
Alternatively, you can run:
```
npm start
```

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

### Running tests with Node.js
Run the automated tests with:
```
./tests/test.sh
```

### Running tests with Docker
If using Docker, make sure both containers are running, then execute:
```
docker exec -it task-management-graphql-clone-graphql-server-1 node tests/api.test.js
```

This will run the API tests against the GraphQL server running in the Docker container.

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