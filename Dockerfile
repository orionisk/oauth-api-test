FROM node:22
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY prisma ./prisma/
RUN pnpm prisma generate
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
