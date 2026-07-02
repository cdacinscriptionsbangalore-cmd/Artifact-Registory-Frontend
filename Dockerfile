# Base
ARG NODE_VERSION=22.13.1
FROM node:${NODE_VERSION}-slim AS base

# RUN npm install -g pnpm@9
RUN npm install -g pnpm@11.3.0
WORKDIR /app

# Build
FROM base AS build
COPY . .
# RUN pwd && ls -la && false
RUN pnpm install --frozen-lockfile
RUN pnpm run build

# Production
FROM base AS final

ENV NODE_ENV=production
RUN npm i -g serve

# Copy files and set permissions BEFORE switching to node user
COPY --from=build /app/dist ./dist
COPY env-insjection.sh /app/env.sh
RUN chmod +x /app/env.sh

# Change ownership of all files to node user
RUN chown -R node:node /app

# Now switch to non-root user
USER node

EXPOSE 3000

CMD ["/app/env.sh"]