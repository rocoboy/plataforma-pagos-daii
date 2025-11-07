FROM oven/bun:1 as base
WORKDIR /app

# Copy types from workspace (needed for @plataforma/types)
COPY apps/types ./apps/types

# Copy bridge app files
COPY apps/bridge/package.json apps/bridge/bun.lockb* ./
COPY apps/bridge/scripts ./scripts

# Install dependencies (preinstall script will copy types)
RUN bun install --frozen-lockfile

# Copy source code
COPY apps/bridge/src ./src
COPY apps/bridge/tsconfig.json ./

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
