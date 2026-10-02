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

  const handleClick = () => {
    navigate("/");
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
          variant={IsMobile() ? "h6" : "h5"}
          component="div"
          sx={{
            position: "relative",
            color: theme.canvasColors.text,
            fontWeight: 600,
            zIndex: 1
          }}>
          Cargo Grid Viewer
        </Typography>
      </Box>
    </Box>
  );
}