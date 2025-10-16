# Configuración del Proyecto

## Variables de Entorno

Este proyecto requiere las siguientes variables de entorno:

### Desarrollo Local

Crea un archivo `.env.local` en `apps/web/` con:

```bash
REACT_APP_VERCEL_API=http://localhost:3000
REACT_APP_AUTH_SERVICE_URL=https://grupo5-usuarios.vercel.app
```

### Producción en Vercel

Configura las siguientes variables en tu proyecto de Vercel:

```bash
REACT_APP_VERCEL_API=https://tu-api.vercel.app
REACT_APP_AUTH_SERVICE_URL=https://grupo5-usuarios.vercel.app
```

## Cómo Ejecutar

### Desarrollo Local

```bash
# Desde la raíz del proyecto, navega a apps/web
cd apps/web

# Instala las dependencias (si aún no lo has hecho)
pnpm install

# Inicia el servidor de desarrollo
pnpm start
```

**IMPORTANTE:** Debes ejecutar `pnpm start` desde dentro de `apps/web`, NO desde la raíz del monorepo.

### Build para Producción

```bash
cd apps/web
pnpm build
```

## Variables de Entorno Detalladas

### `REACT_APP_VERCEL_API`
- **Descripción:** URL base de tu API backend
- **Desarrollo:** `http://localhost:3000`
- **Producción:** `https://tu-proyecto.vercel.app`
- **Se usa en:**
  - Login (`src/pages/CustomLogin.tsx`) → llama a `/api/auth/login`
  - Transacciones (`src/pages/Transactions.tsx`) → llama a `/api/webhooks/payments`
  - Formulario de pagos (`src/components/PaymentCreationForm.tsx`) → llama a `/api/webhooks/payments`
  - Cliente API (`src/lib/apiClient.ts`) → llama a `/api/payments`
  - Interceptores API (`src/lib/apiInterceptor*.ts`)

### `REACT_APP_AUTH_SERVICE_URL`
- **Descripción:** URL del servicio de autenticación externo (Grupo 5)
- **Valor:** `https://grupo5-usuarios.vercel.app`
- **Se usa en:** Redirección de login (`src/lib/auth.ts`)
- **Nota:** Solo para redirección, NO para llamadas API

## Arquitectura de URLs

```
REACT_APP_VERCEL_API (TU BACKEND)
├── /api/auth/login        → Proxy de autenticación
├── /api/payments          → Obtener pagos
└── /api/webhooks/payments → Crear/actualizar pagos

REACT_APP_AUTH_SERVICE_URL (EXTERNO - GRUPO 5)
└── /login?redirect_uri=... → Solo redirección
```

## Troubleshooting

### Error: "Missing script start or file server.js"
Este error ocurre cuando ejecutas `pnpm start` desde la raíz del monorepo. Asegúrate de estar en `apps/web`:

```bash
cd apps/web
pnpm start
```

### Variables de entorno no funcionan
Si las variables de entorno no están siendo leídas:
1. Verifica que el archivo se llame exactamente `.env.local` (con el punto inicial)
2. Reinicia el servidor de desarrollo después de crear/modificar el archivo
3. Las variables deben empezar con `REACT_APP_` para ser accesibles en React

### Error de CORS en login
Si ves errores de CORS al hacer login, verifica que `REACT_APP_VERCEL_API` apunte a tu backend que tiene configurado el proxy `/api/auth/login`.

