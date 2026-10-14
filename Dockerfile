
# Keep the npm version aligned with the lockfile generator used by this project.
FROM node:22-alpine AS base
RUN npm install --global npm@12.2.0

# Development stage
FROM base AS development
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
USER node

# Build stage
FROM base AS build
WORKDIR /usr/src/app
COPY package*.json ./
COPY --from=development /usr/src/app/node_modules ./node_modules
COPY . .
RUN npm run build
RUN npm ci --only=production && npm cache clean --force
USER node

# Production stage
FROM base AS production
WORKDIR /usr/src/app

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

CMD ["node", "dist/main.js"]
