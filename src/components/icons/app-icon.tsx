import { type MouseEvent } from "react";
import {
  Box, Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { useTheme } from "@/lib/theme-provider";
import { IsMobile } from "@/lib/util";

/**
 * Logo component for the application.
 */
export const AppIcon = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = IsMobile();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    navigate("/");
    // An empty hash and "#/" both resolve to the root in HashRouter. Clean up
    // its new history entry after navigation, preserving the router's state.
    window.history.replaceState(window.history.state, "", "/");
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        minWidth: 0,
      }}
    >
      <Box
        component="a"
        href="/"
        aria-label="Cargo Grid Viewer home"
        onClick={handleClick}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          textDecoration: "none",
          color: "inherit",
          flexShrink: 0,
          cursor: "pointer",
        }}
      >
        <Box
          component="img"
          src="/logo.png"
          alt="Cargo Grid Viewer"
          sx={{
            height: "1.5rem",
            width: "auto",
            maxWidth: "1.5rem",
            objectFit: "contain",
            flexShrink: 0
          }}
        />
        <Typography
          fontStyle="italic"
          variant={isMobile ? "h6" : "h5"}
          component="div"
          sx={{
            position: "relative",
            color: theme.canvasColors.text,
            fontWeight: 600,
            fontSize: isMobile ? "1rem" : undefined,
            zIndex: 1
          }}>
          {isMobile ? "Cargo grids" : "Cargo Grid Viewer"}
        </Typography>
      </Box>
    </Box>
  );
}
