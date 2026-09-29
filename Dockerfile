FROM node:22-slim

ENV NODE_ENV=production
WORKDIR /app
COPY server/ ./server/
EXPOSE 8080
CMD ["node", "server/index.mjs"]
