import { AppProvider } from "@/app/provider";
import { AppNavigation } from "@/app/navigation";
import { AppRouter } from "@/app/router";

import "@/app/app.css";

/**
 * Main application component that sets up routing, theme, and global modals.
 * Handles route-based navigation with support for legacy URL formats.
 */
export const App = () => {
  return (
    <AppProvider>
      <AppNavigation sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderBottom: 1,
        backgroundColor: "background.paper",
        borderColor: "divider",
        minHeight: { xs: "56px", sm: "56px" },
      }} />

      <AppRouter sx={{
        position: "fixed",
        top: "56px",
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "auto",
      }} />

    </AppProvider>
  );
}

export default App;
