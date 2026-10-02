import { useEffect, useState, useReducer } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MediaQuery from "react-responsive";
import {
  Divider, Box,
  IconButton, Tooltip,
  Fab
} from "@mui/material";
import {
  DoubleArrow as DoubleArrowIcon,
  KeyboardArrowUp as UpIcon,
  KeyboardArrowDown as CloseIcon
} from "@mui/icons-material";
import {
  CenterFocusStrong as ResetCameraIcon,
  CameraAlt as CameraIcon
} from "@mui/icons-material";

import { MobileWidth } from "@/lib/util";
import { VehicleSchemas, VehicleSchemaProps } from "@/lib/vehicle-schema";
import { GetVehicleFromCache, SelectedVehicleProps } from "@/lib/selected-vehicle";
import { ParseVehiclesFromRouter, NormalizedVehicleRouterName, UpdateRouterUrl } from "@/lib/router-utils";
import { VehiclePicker } from "@/features/vehicle-picker/vehicle-picker";
import { VehicleTree } from "@/features/vehicle-tree/vehicle-tree";
import { CommunityLogo } from "@/components/icons/community-logo";
import { useCanvas } from "@/lib/canvas-provider";
import { VehicleProps, VehicleGetContainerCount } from "@/lib/vehicle";
import { VehicleGridLayoutType } from "@/features/vehicle-tree/vehicle-actions";

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
 * Props for Viewer navigation components.
 */
interface ViewerNavProps {
  picker: React.ReactNode;
  tree: React.ReactNode;
}

/**
 * Desktop navigation component that provides a collapsible sidebar with vehicle
 * selection and management tools. Includes toggle functionality and access to
 * settings, help, and about modals.
 */
const ViewerDesktopNav = ({ picker, tree }: ViewerNavProps) => {
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

/**
 * Mobile navigation component that provides a floating action button to open
 * the vehicle picker in full screen mode underneath the app bar.
 */
const ViewerMobileNav = ({ picker, tree }: ViewerNavProps) => {
  const [open, setOpen] = useState(false);
  const buttonSize = "small";

  /**
   * Opens the mobile navigation full screen and hides the canvas.
   */
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  /**
   * Closes the mobile navigation and shows the canvas.
   */
  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        size={buttonSize}
        sx={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          zIndex: 1001,
          pointerEvents: 'auto', // Ensure FAB is clickable
          display: open ? 'none' : 'flex',
        }}
        onClick={handleDrawerOpen}
      >
        <UpIcon />
      </Fab>

      {/* Full screen vehicle picker overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0, // Start from top of viewport (under app bar due to ViewerPage positioning)
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'background.paper',
          zIndex: 1000,
          display: open ? 'flex' : 'none',
          flexDirection: 'column',
          pointerEvents: 'auto', // Enable interactions for mobile overlay
        }}
      >
        {/* Vehicle Picker */}
        <Box sx={{ p: 2 }}>
          {picker}
        </Box>

        <Divider />

        {/* Vehicle Tree */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
          }}
        >
          {tree}
        </Box>

        <Fab
          color="primary"
          size={buttonSize}
          sx={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            zIndex: 1001,
            pointerEvents: 'auto', // Ensure close FAB is clickable
          }}
          onClick={handleDrawerClose}
        >
          <CloseIcon />
        </Fab>
      </Box>
    </>
  );
}

/**
 * ViewerPage component that handles the main vehicle visualization interface.
 * Loads vehicles from URL parameters and displays the 3D canvas with navigation.
 */
