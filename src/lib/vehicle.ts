import { VehicleSchemaProps, VehicleSchemaLayout, VehicleSchemaLabel } from "@/lib/vehicle-schema";
import { GridProps, GridGetAllFromSchema } from "@/lib/grid";
import { ContainerProps, ContainerGetSize } from "@/lib/container";

/**
 * Properties for a vehicle instance including metadata, layout, and containers.
 */
export interface VehicleProps {
  /** Name of the vehicle */
  name: string;
  /** Manufacturer of the vehicle */
  manufacturer: string;
  /** Current cargo size in SCU */
  size: number;
  /** Maximum cargo capacity in SCU */
  capacity: number;
  /** Grid layout for the vehicle */
  grids: GridProps[];
  /** Containers placed in the vehicle */
  containers: ContainerProps[];
  /** Labels to display on the vehicle */
  labels: LabelProps[];
}

/**
 * Properties for a label in 3D space.
 */
export interface LabelProps {
  /** Text content of the label */
  value: string;
  /** X position */
  x: number;
  /** Z position */
  z: number;
  /** Optional font size */
  fontSize?: number;
  /** Optional rotation in degrees */
  rotation?: number;
}

/**
 * Converts a vehicle schema label to label props.
 * @param schema The schema label to convert
 * @returns Label properties
 */
const LabelConvertFromSchema = (schema: VehicleSchemaLabel): LabelProps => {
  return { ...schema }
}

/**
 * Extracts all labels from a vehicle schema or layout.
 * @param schema The vehicle schema or layout
 * @returns Array of label properties
 */
const LabelGetAllFromSchema = (schema: VehicleSchemaProps | VehicleSchemaLayout): LabelProps[] => {
  let labels: LabelProps[] = [];

  schema.labels?.forEach(schemaLabel => {
    labels.push(LabelConvertFromSchema(schemaLabel));
  })

  return labels;
}

/**
 * Calculates the total SCU size of all visible containers in a vehicle.
 * @param props Array of container properties
 * @returns Total SCU size of all non-hidden containers
 */
const VehicleCalcSize = (props: ContainerProps[]): number => {
  let size = 0;
  // Calculate container size
  props.forEach((container) => {
    if (!container.hidden) {
      size += ContainerGetSize(container);
    }
  });
  return size;
}

/**
 * Counts the number of containers of a specific size in a vehicle.
 * @param props The vehicle properties
 * @param size The SCU size to count
 * @returns Number of visible containers of the specified size
 */
export const VehicleGetContainerCount = (props: VehicleProps, size: number) => {
  let count = 0;
  props.containers.forEach((container) => {
    if (!container.hidden && size === container.width * container.height * container.length) {
      count += 1
    }
  });
  return count;
}

/**
 * Creates a VehicleProps instance from a vehicle schema and container list.
 * @param schema The vehicle schema definition
 * @param useUnofficial Whether to use the unofficial layout
 * @param containers Array of containers to place in the vehicle
 * @returns Complete vehicle properties for rendering
 */
export const VehicleFromSchema = (schema: VehicleSchemaProps, useUnofficial: boolean, containers: ContainerProps[]): VehicleProps => {
  const layout = useUnofficial && schema.unofficial ? schema.unofficial : schema.official;
  return {
    name: schema.name,
    manufacturer: schema.manufacturer,
    size: VehicleCalcSize(containers),
    capacity: layout.capacity,
    grids: GridGetAllFromSchema(layout),
    containers: containers,
    labels: LabelGetAllFromSchema(schema).concat(LabelGetAllFromSchema(layout))
  }
}