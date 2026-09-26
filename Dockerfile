FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

ARG RENDER_GIT_COMMIT=local
ARG GIT_SHA=local
ENV RENDER_GIT_COMMIT=$RENDER_GIT_COMMIT
ENV GIT_SHA=$GIT_SHA
ENV PORT=3000

USER node

EXPOSE 3000

CMD ["node", "server.js"]