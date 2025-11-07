# Railway Multi-Environment Setup

Este documento describe cómo configurar deployments automáticos para los entornos de **Production** y **Preview** en Railway.

## Estructura de Archivos

- `railway.production.json` - Configuración específica para producción
- `railway.preview.json` - Configuración específica para preview
- `nixpacks.toml` - Configuración de Nixpacks para forzar el uso de Bun
- `scripts/prepare-types.js` - Script para copiar `@plataforma/types` antes del build
- `.railwayignore` - Archivos a excluir del deployment

## Dependencias Workspace

El servicio usa `@plataforma/types` como dependencia compartida del monorepo. 
Para que funcione en Railway (que solo clona `apps/bridge`):

1. El script `preinstall` en `package.json` ejecuta `scripts/prepare-types.js`
2. Este script copia `../types` a `.types/` dentro de `apps/bridge`
3. El `package.json` usa `"@plataforma/types": "file:.types"`
4. Railway puede instalar la dependencia como un archivo local

## Opción 1: Dos Servicios Separados en Railway (Recomendado)

### Setup en Railway Dashboard

1. **Crear Servicio de Production:**
   - Nombre: `bridge-production`
   - Source: Tu repositorio de GitHub
   - Settings > Root Directory: `apps/bridge`
   - Settings > Branch: `main`
   - Settings > Watch Paths: `apps/bridge/**`
   - Settings > Railway Config File: `railway.production.json` (o `railway.json`)

2. **Crear Servicio de Preview:**
   - Nombre: `bridge-preview`
   - Source: El mismo repositorio
   - Settings > Root Directory: `apps/bridge`
   - Settings > Branch: `develop`
   - Settings > Watch Paths: `apps/bridge/**`
   - Settings > Railway Config File: `railway.preview.json`

### Variables de Entorno

#### Production (bridge-production)
```env
NODE_ENV=production
RABBITMQ_URL=amqp://user:pass@prod-rabbitmq.cloudamqp.com:5672/prod
RABBITMQ_QUEUE=payment-events
RABBITMQ_EXCHANGE=payments
WEBHOOK_BASE_URL=https://api-production.vercel.app/api/webhooks
WEBHOOK_TIMEOUT=30000
MAX_RETRIES=3
RETRY_DELAY=5000
PORT=8080
HOST=0.0.0.0
LOG_LEVEL=info
```

#### Preview (bridge-preview)
```env
NODE_ENV=development
RABBITMQ_URL=amqp://user:pass@dev-rabbitmq.cloudamqp.com:5672/dev
RABBITMQ_QUEUE=payment-events-dev
RABBITMQ_EXCHANGE=payments-dev
WEBHOOK_BASE_URL=https://api-preview.vercel.app/api/webhooks
WEBHOOK_TIMEOUT=20000
MAX_RETRIES=2
RETRY_DELAY=3000
PORT=8080
HOST=0.0.0.0
LOG_LEVEL=debug
```

### Workflow

**Para Production:**
```bash
git checkout main
git merge develop
git push origin main
# Railway despliega automáticamente a bridge-production
```

**Para Preview:**
```bash
git checkout develop
# Haz tus cambios
git add .
git commit -m "feat: nueva funcionalidad"
git push origin develop
# Railway despliega automáticamente a bridge-preview
```

## Opción 2: Un Servicio con Múltiples Entornos (Railway Environments)

### Setup en Railway Dashboard

1. **Crear el Servicio:**
   - Nombre: `bridge`
   - Source: Tu repositorio
   - Settings > Root Directory: `apps/bridge`

2. **Crear Entornos:**
   - En el proyecto, ve a **Environments**
   - Crea dos entornos:
     - `production` (rama `main`)
     - `preview` (rama `develop`)

3. **Configurar Variables por Entorno:**
   - Selecciona el entorno `production` y agrega las variables de producción
   - Selecciona el entorno `preview` y agrega las variables de desarrollo

### railway.json
```json
{
  "environments": {
    "production": {
      "branch": "main"
    },
    "preview": {
      "branch": "develop"
    }
  }
}
```

## Diferencias entre Entornos

### Production
- Branch: `main`
- `--frozen-lockfile` para instalación determinística
- Health check timeout: 30s
- Max retries: 10
- Log level: `info`
- Más recursos (si es necesario)

### Preview
- Branch: `develop`
- Instalación más rápida sin `--frozen-lockfile`
- Health check timeout: 20s
- Max retries: 3
- Log level: `debug`
- Menos recursos para ahorrar costos

## Monitoreo

### Health Checks
- Production: `https://bridge-production.railway.app/health`
- Preview: `https://bridge-preview.railway.app/health`

### Metrics
- Production: `https://bridge-production.railway.app/metrics`
- Preview: `https://bridge-preview.railway.app/metrics`

### Status
- Production: `https://bridge-production.railway.app/status`
- Preview: `https://bridge-preview.railway.app/status`

## Troubleshooting

### Preview no despliega automáticamente
- Verifica que Watch Paths esté configurado: `apps/bridge/**`
- Verifica que la rama sea `develop`
- Revisa los logs de Railway

### Variables de entorno no se aplican
- Asegúrate de estar en el entorno correcto
- Reinicia el servicio después de cambiar variables
- Verifica que no haya typos en los nombres

### Build falla en Preview
- El preview usa `bun install` sin `--frozen-lockfile`
- Si falla, considera usar el mismo comando que production

## Recomendación

**Usa la Opción 1 (Dos Servicios Separados)** porque:
- ✅ Más control independiente
- ✅ Más fácil de configurar
- ✅ Más claro qué está desplegado dónde
- ✅ Puedes pausar preview sin afectar production
- ✅ Logs separados y más fáciles de seguir

