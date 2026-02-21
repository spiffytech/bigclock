FROM oven/bun:1.3.9

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY tsconfig.json ./
COPY src/ ./src/
COPY public/ ./public/
COPY styles/ ./styles/

RUN bun run build:css

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "run", "src/index.tsx"]