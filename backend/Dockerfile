FROM node:20-alpine AS build

WORKDIR /app

COPY package.json tsconfig.json tsconfig.build.json ./
COPY src ./src

RUN npm install
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]

