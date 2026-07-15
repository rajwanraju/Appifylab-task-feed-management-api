FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
ENV HUSKY=0
RUN npm ci --omit=dev --ignore-scripts
RUN npm rebuild bcrypt
RUN cp -r node_modules node_modules_prod

RUN npm ci --ignore-scripts

COPY prisma/ ./prisma/
RUN npx prisma generate

COPY src/ ./src/
RUN npm run build

FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache tini

COPY --from=builder /app/node_modules_prod ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/package.json ./

RUN mkdir -p uploads

EXPOSE 8000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
