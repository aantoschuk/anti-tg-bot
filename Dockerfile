FROM node:20-alpine AS build

WORKDIR app

COPY package*.json ./

RUN npm install -g pnpm

RUN pnpm install

COPY . .

RUN pnpm build

RUN pnpm migrate

FROM node:20-slim

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY --from=build /usr/src/app/package.json /usr/src/app/pnpm-lock.yaml ./

RUN pnpm install --prod

COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
