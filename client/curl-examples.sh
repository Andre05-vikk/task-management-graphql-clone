#!/bin/bash
# Example curl commands to interact with the GraphQL API

API_URL="http://localhost:4000/graphql"
TOKEN=""
TIMESTAMP=$(date +%s)

echo "GraphQL API Curl Examples"
echo "========================="
echo

# Create a user
echo "1. Creating a new user..."
CREATE_USER=$(curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"mutation CreateUser(\$input: CreateUserInput!) { createUser(input: \$input) { id username createdAt } }\",
    \"variables\": {
      \"input\": {
        \"email\": \"curl${TIMESTAMP}@example.com\",
        \"password\": \"password123\"
      }
    }
  }")

echo "$CREATE_USER" | jq .
USER_ID=$(echo "$CREATE_USER" | jq -r '.data.createUser.id')
echo "User created with ID: $USER_ID"
echo

# Login
echo "2. Logging in..."
LOGIN_RESULT=$(curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"mutation Login(\$input: LoginInput!) { login(input: \$input) { token } }\",
    \"variables\": {
      \"input\": {
        \"email\": \"curl${TIMESTAMP}@example.com\",
        \"password\": \"password123\"
      }
    }
  }")

echo "$LOGIN_RESULT" | jq .
TOKEN=$(echo "$LOGIN_RESULT" | jq -r '.data.login.token')
echo "Authentication token received"
echo

# Get all users
echo "3. Getting all users..."
curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "query { users { id username createdAt updatedAt } }"
  }' | jq .
echo

# Get specific user
echo "4. Getting user by ID..."
curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"query\": \"query GetUser(\$id: ID!) { user(id: \$id) { id username createdAt updatedAt } }\",
    \"variables\": {
      \"id\": \"$USER_ID\"
    }
  }" | jq .
echo

# Create a task
echo "5. Creating a task..."
CREATE_TASK=$(curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "mutation CreateTask($input: CreateTaskInput!) { createTask(input: $input) { success message taskId title description status } }",
    "variables": {
      "input": {
        "title": "Test Task from curl",
        "description": "Created using curl command",
        "status": "pending"
      }
    }
  }')

echo "$CREATE_TASK" | jq .
TASK_ID=$(echo "$CREATE_TASK" | jq -r '.data.createTask.taskId')
echo "Task created with ID: $TASK_ID"
echo

# Get all tasks
echo "6. Getting all tasks..."
curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "query { tasks { page limit total tasks { id title description status user_id createdAt updatedAt } } }"
  }' | jq .
echo

# Update task
echo "7. Updating task..."
curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"query\": \"mutation UpdateTask(\$id: ID!, \$input: UpdateTaskInput!) { updateTask(id: \$id, input: \$input) { success message } }\",
    \"variables\": {
      \"id\": \"$TASK_ID\",
      \"input\": {
        \"status\": \"in_progress\",
        \"title\": \"Updated Task from curl\"
      }
    }
  }" | jq .
echo

# Delete task
echo "8. Deleting task..."
curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"query\": \"mutation DeleteTask(\$id: ID!) { deleteTask(id: \$id) }\",
    \"variables\": {
      \"id\": \"$TASK_ID\"
    }
  }" | jq .
echo

# Update user
echo "9. Updating user..."
curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"query\": \"mutation UpdateUser(\$id: ID!, \$input: UpdateUserInput!) { updateUser(id: \$id, input: \$input) { id username updatedAt } }\",
    \"variables\": {
      \"id\": \"$USER_ID\",
      \"input\": {
        \"password\": \"newpassword123\"
      }
    }
  }" | jq .
echo

# Logout
echo "10. Logging out..."
curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "mutation { logout }"
  }' | jq .
echo

# Delete user
echo "11. Deleting user..."
curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"query\": \"mutation DeleteUser(\$id: ID!) { deleteUser(id: \$id) }\",
    \"variables\": {
      \"id\": \"$USER_ID\"
    }
  }" | jq .
echo

echo "All examples completed"
