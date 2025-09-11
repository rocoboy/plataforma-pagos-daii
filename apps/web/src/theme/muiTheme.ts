import { createTheme } from '@mui/material/styles';

// ✅ ARCHIVO ÚNICO PARA CONFIGURAR TODOS LOS COLORES
// Solo cambia estos valores y todo Material UI se adapta automáticamente
const DESIGN_TOKENS = {
  // Colores principales (deben coincidir con tailwind.config.js)
  primary: '#507BD8', // Azul original
  primaryForeground: '#FFFFFF',
  secondary: '#222222', 
  secondaryForeground: '#FFFFFF',
  background: '#FFFFFF',
  foreground: '#222222',
  muted: '#F5F5F5',
  mutedForeground: '#222222',
  border: '#E5E5E5',
  destructive: '#DC2626',
  success: '#507BD8', // Naranja vibrante para que se note el cambio
  warning: '#D97706',
};

export const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: DESIGN_TOKENS.primary,
      contrastText: DESIGN_TOKENS.primaryForeground,
    },
    secondary: {
      main: DESIGN_TOKENS.secondary,
      contrastText: DESIGN_TOKENS.secondaryForeground,
    },
    background: {
      default: DESIGN_TOKENS.background,
      paper: DESIGN_TOKENS.background,
    },
    text: {
      primary: DESIGN_TOKENS.foreground,
      secondary: DESIGN_TOKENS.mutedForeground,
    },
    error: {
      main: DESIGN_TOKENS.destructive,
      contrastText: DESIGN_TOKENS.primaryForeground,
    },
    success: {
      main: DESIGN_TOKENS.success,
      contrastText: DESIGN_TOKENS.primaryForeground,
    },
    warning: {
      main: DESIGN_TOKENS.warning,
      contrastText: DESIGN_TOKENS.primaryForeground,
    },
    divider: DESIGN_TOKENS.border,
  },
  typography: {
    fontFamily: ['Roboto', 'sans-serif'].join(','),
    h1: { fontSize: '2.25rem', lineHeight: '2.5rem', fontWeight: 700 },
    h2: { fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700 },
    h3: { fontSize: '1.5rem', lineHeight: '2rem', fontWeight: 700 },
    h4: { fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: 700 },
    h5: { fontSize: '1.125rem', lineHeight: '1.75rem', fontWeight: 500 },
    h6: { fontSize: '1rem', lineHeight: '1.5rem', fontWeight: 500 },
    body1: { fontSize: '1rem', lineHeight: '1.5rem', fontWeight: 400 },
    body2: { fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: 400 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '6px',
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: DESIGN_TOKENS.primary,
          color: DESIGN_TOKENS.primaryForeground,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { 
          borderRadius: '6px',
          fontWeight: 500,
        },
        // Asegurar que los chips usen nuestros colores personalizados
        colorSuccess: {
          backgroundColor: DESIGN_TOKENS.success,
          color: DESIGN_TOKENS.primaryForeground,
          '&:hover': {
            backgroundColor: DESIGN_TOKENS.success,
            filter: 'brightness(0.9)',
          },
        },
        colorWarning: {
          backgroundColor: DESIGN_TOKENS.warning,
          color: DESIGN_TOKENS.primaryForeground,
          '&:hover': {
            backgroundColor: DESIGN_TOKENS.warning,
            filter: 'brightness(0.9)',
          },
        },
        colorError: {
          backgroundColor: DESIGN_TOKENS.destructive,
          color: DESIGN_TOKENS.primaryForeground,
          '&:hover': {
            backgroundColor: DESIGN_TOKENS.destructive,
            filter: 'brightness(0.9)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          border: `1px solid ${DESIGN_TOKENS.border}`,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-input[type="date"]': {
            '&::-webkit-calendar-picker-indicator': {
              cursor: 'pointer',
              filter: 'invert(0.5)',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          '&.MuiPickersLayout-root': {
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            border: `1px solid ${DESIGN_TOKENS.border}`,
            borderRadius: '12px',
          },
          '&.MuiMenu-paper': {
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            border: `1px solid ${DESIGN_TOKENS.border}`,
            borderRadius: '8px',
            marginTop: '4px',
          },
          '&.MuiPopover-paper': {
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            border: `1px solid ${DESIGN_TOKENS.border}`,
            borderRadius: '8px',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: DESIGN_TOKENS.primary,
            borderWidth: '2px',
          },
        },
      },
    },
  },
});
