import { useEffect, useReducer } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { Box } from "@mui/material";

import { MobileWidth } from "@/lib/util";
import { VehicleSchemas, VehicleSchemaProps } from "@/lib/vehicle-schema";
import { GetVehicleFromCache, SelectedVehicleProps } from "@/lib/selected-vehicle";
import { ParseVehiclesFromRouter, NormalizedVehicleRouterName, UpdateRouterUrl } from "@/lib/router-utils";
import { VehiclePicker } from "@/components/vehicle-picker/vehicle-picker";
import { VehicleTree } from "@/components/vehicle-tree/vehicle-tree";
import { ViewerDesktopNav } from "@/components/viewer/viewer-desktop-nav";
import { ViewerMobileNav } from "@/components/viewer/viewer-mobile-nav";
import { CommunityLogo } from "@/components/icons/community-logo";
import { useCanvas } from "@/lib/canvas-provider";
import { VehicleProps, VehicleGetContainerCount } from "@/lib/vehicle";
import { VehicleGridLayoutType } from "@/components/vehicle-tree/vehicle-actions";

/**
 * ViewerPage component that handles the main vehicle visualization interface.
 * Loads vehicles from URL parameters and displays the 3D canvas with navigation.
 */
export const ViewerRoute = () => {
  const { setVisible, setVehicles } = useCanvas();
  const { vehicles } = useParams<{ vehicles?: string }>();
  const navigate = useNavigate();
  const isMobileViewer = useMediaQuery({
    query: `(max-width: ${MobileWidth}px), (pointer: coarse) and (max-height: ${MobileWidth}px)`,
  });

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
      {isMobileViewer ? (
        <ViewerMobileNav
          vehicles={viewerState.selectedVehicles}
          onVehiclePicked={handleVehiclePicked}
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
      ) : (
        <>
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
        </>
      )}
    </Box>
  );
}
