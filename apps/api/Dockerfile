FROM node:20-alpine
RUN npm install -g pnpm
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm run build
EXPOSE 3001
CMD ["node", "dist/main"]
