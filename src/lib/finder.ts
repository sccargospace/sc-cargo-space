import { VehicleSchemas, VehicleSchemaProps } from "@/lib/vehicle-schema";
import { AutoLoad, isAutoLoadFailure } from "@/lib/autoload";

/**
 * Interface representing a vehicle that can fit the specified containers.
 */
export interface FinderResult {
  /** The vehicle schema */
  schema: VehicleSchemaProps;
  /** Whether using unofficial layout */
  useUnofficial: boolean;
  /** Total SCU capacity of the vehicle */
  capacity: number;
  /** Total SCU requested */
  requestedSCU: number;
  /** Utilization percentage (requestedSCU / capacity * 100) */
  utilization: number;
  /** Whether the containers fit perfectly (100% utilization) */
  perfectFit: boolean;
}

/**
 * Finds vehicles that can accommodate the specified container requirements.
 * Tests both official and unofficial layouts where available.
 * @param containerSizes Map of container sizes to their desired quantities
 * @param preferOfficial Whether to prefer official layouts over unofficial ones when both exist
 * @returns Array of vehicles that can fit the containers, sorted by utilization
 */
export const FindVehiclesForContainers = (
  containerSizes: Map<number, number>,
  preferOfficial: boolean = true
): FinderResult[] => {
  const results: FinderResult[] = [];

  // Calculate total SCU requested
  let requestedSCU = 0;
  containerSizes.forEach((count, size) => {
    requestedSCU += size * count;
  });

  // If no containers requested, return empty results
  if (requestedSCU === 0) {
    return results;
  }

  // Test each vehicle schema
  VehicleSchemas.forEach((schema) => {
    // Test official layout
    const vehicle = testVehicleLayout(schema, false, containerSizes, requestedSCU);
    if (vehicle) {
      results.push(vehicle);
    }

    // Test unofficial layout if available
    if (schema.unofficial && (!preferOfficial || vehicle === null)) {
      const vehicle = testVehicleLayout(schema, true, containerSizes, requestedSCU);
      if (vehicle) {
        results.push(vehicle);
      }
    }
  });

  // Sort by manufacturer first, then by name
  results.sort((a, b) => {
    if (a.schema.manufacturer !== b.schema.manufacturer) {
      return a.schema.manufacturer.localeCompare(b.schema.manufacturer);
    }
    return a.schema.name.localeCompare(b.schema.name);
  });

  return results;
};

/**
 * Tests a specific vehicle layout to see if it can accommodate the containers.
 * @param schema The vehicle schema to test
 * @param useUnofficial Whether to use the unofficial layout
 * @param containerSizes Map of container sizes to quantities
 * @param requestedSCU Total SCU requested
 * @param results FinderResult or null if it cannot accommodate
 */
const testVehicleLayout = (
  schema: VehicleSchemaProps,
  useUnofficial: boolean,
  containerSizes: Map<number, number>,
  requestedSCU: number
): FinderResult | null => {
  try {
    const layout = (useUnofficial && schema.unofficial !== undefined) ? schema.unofficial : schema.official;

    // Skip if vehicle capacity is less than requested SCU
    if (layout.capacity < requestedSCU) {
      return null;
    }

    // Create a copy of container sizes for testing (AutoLoad modifies the map)
    const testContainerSizes = new Map(containerSizes);

    // Try to auto-load the containers
    const loadResult = AutoLoad(layout, testContainerSizes);

    // If auto-load succeeded, add to results
    if (!isAutoLoadFailure(loadResult)) {
      const utilization = (requestedSCU / layout.capacity) * 100;
      const perfectFit = Math.abs(utilization - 100) < 0.01; // Within 0.01% of perfect

      return {
        schema,
        useUnofficial,
        capacity: layout.capacity,
        requestedSCU,
        utilization,
        perfectFit,
      };
    }
  } catch (error) {
    // Skip vehicles with layout errors
    console.warn(`Error testing vehicle ${schema.name}:`, error);
  }

  return null;
};
