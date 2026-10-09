
import { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Box, SxProps } from "@mui/material";

import { ViewerRoute } from "./routes/viewer";
import { FinderRoute } from "./routes/finder";
import { Canvas } from "@/components/canvas/canvas";

/**
 * Component that handles redirecting from legacy hash-based URLs to the new routing structure.
 * Converts URLs like /#reclaimer-official to /#/v1/viewer/reclaimer-official
 */
const LegacyRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get the current hash without the # symbol
    const hash = window.location.hash.substring(1);

    // Check if this looks like a legacy vehicle URL (not starting with /)
    if (hash && !hash.startsWith("/")) {
      // This is a legacy URL format, redirect to new format
      const newPath = `/v1/viewer/${hash}`;
      navigate(newPath, { replace: true });
    }
  }, [navigate, location]);

  // Show nothing while redirecting
  return null;
};

/**
 * Props for the AppRouter component.
 */
export interface AppRouterProps {
  sx: SxProps;
}

/**
 * Main application router component that defines all routes and handles legacy redirects.
 */
export const AppRouter = ({ sx }: AppRouterProps) => {
  return (
    <Box
      sx={sx}
    >
      <Routes>
        {/* Render the default viewer without changing the landing URL. */}
        <Route path="/" element={<ViewerRoute />} />

        {/* New versioned routes */}
        <Route path="/v1/viewer" element={<ViewerRoute />} />
        <Route path="/v1/viewer/:vehicles" element={<ViewerRoute />} />
        <Route path="/v1/finder" element={<FinderRoute />} />

        {/* Fallback redirect */}
        <Route path="*" element={<LegacyRedirect />} />
      </Routes>

      <Canvas />
    </Box >
  );
}
