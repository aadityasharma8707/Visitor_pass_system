FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --production --silent

# Copy source
COPY . .

ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "index.js"]
