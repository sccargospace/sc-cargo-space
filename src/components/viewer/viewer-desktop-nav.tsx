import { useState } from "react";
import { Box, Divider, IconButton, Paper, Tooltip } from "@mui/material";
import {
  DoubleArrow,
  CenterFocusStrong,
  CameraAlt,
} from "@mui/icons-material";

import { useCanvas } from "@/lib/canvas-provider";

const drawerWidth = 300;

interface ViewerDesktopNavProps {
  picker: React.ReactNode;
  tree: React.ReactNode;
}

/** Sidebar and floating controls overlay the canvas without resizing it. */
export const ViewerDesktopNav = ({ picker, tree }: ViewerDesktopNavProps) => {
  const [open, setOpen] = useState(true);
  const { state, resetCamera, takeScreenshot } = useCanvas();
  const togglePanel = () => {
    setOpen(value => !value);
  };

  return (
    <>
      {/* Keep the editors mounted to preserve unfinished inputs when collapsed. */}
      <Box
        component="section"
        id="desktop-vehicles-panel"
        aria-label="Vehicles and cargo"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: drawerWidth,
          height: "100%",
          backgroundColor: "background.paper",
          borderRight: 1,
          borderColor: "divider",
          boxShadow: theme => theme.palette.mode === "dark"
            ? "4px 0 20px rgba(0, 0, 0, 0.35)"
            : "4px 0 20px rgba(0, 0, 0, 0.06)",
          overflow: "hidden",
          display: open ? "flex" : "none",
          flexDirection: "column",
          zIndex: 100,
          pointerEvents: "auto",
        }}
      >
        <Box sx={{ py: 1.5 }}>
          {picker}
        </Box>
        <Divider />
        <Box sx={{ overflowY: "auto", minHeight: 0, flex: 1 }}>
          {tree}
        </Box>
        <Divider />
        {/* Reserve the compact footer beneath the shared toggle. */}
        <Box sx={{ height: 44, flexShrink: 0 }} />
      </Box>

      {/* One mounted toggle keeps its position and keyboard focus in both states. */}
      <Paper
        elevation={open ? 0 : 1}
        sx={{
          position: "absolute", bottom: 4, left: 8, zIndex: 101,
          display: "flex", borderRadius: 2,
          outline: "1px solid", outlineColor: open ? "transparent" : "divider",
        }}
      >
        <Tooltip title={open ? "Collapse sidebar" : "Expand sidebar"} placement="top">
          <IconButton
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
            aria-expanded={open}
            aria-controls="desktop-vehicles-panel"
            onClick={togglePanel}
            sx={{ width: 36, height: 36 }}
          >
            <DoubleArrow fontSize="small" sx={{ transform: open ? "scaleX(-1)" : "none" }} />
          </IconButton>
        </Tooltip>
      </Paper>

      <Paper
        role="group"
        aria-label="Canvas controls"
        elevation={1}
        sx={{
          position: "absolute", top: 16, right: 16, zIndex: 100,
          display: "flex", p: 0.25, border: 1, borderColor: "divider", borderRadius: 2,
        }}
      >
        <Tooltip title="Reset view" placement="bottom">
          <Box component="span" sx={{ display: "flex" }}>
            <IconButton aria-label="Reset view" disabled={!state.controls} onClick={resetCamera} sx={{ width: 36, height: 36 }}>
              <CenterFocusStrong fontSize="small" />
            </IconButton>
          </Box>
        </Tooltip>
        <Divider orientation="vertical" flexItem sx={{ my: 0.75, mx: 0.25 }} />
        <Tooltip title="Take screenshot" placement="bottom">
          <Box component="span" sx={{ display: "flex" }}>
            <IconButton aria-label="Take screenshot" disabled={!state.controls} onClick={takeScreenshot} sx={{ width: 36, height: 36 }}>
              <CameraAlt fontSize="small" />
            </IconButton>
          </Box>
        </Tooltip>
      </Paper>
    </>
  );
};
