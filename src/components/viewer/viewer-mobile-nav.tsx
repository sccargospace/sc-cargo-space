import { ReactNode, useEffect, useRef, useState } from "react";
import { Box, Button, Divider, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import {
  Add,
  CameraAlt,
  CenterFocusStrong,
  Close,
  ExpandLess,
  ExpandMore,
  GridView,
} from "@mui/icons-material";

import { VehiclePicker } from "@/components/vehicle-picker/vehicle-picker";
import { useCanvas } from "@/lib/canvas-provider";
import { SelectedVehicleProps } from "@/lib/selected-vehicle";
import { VehicleSchemaProps } from "@/lib/vehicle-schema";

interface ViewerMobileNavProps {
  vehicles: SelectedVehicleProps[];
  onVehiclePicked: (vehicle: VehicleSchemaProps) => void;
  tree: ReactNode;
}

/** A nonmodal ship panel: the uncovered canvas remains available for navigation. */
export const ViewerMobileNav = ({ vehicles, onVehiclePicked, tree }: ViewerMobileNavProps) => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const shipButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const wasOpen = useRef(false);
  const { state, resetCamera, takeScreenshot } = useCanvas();

  useEffect(() => {
    if (open) closeButtonRef.current?.focus({ preventScroll: true });
    else if (wasOpen.current) shipButtonRef.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);

  // Mobile keyboards can shrink the visual viewport without resizing the page.
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport || !open) return;

    const updateInset = () => {
      // Pinch zoom also changes the visual viewport; it is not a keyboard inset.
      setKeyboardInset(viewport.scale === 1
        ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
        : 0);
    };
    updateInset();
    viewport.addEventListener("resize", updateInset);
    viewport.addEventListener("scroll", updateInset);
    return () => {
      viewport.removeEventListener("resize", updateInset);
      viewport.removeEventListener("scroll", updateInset);
    };
  }, [open]);

  useEffect(() => {
    if (!open || keyboardInset === 0) return;
    const focused = document.activeElement;
    if (focused instanceof HTMLElement && panelRef.current?.contains(focused)) {
      focused.scrollIntoView({ block: "nearest" });
    }
  }, [keyboardInset, open]);

  const closePanel = () => {
    setOpen(false);
    setExpanded(false);
    setKeyboardInset(0);
  };

  return (
    <>
      <Paper
        elevation={4}
        role="group"
        aria-label="Viewer controls"
        sx={{
          position: "absolute",
          bottom: "max(12px, env(safe-area-inset-bottom))",
          left: "max(12px, env(safe-area-inset-left))",
          right: "max(12px, env(safe-area-inset-right))",
          zIndex: 100,
          display: open ? "none" : "flex",
          alignItems: "center",
          gap: 0.5,
          p: 0.75,
          borderRadius: 3,
          border: 1,
          borderColor: "divider",
          width: "fit-content",
          maxWidth: "calc(100% - 24px)",
          mx: "auto",
        }}
      >
        <Button
          ref={shipButtonRef}
          variant="contained"
          disableElevation
          startIcon={vehicles.length === 0 ? <Add /> : <GridView />}
          aria-expanded={open}
          aria-controls="mobile-ships-panel"
          onClick={() => setOpen(true)}
          sx={{ minHeight: 48, px: 2, whiteSpace: "nowrap", borderRadius: 2 }}
        >
          {vehicles.length === 0 ? "Add ship" : `Ships · ${vehicles.length}`}
        </Button>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <Tooltip title="Reset view">
          <span>
            <IconButton
              aria-label="Reset view"
              disabled={!state.controls}
              onClick={resetCamera}
              sx={{ width: 48, height: 48 }}
            >
              <CenterFocusStrong />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Take screenshot">
          <span>
            <IconButton
              aria-label="Take screenshot"
              disabled={!state.controls}
              onClick={takeScreenshot}
              sx={{ width: 48, height: 48 }}
            >
              <CameraAlt />
            </IconButton>
          </span>
        </Tooltip>
      </Paper>

      {/* Keep the tree mounted so closing the panel preserves unfinished edits. */}
      <Paper
        ref={panelRef}
        component="section"
        id="mobile-ships-panel"
        aria-labelledby="mobile-ships-title"
        elevation={8}
        onKeyDown={event => {
          // The picker handles Escape first when its suggestions are open.
          if (event.key === "Escape" && !event.defaultPrevented) {
            event.preventDefault();
            closePanel();
          }
        }}
        sx={{
          position: "absolute",
          zIndex: 101,
          display: open ? "flex" : "none",
          flexDirection: "column",
          bottom: keyboardInset,
          left: 0,
          right: 0,
          height: expanded || keyboardInset > 0 ? `calc(100% - ${keyboardInset}px - 12px)` : "55%",
          maxHeight: `calc(100% - ${keyboardInset}px - 12px)`,
          borderRadius: "20px 20px 0 0",
          border: 1,
          borderColor: "divider",
          overflow: "hidden",
          pl: "env(safe-area-inset-left)",
          pr: "env(safe-area-inset-right)",
          pb: "env(safe-area-inset-bottom)",
          "@media (orientation: landscape)": {
            left: "auto",
            width: "min(360px, 50%)",
            height: `calc(100% - ${keyboardInset}px)`,
            maxHeight: `calc(100% - ${keyboardInset}px)`,
            borderRadius: "16px 0 0 16px",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 2, py: 0.75, flexShrink: 0 }}>
          <Typography id="mobile-ships-title" component="h2" variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
            Ships & cargo
          </Typography>
          <Tooltip title={expanded ? "Shrink panel" : "Expand panel"}>
            <IconButton
              aria-label={expanded ? "Shrink panel" : "Expand panel"}
              aria-expanded={expanded}
              onClick={() => setExpanded(value => !value)}
              sx={{ width: 48, height: 48, "@media (orientation: landscape)": { display: "none" } }}
            >
              {expanded ? <ExpandMore /> : <ExpandLess />}
            </IconButton>
          </Tooltip>
          <Button
            ref={closeButtonRef}
            onClick={closePanel}
            startIcon={<Close />}
            sx={{ minHeight: 48 }}
          >
            Close
          </Button>
        </Box>
        <Divider />
        <Box sx={{ overflowY: "auto", minHeight: 0, flex: 1, overscrollBehavior: "contain", py: 2 }}>
          <VehiclePicker
            vehicles={vehicles}
            onVehiclePicked={vehicle => {
              onVehiclePicked(vehicle);
              closePanel();
            }}
          />
          {vehicles.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ px: 2, pt: 2 }}>
              Choose a ship to view its cargo grid. Add more ships to compare them.
            </Typography>
          ) : (
            <Box sx={{
              pt: 2,
              "& .MuiIconButton-root": { minWidth: 44, minHeight: 44 },
              "& .MuiListItem-root": { pr: 7 },
              "& .MuiButton-root, & .MuiToggleButton-root, & .MuiListItemButton-root": { minHeight: 44 },
              "& input": { fontSize: 16, scrollMarginBlock: "16px" },
            }}>{tree}</Box>
          )}
        </Box>
      </Paper>
    </>
  );
};
