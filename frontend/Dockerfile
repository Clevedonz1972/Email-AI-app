FROM node:16-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy craco config
COPY craco.config.js ./

# Copy the rest of the necessary files
COPY src ./src
COPY public ./public
COPY tsconfig.json ./
COPY jest.config.ts ./
COPY jest.setup.js ./

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
