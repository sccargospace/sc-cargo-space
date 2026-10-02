import { StrictMode } from "react";
import { HashRouter } from "react-router-dom";
import { CssBaseline } from "@mui/material";

import { SettingsProvider } from "@/lib/settings-provider";
import { ThemeProvider } from "@/lib/theme-provider";
import { CanvasProvider } from "@/lib/canvas-provider";

export interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider = (props: AppProviderProps) => {
  return (
    <StrictMode>
      <CssBaseline />
      <SettingsProvider>
        <ThemeProvider>
          <CanvasProvider>
            <HashRouter>
              {props.children}
            </HashRouter>
          </CanvasProvider>
        </ThemeProvider>
      </SettingsProvider>
    </StrictMode>
  );
};