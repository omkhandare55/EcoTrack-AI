# Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy root lock/package files and server package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies using root lockfile
RUN npm ci --workspace=server

# Copy server source code
COPY server/ ./server/

# Build server TypeScript code
RUN npm run build --workspace=server

# Production stage
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
COPY server/package*.json ./server/

# Install only production dependencies
RUN npm ci --omit=dev --workspace=server

# Copy compiled files
COPY --from=builder /usr/src/app/server/dist ./server/dist

EXPOSE 5000

CMD ["node", "server/dist/server.js"]
```
