# Testing en API

Este proyecto soporta tests tanto con **Jest** (usando npm) como con **Bun** (nativo).

## Comandos disponibles

### Con npm/Jest (Actual)
```bash
npm test                 # Ejecutar todos los tests
npm run test:watch      # Modo watch
npm run test:coverage   # Con reporte de cobertura
```

### Con Bun (Cuando esté instalado)
```bash
npm run test:bun              # Ejecutar con Bun
npm run test:bun:watch        # Modo watch con Bun
npm run test:bun:coverage     # Cobertura con Bun
```

## Estructura de tests

Los tests están organizados en:
- `src/**/*.test.ts` - Tests unitarios junto al código
- `src/__tests__/**/*.test.ts` - Tests de integración

## Tests actuales

### Archivos testeados
1. **CORS** (`src/lib/cors.test.ts`)
   - Manejo de headers CORS
   - Validación de orígenes permitidos

2. **Middleware Global** (`src/middleware.test.ts`)
   - Manejo de requests OPTIONS
   - Aplicación de headers CORS

3. **Admin Auth Middleware** (`src/app/api/middleware/adminAuth.test.ts`)
   - Validación de tokens JWT
   - Control de acceso admin
   - Manejo de errores de autenticación

4. **Login Route** (`src/app/api/auth/login/route.test.ts`)
   - Proxy de autenticación
   - Normalización de respuestas
   - Manejo de errores de red

5. **Payments Route** (`src/app/api/payments/route.test.ts`)
   - Obtención de pagos (requiere admin)
   - Validación de autenticación
   - Manejo de errores

6. **Webhooks Payments** (`src/app/api/webhooks/payments/route.test.ts`)
   - Creación de pagos
   - Actualización de estados
   - Validación de datos

## Cobertura actual

```
File               | % Stmts | % Branch | % Funcs | % Lines |
-------------------|---------|----------|---------|---------|
All files          |   46%   |   63%    |   37%   |   46%   |
```

### Objetivo
Alcanzar **80% de cobertura global** entre frontend y backend.

## Notas

- Los tests usan mocks para dependencias externas (JWT, Supabase, etc.)
- Se mockea `fetch` para llamadas a APIs externas
- Los tests son compatibles tanto con Jest como con Bun
- La sintaxis es estándar: `describe`, `it`, `expect`

## Configuración

### Jest
Configurado en `jest.config.js` con:
- Preset: `ts-jest`
- Environment: `node`
- Module aliases: `@/` apunta a `src/`

### Bun
Bun usa su test runner nativo, compatible con la sintaxis de Jest.
Para instalar Bun: https://bun.sh/docs/installation

