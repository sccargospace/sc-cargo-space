import { NavigateFunction } from "react-router-dom";
import { SelectedVehicleProps } from "@/lib/selected-vehicle";
import { ContainerSizes } from "@/lib/util";

/**
 * Codes representing container sizes for URL encoding.
 */
const ContainerCodes = ['q', 'w', 'e', 'r', 't', 'y', 'u']; // q=1scu, w=2scu, e=4scu, r=8scu, t=16scu, y=24scu, u=32scu

/**
 * Normalizes a vehicle name for consistent URL routing.
 * @param vehicleName The vehicle name to normalize
 * @returns The normalized vehicle name in lowercase
 */
export const NormalizedVehicleRouterName = (vehicleName: string) => {
  return vehicleName.toLowerCase();
}

/**
 * Creates a URL path segment for a single vehicle selection.
 * @param vehicle The selected vehicle to convert to URL format
 * @returns URL segment representing the vehicle and layout selection
 */
const VehicleUrlSegment = (vehicle: SelectedVehicleProps) => {
  let segment = NormalizedVehicleRouterName(vehicle.schema.name);

  if (vehicle.useUnofficial && vehicle.schema.unofficial !== undefined) {
    segment += '-unofficial';
  } else {
    segment += '-official';
  }

  // Only add container specifications if the vehicle has custom containers
  if (vehicle.hasCustomContainers) {
    ContainerSizes.forEach((size, index) => {
      const count = vehicle.containerCounts[size as keyof typeof vehicle.containerCounts];
      if (count > 0) {
        segment += `-${ContainerCodes[index]}${count}`;
      }
    });
  }

  return segment;
}

/**
 * Creates a URL path for multiple vehicle selections.
 * @param vehicles Array of selected vehicles to convert to URL
 * @returns URL path representing all vehicle selections
 */
const VehiclesUrlPath = (vehicles: SelectedVehicleProps[]) => {
  if (vehicles.length === 0) {
    return "/v1/viewer";
  }

  const segments = vehicles.map(vehicle => VehicleUrlSegment(vehicle));
  return `/v1/viewer/${segments.join(",")}`;
}

/**
 * Updates the browser URL using React Router navigation.
 * @param vehicles Array of selected vehicles
 * @param navigate React Router navigate function
 */
export const UpdateRouterUrl = (vehicles: SelectedVehicleProps[], navigate: NavigateFunction) => {
  const path = VehiclesUrlPath(vehicles);
  navigate(path, { replace: true });
}

/**
 * Updates the browser URL without triggering React Router navigation.
 * This preserves component state and scroll position while keeping URL in sync.
 * @param vehicles Array of selected vehicles
 */
export const UpdateUrlWithoutNavigation = (vehicles: SelectedVehicleProps[]) => {
  const path = VehiclesUrlPath(vehicles);
  // Use hash prefix for HashRouter compatibility
  window.history.replaceState(null, '', `#${path}`);
}

/**
 * Parses vehicle selections from URL parameters.
 * @param vehiclesParam The vehicles parameter from the URL
 * @returns Array of vehicle name, official layout selections, and optional container specifications
 */
export const ParseVehiclesFromRouter = (vehiclesParam: string | undefined) => {
  if (!vehiclesParam) {
    return [];
  }

  const vehicleNames = vehiclesParam.split(",");
  const values = [];

  for (const vehicleName of vehicleNames) {
    const nameSplit = vehicleName.split("-");

    // Find the official/unofficial part
    let layoutIndex = -1;
    for (let i = nameSplit.length - 1; i >= 0; i--) {
      if (nameSplit[i] === "official" || nameSplit[i] === "unofficial") {
        layoutIndex = i;
        break;
      }
    }

    if (layoutIndex === -1) {
      // No layout specification found, skip this vehicle
      continue;
    }

    const vehicle = nameSplit.slice(0, layoutIndex).join("-");
    const official = nameSplit[layoutIndex] === "official";

    // Parse container specifications from the remaining segments (if any)
    const containerSpecs = nameSplit.slice(layoutIndex + 1);
    let containerSizes: Map<number, number> | undefined = undefined;

    // Only parse container specifications if they exist
    if (containerSpecs.length > 0) {
      containerSizes = new Map<number, number>();
      for (const spec of containerSpecs) {
        if (spec.length >= 2) {
          const code = spec[0];
          const countStr = spec.slice(1);
          const count = parseInt(countStr, 10);

          if (!isNaN(count) && count > 0) {
            const codeIndex = ContainerCodes.indexOf(code);
            if (codeIndex !== -1) {
              const size = ContainerSizes[codeIndex];
              containerSizes.set(size, count);
            }
          }
        }
      }
    }

    values.push({ vehicle, official, containerSizes });
  }

  return values;
};