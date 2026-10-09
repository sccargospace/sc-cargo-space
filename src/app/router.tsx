
import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Box, SxProps } from "@mui/material";

import { ViewerRoute } from "./routes/viewer";
import { FinderRoute } from "./routes/finder";
import { Canvas } from "@/components/canvas/canvas";

/**
 * Component that handles redirecting from legacy hash-based URLs to the new routing structure.
 * Converts URLs like /#reclaimer-official to /#/viewer/reclaimer-official
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
      const newPath = `/viewer/${hash}`;
      navigate(newPath, { replace: true });
    }
  }, [navigate, location]);

  // Show nothing while redirecting
  return null;
};

/** Keep shared v1 links working, including their loadouts and Finder filters. */
const VersionedRedirect = () => {
  const location = useLocation();
  return (
    <Navigate
      to={{
        pathname: location.pathname.slice("/v1".length),
        search: location.search,
        hash: location.hash,
      }}
      replace
    />
  );
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

        <Route path="/viewer" element={<ViewerRoute />} />
        <Route path="/viewer/:vehicles" element={<ViewerRoute />} />
        <Route path="/finder" element={<FinderRoute />} />

        {/* Preserve previously shared versioned URLs. */}
        <Route path="/v1/viewer" element={<VersionedRedirect />} />
        <Route path="/v1/viewer/:vehicles" element={<VersionedRedirect />} />
        <Route path="/v1/finder" element={<VersionedRedirect />} />

        {/* Fallback redirect */}
        <Route path="*" element={<LegacyRedirect />} />
      </Routes>

      <Canvas />
    </Box >
  );
}
