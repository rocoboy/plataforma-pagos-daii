FROM oven/bun:1 as base
WORKDIR /app

# Copy types from workspace (needed for @plataforma/types)
COPY ../types ../types

# Install dependencies (preinstall script will copy types)
COPY package.json bun.lockb ./
COPY scripts ./scripts
RUN bun install --frozen-lockfile

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1-slim
WORKDIR /app

# Copy built application
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 bunuser
USER bunuser

EXPOSE 8080

CMD ["bun", "run", "dist/index.js"]
