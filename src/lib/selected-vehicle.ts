import { VehicleSchemaProps, GetVehicleSchemaKey, VehicleSchemaLayout } from "@/lib/vehicle-schema";
import { VehicleFromSchema, VehicleProps } from "@/lib/vehicle";
import { DeepCopy, ContainerSizes } from "@/lib/util";
import { Cache } from "@/lib/cache";
import { AutoFill, AutoLoad, isAutoLoadFailure, AutoLoadFailure } from "@/lib/autoload";
import { ContainerProps } from "@/lib/container";

/**
 * Properties for a selected vehicle instance.
 */
export interface SelectedVehicleProps {
  /** Schema to define the vehicle"s layout and properties. */
  schema: VehicleSchemaProps;
  /** Boolean to determine if the unofficial layout should be used. */
  useUnofficial: boolean;
  /** Whether this vehicle has custom container configuration (not AutoFill) */
  hasCustomContainers?: boolean;
  /** Container counts */
  containerCounts: {
    1: number;
    2: number;
    4: number;
    8: number;
    16: number;
    24: number;
    32: number;
  };
  /** Error message specific to this vehicle, if any */
  alert?: string;
}

/**
 * Cache for selected vehicles to avoid recalculating container layouts.
 */
let VehicleCache = new Cache<string, VehicleProps>(50);

/**
 * Retrieves a selected vehicle from cache or creates a new one with auto-filled containers.
 * @param schema The vehicle schema to use
 * @param useUnofficial Whether to use the unofficial layout
 * @param containerSizes Map of container sizes to their desired quantities
 * @returns A selected vehicle with the specified containers
 * @throws Error if the containers cannot be loaded into the vehicle
 */
export const GetVehicleFromCache = (
  schema: VehicleSchemaProps,
  useUnofficial: boolean,
  containerSizes?: Map<number, number>
): VehicleProps => {

  let key = GetVehicleSchemaKey(schema, !(useUnofficial && schema.unofficial));
  let hasCustomContainers = false;

  ContainerSizes.forEach((size) => {
    const count = containerSizes?.get(size) || 0;
    if (count > 0) hasCustomContainers = true;
    key += `-${count}`;
  });

  let cachedVehicle = VehicleCache.get(key);
  if (cachedVehicle !== undefined) {
    return DeepCopy(cachedVehicle);
  }
  const layout = useUnofficial && schema.unofficial ? schema.unofficial : schema.official;
  let containers: ContainerProps[] | AutoLoadFailure = [];

  if (!hasCustomContainers) {
    containers = AutoFill(layout);
  } else if (hasCustomContainers && containerSizes !== undefined) {
    containers = AutoLoad(layout, containerSizes);
  }
  else {
    throw new Error(`Failed to load containers into ${schema.name}`);
  }

  if (isAutoLoadFailure(containers)) {
    throw new Error(`${containers.failure}`);
  }

  const vehicle = VehicleFromSchema(schema, useUnofficial, containers);

  VehicleCache.set(key, DeepCopy(vehicle));

  return vehicle;
};

/**
 * Gets the appropriate schema layout (official or unofficial) for a selected vehicle.
 * @param props The selected vehicle properties
 * @returns The corresponding vehicle schema layout
 */
export const SelectedVehicleGetSchemaLayout = (props: SelectedVehicleProps): VehicleSchemaLayout => {
  if (props.useUnofficial && props.schema.unofficial) {
    return props.schema.unofficial;
  } else {
    return props.schema.official;
  }
}