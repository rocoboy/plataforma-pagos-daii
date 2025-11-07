# Bridge Service - Developer Guide

Esta guía es para desarrolladores que trabajan en el servicio bridge.

## 🚀 Quick Start (Local Development)

### Prerequisitos
- Bun >= 1.2 instalado
- Acceso al monorepo

### Setup Inicial

```bash
# Desde la raíz del monorepo
cd apps/bridge

# Preparar tipos (solo primera vez o cuando cambien)
node scripts/prepare-types.js

# Instalar dependencias
bun install

# Iniciar en modo desarrollo
bun run dev
```

### Scripts Disponibles

```bash
bun run dev          # Desarrollo con hot-reload
bun run build        # Compilar para producción
bun run start        # Ejecutar versión compilada
bun run serve:http   # Solo servidor HTTP (sin Kafka/RabbitMQ)
```

## 📦 Estructura del Proyecto

```
apps/bridge/
├── src/
│   ├── index.ts           # Entry point principal
│   ├── config.ts          # Configuración
│   ├── kafka.ts           # Cliente Kafka
│   ├── rabbitmq.ts        # Cliente RabbitMQ
│   ├── webhook.ts         # Handler de webhooks
│   ├── server.ts          # HTTP server (health checks)
│   └── types.ts           # TypeScript types
├── scripts/
│   └── prepare-types.js   # Copia tipos del workspace
├── .types/                # Tipos copiados (git ignored)
├── dist/                  # Build output (git ignored)
├── package.json
└── Dockerfile.railway     # Dockerfile para Railway
```

## 🔧 Variables de Entorno

Crea un archivo `.env` en `apps/bridge/`:

```env
# Kafka Configuration
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=bridge-service
KAFKA_GROUP_ID=bridge-consumer-group
KAFKA_TOPICS=payment-events

# RabbitMQ Configuration (opcional)
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
RABBITMQ_QUEUE=payment-events
RABBITMQ_EXCHANGE=payments

# Webhook Configuration
WEBHOOK_BASE_URL=http://localhost:3000/api/webhooks
WEBHOOK_TIMEOUT=30000
MAX_RETRIES=3
RETRY_DELAY=5000

# Server Configuration
PORT=8080
HOST=0.0.0.0
LOG_LEVEL=debug
```

## 🧪 Testing

El servicio expone endpoints para testing:

```bash
# Health check
curl http://localhost:8080/health

# Metrics
curl http://localhost:8080/metrics

# Status
curl http://localhost:8080/status
```

## 📝 Workflow de Desarrollo

### 1. Hacer Cambios

Edita los archivos en `src/`. El hot-reload detectará los cambios automáticamente.

### 2. Verificar Build

Antes de hacer commit:

```bash
bun run build
```

### 3. Commit y Push

```bash
git add .
git commit -m "feat: descripción del cambio"
git push origin develop  # Para preview
# O
git push origin main     # Para production
```

### 4. Deployment Automático

Railway detectará el push y desplegará automáticamente:
- Push a `develop` → Deploy a **Preview**
- Push a `main` → Deploy a **Production**

## ⚠️ Importante

### Dependencias del Workspace

El servicio usa `@plataforma/types` del workspace. **No necesitas hacer nada especial**:

- El script `preinstall` se ejecuta automáticamente
- Los tipos se copian de `../types` a `.types/`
- Todo funciona transparente para ti

### Si los tipos cambian

Si alguien actualiza `apps/types/`, necesitas actualizar tu copia local:

```bash
node scripts/prepare-types.js
bun install  # Re-instala con los nuevos tipos
```

## 🐛 Troubleshooting

### Error: "Could not resolve @plataforma/types"

```bash
node scripts/prepare-types.js
bun install
```

### El servicio no arranca en local

Verifica que tengas Kafka o RabbitMQ corriendo, o usa:

```bash
bun run serve:http  # Solo servidor HTTP
```

### Build falla

```bash
# Limpia y reinstala
bun run clean
node scripts/prepare-types.js
bun install
bun run build
```

## 📚 Más Información

- [Railway Setup Guide](./RAILWAY_SETUP.md) - Para DevOps/configuración de Railway
- [README.md](./README.md) - Documentación completa del servicio