export const ViewerRoute = () => {
  const { setVisible, setVehicles } = useCanvas();
  const { vehicles } = useParams<{ vehicles?: string }>();
  const navigate = useNavigate();

  const [viewerState, setViewerState] = useReducer(
    (prev: any, next: any) => ({ ...prev, ...next }),
    {
      selectedVehicles: [] as SelectedVehicleProps[]
    }
  );

  useEffect(() => {
    const vehicleHashes = ParseVehiclesFromRouter(vehicles);
    const cachedVehicles: VehicleProps[] = [];
    const selectedVehicles: SelectedVehicleProps[] = [];

    for (const vehicleHash of vehicleHashes) {
      const vehicleName = vehicleHash.vehicle;
      const official = vehicleHash.official;
      let containerSizes = vehicleHash.containerSizes;
      const foundSchema = VehicleSchemas.find(v => {
        if (NormalizedVehicleRouterName(v.name) === vehicleName) {
          return true;
        }

        if (v.alternativeNames) {
          return v.alternativeNames.some(altName => NormalizedVehicleRouterName(altName) === vehicleName);
        }

        return false;
      }
      );

      if (!foundSchema) {
        console.warn(`Vehicle schema not found for name: ${vehicleName}`);
        continue;
      }

      let vehicle = null as VehicleProps | null;
      let vehicleAlert = undefined as string | undefined;

      try {
        if (!containerSizes || containerSizes.size === 0) {
          // If no container sizes are specified, use cached AutoFill behavior (most efficient)
          vehicle = GetVehicleFromCache(foundSchema, !official);
        } else {
          // Use custom container loading only when explicitly specified
          vehicle = GetVehicleFromCache(foundSchema, !official, containerSizes)
        }
      } catch (error) {
        vehicleAlert = (error as Error).message;
      }

      if (vehicle !== null) {
        // Add to canvas vehicles list for rendering
        cachedVehicles.push(vehicle);
      }

      // Add to selected vehicles list for state
      selectedVehicles.push({
        schema: foundSchema,
        useUnofficial: !official,
        hasCustomContainers: containerSizes && containerSizes.size > 0 ? true : false,
        alert: vehicleAlert,
        containerCounts: {
          // If we have custom container sizes from URL, use those (even if they're invalid)
          // Use ?? instead of || to properly handle 0 values from URL
          1: containerSizes?.get(1) ?? (vehicle ? VehicleGetContainerCount(vehicle, 1) : 0),
          2: containerSizes?.get(2) ?? (vehicle ? VehicleGetContainerCount(vehicle, 2) : 0),
          4: containerSizes?.get(4) ?? (vehicle ? VehicleGetContainerCount(vehicle, 4) : 0),
          8: containerSizes?.get(8) ?? (vehicle ? VehicleGetContainerCount(vehicle, 8) : 0),
          16: containerSizes?.get(16) ?? (vehicle ? VehicleGetContainerCount(vehicle, 16) : 0),
          24: containerSizes?.get(24) ?? (vehicle ? VehicleGetContainerCount(vehicle, 24) : 0),
          32: containerSizes?.get(32) ?? (vehicle ? VehicleGetContainerCount(vehicle, 32) : 0)
        }
      });
    }

    // Update state with loaded vehicles
    if (selectedVehicles.length > 0) {
      setViewerState({
        selectedVehicles: selectedVehicles
      });
      setVehicles(cachedVehicles);
    } else if (vehicles && vehicles.trim() !== "") {
      // If vehicles were specified but none loaded, navigate to empty viewer
      navigate("/v1/viewer", { replace: true });
    } else {
      // Clear vehicles if no vehicles in URL
      setViewerState({
        selectedVehicles: []
      });
      setVehicles([]);
    }
  }, [vehicles, navigate]);

  // Make sure canvas is visible when on viewer route
  useEffect(() => {
    setVisible(true);
  }, [setVisible]);

  const handleVehiclePicked = (vehicle: VehicleSchemaProps) => {
    // Load the vehicle to get its AutoFill container counts
    const updatedVehicles = [...viewerState.selectedVehicles,
    {
      schema: vehicle,
      hasCustomContainers: false,
      containerCounts: {
        1: 0,
        2: 0,
        4: 0,
        8: 0,
        16: 0,
        24: 0,
        32: 0
      },
      useUnofficial: false
    }
    ];
    UpdateRouterUrl(updatedVehicles, navigate);
  };

  const handleVehicleLoadoutChange = (updatedVehicle: SelectedVehicleProps) => {
    const updatedVehicles = viewerState.selectedVehicles.map((v: SelectedVehicleProps) =>
      v.schema.name === updatedVehicle.schema.name ? updatedVehicle : v
    );
    UpdateRouterUrl(updatedVehicles, navigate);
  };

  const handleVehicleDelete = (vehicleToDelete: SelectedVehicleProps) => {
    const updatedVehicles = viewerState.selectedVehicles.filter((v: SelectedVehicleProps) => v.schema.name !== vehicleToDelete.schema.name);
    UpdateRouterUrl(updatedVehicles, navigate);
  };

  const handleVehicleGridChange = (updatedVehicle: SelectedVehicleProps, newGridLayout: VehicleGridLayoutType) => {
    const newVehicle: SelectedVehicleProps = {
      ...updatedVehicle,
      useUnofficial: newGridLayout === VehicleGridLayoutType.Unofficial,
      hasCustomContainers: false
    };
    const updatedVehicles = viewerState.selectedVehicles.map((v: SelectedVehicleProps) =>
      v.schema.name === newVehicle.schema.name ? newVehicle : v
    );
    UpdateRouterUrl(updatedVehicles, navigate);
  }

  const handleVehicleReset = (vehicleToReset: SelectedVehicleProps) => {
    const updatedVehicles = viewerState.selectedVehicles.map((v: SelectedVehicleProps) => {
      if (v.schema.name === vehicleToReset.schema.name) {
        return {
          ...v,
          hasCustomContainers: false,
          containerCounts: {
            1: 0,
            2: 0,
            4: 0,
            8: 0,
            16: 0,
            24: 0,
            32: 0
          }
        };
      }
      return v;
    });
    UpdateRouterUrl(updatedVehicles, navigate);
  }

  return (
    <Box sx={{
      position: 'relative', // For absolute positioning of sidebar
      height: '100%',
      width: '100%',
      overflow: 'hidden'
    }}>
      {/* ViewerMobileNav */}
      <MediaQuery maxWidth={MobileWidth}>
        <ViewerMobileNav
          picker={
            <VehiclePicker
              vehicles={viewerState.selectedVehicles}
              onVehiclePicked={handleVehiclePicked}
            />
          }
          tree={
            <VehicleTree
              vehicles={viewerState.selectedVehicles}
              actions={{
                onVehicleLoadoutChange: handleVehicleLoadoutChange,
                onVehicleDelete: handleVehicleDelete,
                onVehicleReset: handleVehicleReset,
                onGridLayoutChange: handleVehicleGridChange,
                onAlertClear: (vehicleName: string) => {
                  const updatedVehicles = viewerState.selectedVehicles.map((v: SelectedVehicleProps) =>
                    v.schema.name === vehicleName ? { ...v, alert: undefined } : v
                  );
                  setViewerState({ selectedVehicles: updatedVehicles });
                }
              }}
            />
          }
        />
      </MediaQuery>

      {/* ViewerDesktopNav - positioned absolutely on top */}
      <MediaQuery minWidth={MobileWidth + 1}>
        <ViewerDesktopNav
          picker={
            <VehiclePicker
              vehicles={viewerState.selectedVehicles}
              onVehiclePicked={handleVehiclePicked}
            />
          }
          tree={
            <VehicleTree
              vehicles={viewerState.selectedVehicles}
              actions={{
                onVehicleLoadoutChange: handleVehicleLoadoutChange,
                onVehicleDelete: handleVehicleDelete,
                onVehicleReset: handleVehicleReset,
                onGridLayoutChange: handleVehicleGridChange,
                onAlertClear: (vehicleName: string) => {
                  const updatedVehicles = viewerState.selectedVehicles.map((v: SelectedVehicleProps) =>
                    v.schema.name === vehicleName ? { ...v, alert: undefined } : v
                  );
                  setViewerState({ selectedVehicles: updatedVehicles });
                }
              }}
            />
          }
        />
        {/* Made by the community logo */}
        <CommunityLogo />
      </MediaQuery>
    </Box>
  );
}