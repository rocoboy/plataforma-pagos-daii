# Sistema de Diseño - Blanco y Negro Minimalista

## Paleta de Colores

### Variables CSS (HSL)
```css
--background: 0 0% 100%        /* Blanco puro */
--foreground: 0 0% 0%          /* Negro puro */
--card: 0 0% 100%              /* Blanco */
--primary: 0 0% 0%             /* Negro */
--secondary: 0 0% 97%          /* Gris muy claro */
--muted: 0 0% 96%              /* Gris claro */
--border: 0 0% 88%             /* Gris para bordes */
```

### Aplicación de Colores

#### Fondos
- **Principal:** Blanco (`bg-white`)
- **Secundario:** Gris claro (`bg-gray-50`, `bg-gray-100`)
- **Cards:** Blanco con bordes grises

#### Texto
- **Primario:** Negro/Gris oscuro (`text-gray-900`)
- **Secundario:** Gris medio (`text-muted-foreground` = gris 40%)
- **Disabled:** Gris claro

#### Botones
- **Principal:** Negro con texto blanco (`bg-black`, `hover:bg-gray-800`)
- **Outline:** Borde gris con fondo blanco
- **Ghost:** Transparente, hover gris claro

#### Estados de Pago (Badges)
- **CONFIRMADA:** Fondo negro, texto blanco
- **PENDIENTE:** Fondo gris claro, texto negro
- **CANCELADA:** Fondo negro, texto blanco
- **REEMBOLSADA:** Fondo blanco, borde gris

#### Bordes y Separadores
- **Bordes:** Gris claro (`border-gray-200`, `border-gray-300`)
- **Divisores:** Gris muy claro

## Componentes UI

Todos los componentes de Shadcn configurados con la paleta blanco y negro:
- Button ✓
- Input ✓
- Card ✓
- Badge ✓
- Label ✓
- Dialog ✓
- Select ✓
- Alert ✓
- Table ✓

## Tipografía

- **Fuente:** Inter (sans-serif moderna y limpia)
- **Pesos:** 
  - Regular (400) - Texto normal
  - Medium (500) - Subtítulos
  - Semibold (600) - Énfasis
  - Bold (700) - Títulos

## Íconos

- **Biblioteca:** Lucide React (minimalista y consistente)
- **Color:** Gris 700-900 según contexto
- **Tamaño:** 16px (w-4 h-4) para iconos en botones, 24px+ para decorativos

## Sin Colores

❌ Sin azul
❌ Sin verde
❌ Sin rojo (excepto en variables de destructive mapeadas a negro)
❌ Sin amarillo
❌ Sin naranja
✅ Solo blanco, negro y escala de grises

