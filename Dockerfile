# Build Stage
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
# Install tsx globally or use it from node_modules if copied, 
# but easier to just use node on a compiled server.
# Since we are using typescript server.ts, we need tsx in production too
# or compile server.ts to JS. Let's install tsx.
RUN npm install tsx -g

EXPOSE 3000
CMD ["tsx", "server.ts"]
