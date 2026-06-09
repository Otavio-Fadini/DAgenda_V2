import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#32B5FE',
      dark: '#0F172A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#10B981',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#10B981',
      light: '#ECFDF5',
    },
    warning: {
      main: '#EAB308',
      light: '#FEFCE8',
    },
    error: {
      main: '#EF4444',
      light: '#FEF2F2',
    },
    info: {
      main: '#32B5FE',
      light: '#F0F9FF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
      disabled: '#94A3B8',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    divider: '#E2E8F0',
  },

  typography: {
    fontFamily: '"Inter", "Roboto", "Segoe UI", sans-serif',
    h4: {
      fontWeight: 900,
      letterSpacing: '-1px',
    },
    h5: {
      fontWeight: 900,
      letterSpacing: '-0.5px',
    },
    h6: {
      fontWeight: 800,
    },
    button: {
      fontWeight: 800,
      textTransform: 'none',
    },
  },

  shape: {
    borderRadius: 12,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F8FAFC',
        },
      },
    },

    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderColor: '#E2E8F0',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          backgroundImage: 'none',
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 42,
          borderRadius: 12,
          fontWeight: 800,
          textTransform: 'none',
          boxShadow: 'none',
        },
        contained: {
          color: '#FFFFFF',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#F8FAFC',
          transition: 'all 0.2s ease-in-out',
          '& fieldset': {
            borderColor: '#E2E8F0',
          },
          '&:hover fieldset': {
            borderColor: '#CBD5E1',
          },
          '&.Mui-focused': {
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(50, 181, 254, 0.10)',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#32B5FE',
            borderWidth: 2,
          },
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
          backgroundColor: '#32B5FE',
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 800,
          textTransform: 'none',
          color: '#64748B',
          '&.Mui-selected': {
            color: '#32B5FE',
          },
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 800,
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
