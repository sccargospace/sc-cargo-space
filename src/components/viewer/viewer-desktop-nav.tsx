import { useState } from "react";
import { Box, Divider, IconButton, Tooltip } from "@mui/material";
import {
  DoubleArrow as DoubleArrowIcon,
  CenterFocusStrong as ResetCameraIcon,
  CameraAlt as CameraIcon
} from "@mui/icons-material";

import { useCanvas } from "@/lib/canvas-provider";

/**
 * Width of the navigation drawer when fully expanded.
 */
const drawerWidth = 300;

/**
 * Width of the navigation drawer when collapsed to icon rail.
 */
const collapsedWidth = 48;

/**
 * Props for navigation button components.
 */
interface NavButtonProps {
  tooltipPlacement: 'top' | 'bottom' | 'left' | 'right';
  size?: 'small' | 'medium' | 'large';
}

/**
 * Reusable Reset Camera button component.
 */
const ResetCameraButton = ({ tooltipPlacement, size = "medium" }: NavButtonProps) => {
  const { resetCamera } = useCanvas();
  return (
    <Tooltip title="Reset Camera" placement={tooltipPlacement}>
      <IconButton
        aria-label="reset camera"
        size={size}
        color="default"
        onClick={resetCamera}>
        <ResetCameraIcon fontSize={size} />
      </IconButton>
    </Tooltip>
  );
}

/**
 * Reusable Screenshot button component.
 */
const ScreenshotButton = ({ tooltipPlacement, size = "medium" }: NavButtonProps) => {
  const { takeScreenshot } = useCanvas();
  return (
    <Tooltip title="Take Screenshot" placement={tooltipPlacement}>
      <IconButton
        aria-label="take screenshot"
        size={size}
        color="default"
        onClick={takeScreenshot}>
        <CameraIcon fontSize={size} />
      </IconButton>
    </Tooltip>
  );
}

/**
 * Props for the desktop viewer navigation.
 */
interface ViewerDesktopNavProps {
  picker: React.ReactNode;
  tree: React.ReactNode;
}

/**
 * Desktop navigation component that provides a collapsible sidebar with vehicle
 * selection, cargo editing, and camera controls.
 */
export const ViewerDesktopNav = ({ picker, tree }: ViewerDesktopNavProps) => {
  const [open, setOpen] = useState(true);
  const buttonSize = "medium";

  const handleToggle = () => {
    setOpen(!open);
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: open ? drawerWidth : collapsedWidth,
        height: '100%',
        backgroundColor: 'background.paper',
        borderRight: 1,
        borderColor: (theme) => theme.palette.divider,
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '4px 0 20px rgba(0, 0, 0, 0.35)'
            : '4px 0 20px rgba(0, 0, 0, 0.06)',
        transition: 'width 0.3s ease-in-out',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        pointerEvents: 'auto',
      }}
    >
      {/* Expanded content */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden',
        opacity: open ? 1 : 0,
        visibility: open ? 'visible' : 'hidden',
        transition: 'opacity 0.2s ease-in-out, visibility 0.2s ease-in-out',
      }}>
        {/* Header */}
        <Box>
          <Box sx={{ pt: 1.5 }} />
          {picker}
          <Box sx={{ pb: 1.5 }} />
          <Divider />
        </Box>

        {/* Vehicle tree */}
        <Box sx={{ overflowY: "auto", flex: 1 }}>
          {tree}
        </Box>

        {/* Footer with action buttons */}
        <Box sx={{ marginTop: "auto" }}>
          <Divider />
          <Box sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            px: 1,
            py: 0.5,
          }}>
            <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <ResetCameraButton tooltipPlacement="top" size={buttonSize} />
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <ScreenshotButton tooltipPlacement="top" size={buttonSize} />
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <Tooltip title="Collapse" enterDelay={300} leaveDelay={1} placement="top">
                <IconButton onClick={handleToggle} size={buttonSize} color="default">
                  <DoubleArrowIcon fontSize={buttonSize} sx={{ transform: 'scaleX(-1)' }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Collapsed icon rail */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 1,
        gap: 0.5,
        height: '100%',
        opacity: open ? 0 : 1,
        visibility: open ? 'hidden' : 'visible',
        transition: 'opacity 0.2s ease-in-out, visibility 0.2s ease-in-out',
        position: 'absolute',
        top: 0,
        left: 0,
        width: collapsedWidth,
      }}>
        <Box sx={{ flex: 1 }} />
        <ResetCameraButton tooltipPlacement="right" size={buttonSize} />
        <Divider flexItem />
        <ScreenshotButton tooltipPlacement="right" size={buttonSize} />
        <Divider flexItem />
        <Tooltip title="Expand" enterDelay={300} leaveDelay={1} placement="right">
          <IconButton onClick={handleToggle} size={buttonSize} color="default">
            <DoubleArrowIcon fontSize={buttonSize} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
