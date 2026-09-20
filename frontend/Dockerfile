FROM node:20-slim

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000
CMD ["yarn", "start"]
