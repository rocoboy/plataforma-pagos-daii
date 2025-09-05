# RabbitMQ to Webhook Bridge Service

Un servicio puente que consume mensajes de RabbitMQ y los reenvía como webhooks a endpoints de Next.js API. Construido con Bun para máximo rendimiento.

## Características

- 🚀 **Alto rendimiento** - Construido con Bun runtime
- 🔄 **Reintentos automáticos** - Manejo robusto de errores con reintentos configurables
- 🏥 **Health checks** - Endpoints de monitoreo y métricas
- 🐳 **Docker ready** - Configuración completa de Docker y Docker Compose
- 📝 **TypeScript** - Tipado completo y soporte nativo
- 🔧 **Configuración flexible** - Variables de entorno para todas las configuraciones

## Arquitectura

```
RabbitMQ → Bridge Service → Next.js API Routes
                ↓
         Webhook Endpoints
```

## Instalación

### Prerrequisitos

- [Bun](https://bun.sh/) instalado
- RabbitMQ ejecutándose
- Next.js API disponible

### Instalación local

```bash
cd apps/bridge
bun install
```

### Configuración

1. Copia el archivo de ejemplo de variables de entorno:
```bash
cp env.example .env
```

2. Edita `.env` con tus configuraciones:
```env
RABBITMQ_URL=amqp://admin:password@localhost:5672/
RABBITMQ_QUEUE=payment-events
WEBHOOK_BASE_URL=http://localhost:3000/api/webhooks
```

## Uso

### Desarrollo

```bash
# Modo desarrollo con hot reload
bun run dev

# Modo producción
bun run start
```

### Docker

```bash
# Construir y ejecutar con Docker Compose
bun run docker:compose

# Modo desarrollo con Docker
bun run docker:compose:dev
```

### Scripts disponibles

- `bun run dev` - Ejecuta en modo desarrollo con hot reload
- `bun run start` - Ejecuta en modo producción
- `bun run build` - Construye la aplicación
- `bun run docker:build` - Construye la imagen Docker
- `bun run docker:run` - Ejecuta el contenedor Docker
- `bun run docker:compose` - Ejecuta con Docker Compose
- `bun run docker:compose:dev` - Ejecuta en modo desarrollo con Docker Compose
- `bun run clean` - Limpia archivos generados

## Configuración

### Variables de entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `RABBITMQ_URL` | URL de conexión a RabbitMQ | `amqp://guest:guest@localhost:5672/` |
| `RABBITMQ_QUEUE` | Nombre de la cola a consumir | `payment-events` |
| `RABBITMQ_EXCHANGE` | Exchange de RabbitMQ | `payments` |
| `WEBHOOK_BASE_URL` | URL base para webhooks | `http://localhost:3000/api/webhooks` |
| `WEBHOOK_TIMEOUT` | Timeout para webhooks (ms) | `30000` |
| `MAX_RETRIES` | Número máximo de reintentos | `3` |
| `RETRY_DELAY` | Delay entre reintentos (ms) | `5000` |
| `PORT` | Puerto del servidor | `8080` |
| `HOST` | Host del servidor | `0.0.0.0` |
| `LOG_LEVEL` | Nivel de logging | `info` |

### Mapeo de eventos

El servicio mapea automáticamente los routing keys de RabbitMQ a endpoints de webhook:

| Routing Key | Endpoint |
|-------------|----------|
| `payment.completed` | `/payments` |
| `payment.failed` | `/payments` |
| `payment.refunded` | `/payments` |
| `user.created` | `/users` |
| `user.updated` | `/users` |
| `subscription.created` | `/subscriptions` |
| `subscription.updated` | `/subscriptions` |
| `invoice.created` | `/invoices` |
| `*` (otros) | `/events` |

## Endpoints de monitoreo

### Health Check
```
GET /health
```

Respuesta:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "service": "rabbitmq-bridge",
  "version": "1.0.0"
}
```

### Métricas
```
GET /metrics
```

### Estado detallado
```
GET /status
```

## Estructura del proyecto

```
apps/bridge/
├── src/
│   ├── index.ts          # Punto de entrada principal
│   ├── config.ts         # Configuración de la aplicación
│   ├── types.ts          # Definiciones de tipos TypeScript
│   ├── rabbitmq.ts       # Cliente RabbitMQ
│   ├── webhook.ts        # Manejador de webhooks
│   └── server.ts         # Servidor HTTP para health checks
├── package.json          # Dependencias y scripts
├── tsconfig.json         # Configuración TypeScript
├── Dockerfile            # Imagen Docker
├── docker-compose.yml    # Docker Compose para producción
├── docker-compose.dev.yml # Docker Compose para desarrollo
├── env.example           # Variables de entorno de ejemplo
└── README.md             # Este archivo
```

## Formato de mensajes

### Mensaje RabbitMQ
```json
{
  "content": { /* datos del evento */ },
  "routingKey": "payment.completed",
  "exchange": "payments",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "messageId": "msg_1234567890",
  "headers": { /* headers opcionales */ }
}
```

### Payload de webhook
```json
{
  "event": "payment.completed",
  "data": { /* datos del evento */ },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "messageId": "msg_1234567890",
  "source": "rabbitmq",
  "headers": { /* headers opcionales */ }
}
```

## Manejo de errores

- **Reintentos automáticos**: Si un webhook falla, se reintenta hasta `MAX_RETRIES` veces
- **Delay exponencial**: Entre reintentos se espera `RETRY_DELAY` ms
- **Acknowledgment**: Los mensajes se confirman solo después de envío exitoso
- **Requeue**: Los mensajes fallidos se vuelven a encolar para procesamiento posterior

## Desarrollo

### Estructura de código

- **Modular**: Cada funcionalidad en su propio archivo
- **TypeScript**: Tipado completo para mejor desarrollo
- **Error handling**: Manejo robusto de errores en todos los niveles
- **Logging**: Logging estructurado para debugging

### Agregar nuevos tipos de eventos

1. Edita `src/webhook.ts` y agrega el mapeo en `getEndpoint()`
2. Crea el endpoint correspondiente en tu API de Next.js
3. Reinicia el servicio

## Troubleshooting

### Problemas comunes

1. **No se conecta a RabbitMQ**
   - Verifica que RabbitMQ esté ejecutándose
   - Revisa la URL de conexión en `RABBITMQ_URL`
   - Verifica credenciales

2. **Webhooks fallan**
   - Verifica que la API de Next.js esté ejecutándose
   - Revisa la URL en `WEBHOOK_BASE_URL`
   - Verifica que los endpoints existan

3. **Mensajes no se procesan**
   - Verifica que la cola tenga mensajes
   - Revisa los logs del servicio
   - Verifica la configuración del exchange y routing keys

### Logs

El servicio genera logs estructurados que incluyen:
- Conexión a RabbitMQ
- Procesamiento de mensajes
- Envío de webhooks
- Errores y reintentos

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
