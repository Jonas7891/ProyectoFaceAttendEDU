FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev
COPY dist ./dist
ENV PORT=8091
EXPOSE 8091
CMD ["node", "dist/main.js"]
