FROM node:18-alpine

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++ libc6-compat

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Clear npm cache and install dependencies fresh
RUN npm cache clean --force
RUN npm install --platform=linux --arch=x64 --target_platform=linux

# Copy the rest of the application code
COPY . .

# Force rebuild bcrypt for Alpine Linux
RUN npm rebuild bcrypt --build-from-source

# Install frontend dependencies and build
RUN npm run client-install && npm run client-build

# Expose port 5001
EXPOSE 5001

# Start the application
CMD ["node", "notion-clone-api.js"]
