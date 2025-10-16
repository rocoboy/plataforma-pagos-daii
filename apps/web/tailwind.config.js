/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary color palette
        primary: {
          DEFAULT: "#507BD8", // Azul primario para botones, enlaces y elementos interactivos
          foreground: "#FFFFFF", // Texto sobre fondo primario
        },
        secondary: {
          DEFAULT: "#222222", // Negro/Gris oscuro para textos principales y fondos secundarios
          foreground: "#FFFFFF", // Texto sobre fondo secundario
        },
        background: "#FFFFFF", // Fondo principal blanco
        foreground: "#222222", // Texto principal (negro/gris oscuro)
        
        // Shadcn UI required colors
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        
        // Additional semantic colors
        muted: {
          DEFAULT: "#F5F5F5", // Gris claro para áreas secundarias
          foreground: "#222222",
        },
        border: "#E5E5E5", // Bordes sutiles
        input: "#FFFFFF", // Fondos de inputs
        ring: "#507BD8", // Color de focus ring
        
        // Status colors (keeping some utility colors)
        destructive: {
          DEFAULT: "#DC2626", // Rojo para errores
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#16A34A", // Verde para éxito
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#D97706", // Naranja para advertencias
          foreground: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'], // Roboto como fuente principal
        roboto: ['Roboto', 'sans-serif'],
      },
      fontWeight: {
        regular: '400', // Texto de párrafo y contenido general
        medium: '500',  // Subtítulos y etiquetas
        bold: '700',    // Títulos y encabezados
      },
      fontSize: {
        // Typography scale using Roboto weights
        'heading-xl': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700' }], // 36px, bold
        'heading-lg': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '700' }], // 30px, bold
        'heading-md': ['1.5rem', { lineHeight: '2rem', fontWeight: '700' }], // 24px, bold
        'heading-sm': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '700' }], // 20px, bold
        'subtitle-lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '500' }], // 18px, medium
        'subtitle-md': ['1rem', { lineHeight: '1.5rem', fontWeight: '500' }], // 16px, medium
        'subtitle-sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }], // 14px, medium
        'body-lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '400' }], // 18px, regular
        'body-md': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }], // 16px, regular
        'body-sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }], // 14px, regular
      }
    },
  },
  plugins: [],
}