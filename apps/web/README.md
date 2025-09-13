# 🎨 Frontend - Sistema de Gestión de Pagos

Este es el frontend de la plataforma de pagos desarrollado con **React**, **Material UI**, **Tailwind CSS** y **TanStack Query**.

## 📋 Tabla de Contenido

- [🚀 Inicio Rápido](#-inicio-rápido)
- [🎨 Sistema de Colores](#-sistema-de-colores)
- [🎯 Arquitectura de Componentes](#-arquitectura-de-componentes)
- [📱 Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [🛠️ Desarrollo](#-desarrollo)

---

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm run start

# Construir para producción
pnpm run build
```

---

## 🎨 Sistema de Colores

### 📍 **Archivo Principal: `src/theme/muiTheme.ts`**

**¡TODO el sistema de colores se controla desde UN SOLO ARCHIVO!** 

### 🔧 **Cómo cambiar colores:**

```typescript
// En src/theme/muiTheme.ts líneas 5-19
const DESIGN_TOKENS = {
  primary: '#507BD8',        // 🔵 Color principal (botones, enlaces, AppBar)
  primaryForeground: '#FFFFFF', // ⚪ Texto sobre fondo primario
  secondary: '#222222',      // ⚫ Color secundario (textos, fondos)
  secondaryForeground: '#FFFFFF', // ⚪ Texto sobre fondo secundario
  background: '#FFFFFF',     // ⚪ Fondo principal
  foreground: '#222222',     // ⚫ Texto principal
  muted: '#F5F5F5',         // 🔘 Fondos secundarios/áreas
  mutedForeground: '#222222', // ⚫ Texto en áreas secundarias
  border: '#E5E5E5',        // 📏 Bordes sutiles
  destructive: '#DC2626',    // 🔴 Errores/cancelaciones
  success: '#16A34A',       // 🟢 Éxito/confirmaciones
  warning: '#D97706',       // 🟠 Advertencias/pendientes
};
```

### 🎯 **Componentes que se actualizan automáticamente:**

#### ✅ **Material UI Components:**
- **Buttons** → `primary`, `secondary`, `error`, `success`, `warning`
- **Chips** → Status chips (Confirmado=success, Pendiente=warning, Cancelado=error)
- **DataGrid** → Headers, hover states, borders
- **TextField/Select** → Focus states, borders
- **Cards** → Borders, backgrounds
- **AppBar** → Background color

#### ✅ **Custom Components:**
- **StatusChip** → Colores de estado automáticos
- **Loading states** → Spinners y mensajes
- **Error states** → Mensajes de error

### 📝 **Ejemplos de uso:**

#### **1. Cambiar tema completo a oscuro:**
```typescript
const DESIGN_TOKENS = {
  primary: '#3B82F6',           // Azul más vibrante
  background: '#1F2937',        // Fondo gris oscuro
  foreground: '#F9FAFB',        // Texto blanco
  muted: '#374151',             // Áreas secundarias grises
  border: '#4B5563',            // Bordes más visibles
  // ... resto igual
};
```

#### **2. Cambiar solo colores de estado:**
```typescript
success: '#10B981',    // Verde esmeralda
warning: '#F59E0B',    // Amarillo dorado  
destructive: '#EF4444', // Rojo más suave
```

#### **3. Tema corporativo personalizado:**
```typescript
primary: '#6366F1',        // Índigo corporativo
secondary: '#1F2937',      // Gris corporativo
success: '#059669',        // Verde corporativo
warning: '#D97706',        // Naranja corporativo
destructive: '#DC2626',    // Rojo corporativo
```

### 🔄 **Sincronización con Tailwind:**

Los colores también están disponibles como clases de Tailwind CSS:

```jsx
// Usando clases de Tailwind (para casos especiales)
<div className="bg-primary text-primary-foreground">
  Fondo primario con texto contrastante
</div>

<div className="border-border bg-muted">
  Borde sutil con fondo secundario
</div>
```

### 🎨 **Componentes personalizados:**

```jsx
// Material UI automáticamente usa los colores del tema
<Button variant="contained" color="primary">
  Botón Primario
</Button>

<Chip label="Confirmado" color="success" />
<Chip label="Pendiente" color="warning" />
<Chip label="Cancelado" color="error" />

// Para casos especiales, usar sx prop
<Box sx={{ 
  backgroundColor: 'primary.main', 
  color: 'primary.contrastText' 
}}>
  Contenido personalizado
</Box>
```

---

## 🎯 Arquitectura de Componentes

### 📁 **Estructura de carpetas:**

```
src/
├── components/           # Componentes de pantallas
│   ├── TransactionsScreen.tsx
│   ├── TransactionDetailScreen.tsx
│   └── ui/              # Componentes reutilizables
├── theme/               # 🎨 CONFIGURACIÓN DE TEMA
│   └── muiTheme.ts      # ← ARCHIVO PRINCIPAL DE COLORES
├── data/
│   └── mockData.ts      # Type definitions (Transaction, TransactionDetail)
├── services/
│   └── paymentService.ts # API service for Supabase integration
├── lib/
│   └── utils.ts         # Utilidades
└── App.tsx              # Componente principal
```

### 🏗️ **Jerarquía de tema:**

```jsx
// App.tsx
<ThemeProvider theme={muiTheme}>  {/* 🎨 Tema global */}
  <CssBaseline />                 {/* Reset de estilos */}
  <QueryClientProvider>
    {/* Todos los componentes heredan el tema */}
    <TransactionsScreen />
    <TransactionDetailScreen />
  </QueryClientProvider>
</ThemeProvider>
```

---

## 📱 Tecnologías Utilizadas

### 🎨 **UI & Styling:**
- **Material UI v7** - Componentes de interfaz
- **Tailwind CSS v3** - Utilidades de estilo
- **@mui/x-data-grid** - Tabla de datos avanzada
- **@mui/icons-material** - Iconos

### ⚛️ **React Ecosystem:**
- **React v19** - Librería principal
- **TypeScript v4.9** - Tipado estático
- **TanStack Query v5** - Gestión de estado servidor

### 🛠️ **Herramientas:**
- **React Scripts v5** - Build tools
- **PNPM** - Gestor de paquetes
- **jsPDF** - Generación de PDFs

---

## 🛠️ Desarrollo

### 🎯 **Scripts disponibles:**

```bash
pnpm run start    # Servidor de desarrollo (puerto 3000)
pnpm run build    # Build de producción
pnpm run test     # Ejecutar tests
pnpm run eject    # Exponer configuración (NO recomendado)
```

### 🔧 **Variables de entorno:**

```bash
# .env.local (opcional)
REACT_APP_API_URL=http://localhost:8000
```

### 📋 **Convenciones de código:**

#### **1. Componentes:**
```tsx
// Usar TypeScript + Material UI
import { Button, Typography } from '@mui/material';

const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  return (
    <Box>
      <Typography variant="h2">Título</Typography>
      <Button variant="contained" color="primary">
        Acción
      </Button>
    </Box>
  );
};
```

#### **2. Estilos:**
```tsx
// Preferir sx prop de Material UI
<Box sx={{ 
  backgroundColor: 'primary.main',
  padding: 2,
  borderRadius: 1 
}}>

// Para casos especiales, usar Tailwind
<div className="bg-primary text-primary-foreground p-4 rounded">
```

#### **3. Colores:**
```tsx
// ✅ CORRECTO - Usar colores del tema
<Chip color="success" />
<Button color="primary" />

// ❌ EVITAR - Colores hardcodeados
<Chip sx={{ backgroundColor: '#16A34A' }} />
```

### 🚨 **Troubleshooting:**

#### **Los colores no se aplican:**
1. Verificar que `ThemeProvider` esté envolviendo la app
2. Usar `color` prop en lugar de `sx` cuando sea posible
3. Refrescar con Ctrl+F5 para limpiar cache

#### **Error de compilación:**
1. Verificar imports de Material UI
2. Comprobar tipos TypeScript
3. Reinstalar dependencias: `pnpm install`

---

## 🎉 **¡Listo para desarrollar!**

Con este sistema, puedes:
- ✅ **Cambiar toda la paleta** editando un solo archivo
- ✅ **Mantener consistencia** automática en todos los componentes
- ✅ **Crear temas** para diferentes clientes/marcas
- ✅ **Usar tanto Material UI como Tailwind** de forma coherente

### 🔗 **Enlaces útiles:**
- [Material UI Theming](https://mui.com/material-ui/customization/theming/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)

---

**¿Preguntas?** Revisa este README o consulta la documentación oficial de cada tecnología.