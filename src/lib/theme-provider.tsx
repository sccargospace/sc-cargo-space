import { createContext, useContext, ReactNode } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

import { useSettings } from "@/lib/settings-provider";

/**
 * Custom canvas colors that change with the theme.
 * These colors are used by the 3D canvas and related components.
 */
export interface CanvasColors {
  /** Background color for the 3D canvas */
  background: string;
  /** Color for grid */
  grid: string;
  /** Color for grid lines */
  gridLines: string;
  /** Color for text elements in the canvas */
  text: string;
  /** Color for highlighted elements */
  highlight: string;
}

/**
 * Theme context that provides access to canvas colors.
 */
export interface ThemeContextType {
  isDarkMode: boolean;
  canvasColors: CanvasColors;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

/**
 * Hook to access canvas colors from the theme context.
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Light theme canvas colors.
 */
const lightCanvasColors: CanvasColors = {
  background: '#DEE2E6',
  grid: '#adb5bd',
  gridLines: '#000000',
  text: '#000000',
  highlight: '#1976d2',
};

/**
 * Dark theme canvas colors.
 */
const darkCanvasColors: CanvasColors = {
  background: '#484848',
  grid: '#616161',
  gridLines: '#4d4d4d',
  text: '#ffffff',
  highlight: '#90caf9',
};

/**
 * Creates Material-UI theme based on the theme mode.
 */
const createAppTheme = (isDarkMode: boolean) => {
  return createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      divider: isDarkMode ? '#404040' : '#cccccc',
    },
    typography: {
      button: {
        textTransform: 'none',
      },
    },
    components: {
      // Override Divider component styles
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isDarkMode ? '#404040' : '#cccccc',
          },
        },
      },
    },
  });
};

/**
 * Theme provider component that manages both Material-UI theme and custom canvas colors.
 * Automatically switches between light and dark themes based on user settings.
 */
export interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { settings } = useSettings();
  const isDarkMode = settings.isDarkMode;

  const muiTheme = createAppTheme(isDarkMode);
  const canvasColors = isDarkMode ? darkCanvasColors : lightCanvasColors;

  const themeContextValue: ThemeContextType = {
    isDarkMode,
    canvasColors,
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
