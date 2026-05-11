# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Use the .env.local for build time if needed
COPY .env.local .env
RUN npm run build

# Run stage
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
# Include .env for runtime
COPY --from=build /app/.env .env
EXPOSE 3000
CMD ["npm", "start"]
