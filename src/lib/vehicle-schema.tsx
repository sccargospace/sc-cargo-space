/**
 * The main schema for a vehicle, including layouts and labels.
 */
export interface VehicleSchemaProps {
  /** The name of the vehicle, e.g. "Aurora MR" */
  name: string;
  /** The manufacturer of the vehicle, e.g. "Roberts Space Industries" */
  manufacturer: string;
  /** Official layout of the vehicle, which only contains snappable grids. */
  official: VehicleSchemaLayout;
  /** Unofficial layout of the vehicle, which may contain non-snappable grids. */
  unofficial?: VehicleSchemaLayout;
  /** Labels that are displayed with either layout. */
  labels?: VehicleSchemaLabel[];
  /** Previous or alternative names accepted in saved URLs and search. */
  alternativeNames?: string[];
  /** Search-only aliases; these may be shared by multiple vehicles. */
  searchAliases?: string[];
}

/**
 * Layout of a vehicle, including cargo capacity and grid groups.
 */
export interface VehicleSchemaLayout {
  name?: string;
  /** The capacity of the vehicle in Standard Cargo Units (SCU). */
  capacity: number;
  /** An array of groups that contain grids. */
  groups: VehicleSchemaGridGroup[];
  /** Labels that are displayed with this layout. */
  labels?: VehicleSchemaLabel[];
}

/**
 * Grouping of grids together. A grouping usually represents a room on the ship or an area with multiple grids in close proximity.
 */
export interface VehicleSchemaGridGroup {
  name?: string;
  x: number;
  z: number;
  /** Grids in this group */
  grids: VehicleSchemaGrid[];
}

/**
 * A grid is a 3D space that can contain containers.
 */
export interface VehicleSchemaGrid {
  name?: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  length: number;
  /** Optional fields */
  maxSize?: number;
  minSize?: number;
  unsecured?: boolean;
  preferHorizontal?: boolean;
}

/**
 * Label for a vehicle layout or grid.
 */
export interface VehicleSchemaLabel {
  value: string;
  x: number;
  z: number;
  fontSize?: number;
  rotation?: number;
  /** Optional category for filtering labels */
  categories?: string[];
}

/**
 * Creates a short hash from an object for use as a cache key.
 * Uses a simple hash function for immediate use and good performance.
 */
const createKeyHash = (obj: any, prefix: string): string => {
  const str = JSON.stringify(obj);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `${prefix}-${Math.abs(hash).toString(16)}`;
};

/**
 * Generates a unique key for a vehicle schema based on its manufacturer, name, and whether it's official or unofficial.
 * @param schema The vehicle schema object.
 * @param official Boolean indicating if the schema is official or unofficial.
 * @returns A unique string key for the vehicle schema.
 */
export const GetVehicleSchemaKey = (schema: VehicleSchemaProps, official: boolean) => {
  const keyData = {
    manufacturer: schema.manufacturer,
    name: schema.name,
    official
  };
  return createKeyHash(keyData, 'kv');
}

/**
 * Generates a unique key for a vehicle layout based on its name, capacity, number of groups, and the details of its groups and grids.
 * @param layout The vehicle schema layout object.
 * @returns A unique string key for the vehicle layout.
 */

export const GetLayoutSchemaKey = (layout: VehicleSchemaLayout) => {
  return createKeyHash(layout, 'kl');
}

/**
 * Generates a unique key for a grid group within a vehicle layout.
 * @param group The grid group object.
 * @param groupIndex The index of the group within the layout.
 * @returns A unique string key for the grid group.
 */
export const GetGroupSchemaKey = (group: VehicleSchemaGridGroup, groupIndex: number) => {
  const keyData = { ...group, groupIndex };
  return createKeyHash(keyData, 'kgr');
}

/**
 * Generates a unique key for a grid within a vehicle layout.
 * @param grid The grid object.
 * @param index The index of the grid within its group.
 * @returns A unique string key for the grid.
 */

export const GetGridSchemaKey = (grid: VehicleSchemaGrid, groupIndex: number, gridIndex: number) => {
  const keyData = { ...grid, groupIndex, gridIndex };
  return createKeyHash(keyData, 'kg');
}

/**
 * Import all vehicle schemas from the grids directory.
 * Sort by manufacturer and name.
 */
export const VehicleSchemas: VehicleSchemaProps[] = Array.from(Object.values(import.meta.glob("../grids/*.json", { eager: true })).map((module: any) => module.default));
VehicleSchemas.sort((a, b) => (a.manufacturer + " " + a.name).localeCompare((b.manufacturer + " " + b.name)));
