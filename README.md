# Task Management GraphQL Clone

GraphQL implementation of a task management API with REST API comparison.

## Requirements

- Node.js 16+
- Docker & Docker Compose

## Quick Start

### One Command (Recommended)
```bash
# Start everything with Docker (full setup)
./scripts/run.sh
# OR
npm run setup

# Manual GraphQL-only setup
./scripts/run.sh --manual
# OR  
npm run setup:manual

# Stop all services
./scripts/stop.sh
# OR
npm run stop
```

### Docker
```bash
# Start all services
docker-compose up -d

# Stop services
docker-compose down
```

### Manual
```bash
npm install
npm start
```

## Services

- GraphQL API: http://localhost:4000
- REST API: http://localhost:5001
- GraphQL Playground: http://localhost:4000

## Testing

```bash
# Run all tests automatically
npm run test:auto

# Basic equivalence tests
npm run test:basic

# All tests (requires running APIs)
npm test
```