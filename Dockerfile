# Stage 1: Development Dependencies & Build
FROM node:20-alpine AS builder
WORKDIR /app

# Set yarn version
RUN corepack enable && corepack prepare yarn@4.7.0 --activate

# Copy package.json and yarn lock files
COPY package.json yarn.lock .yarnrc.yaml ./

# Make sure yarn uses node-modules mode
RUN yarn config set nodeLinker node-modules

# Install dependencies including Prisma
RUN yarn install --immutable

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js application
RUN yarn build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Create a non-root user to run the app
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder stage
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy prisma client and schema (needed for migrations and queries)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Set proper permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose the port the app will run on
EXPOSE 3000
# Set the command to start the Next.js app
CMD ["node", "server.js"] 
