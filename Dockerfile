# Estágio 1: dependências (só muda quando o package-lock muda, então fica em cache)
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Estágio 2: build
FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# O proxy de /api aponta para o serviço "backend" do docker compose. O Next fixa os
# rewrites no build, então outro endereço exige gerar a imagem com --build-arg.
ARG BACKEND_URL=http://backend:8080
ENV BACKEND_URL=$BACKEND_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Estágio 3: execução, só com o servidor standalone e os arquivos estáticos
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Buscas feitas no servidor (ex.: título do produto, nome da categoria) leem BACKEND_URL em
# tempo de execução; o padrão é o serviço "backend" do docker compose.
ENV BACKEND_URL=http://backend:8080
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]
