import { VehicleSchemaLayout, VehicleSchemaGridGroup } from "@/lib/vehicle-schema";

/**
 * Properties for a grid, including position and size.
 */
export interface GridProps {
  /** X position of the grid */
  x: number;
  /** Z position of the grid */
  z: number;
  /** Width of the grid */
  width: number;
  /** Length of the grid */
  length: number;
}

/**
 * Converts all groups in a VehicleSchemaLayout to an array of GridProps.
 * @param schema The vehicle schema layout.
 * @returns Array of GridProps for each group.
 */
export const GridGetAllFromSchema = (schema: VehicleSchemaLayout): GridProps[] => {
  return schema.groups.map(group => GridConvertFromSchema(group));
}

/**
 * Padding added to the grid base.
 */
const gridBasePadding = 1;

/**
 * Converts a VehicleSchemaGridGroup to GridProps, calculating the bounding box and adding padding.
 * @param schema The grid group schema to convert.
 * @returns The calculated GridProps.
 */
export const GridConvertFromSchema = (schema: VehicleSchemaGridGroup): GridProps => {
  if (schema.grids.length <= 0) {
    throw new Error("Schema has no grids");
  }

  // Find the min and max X/Z coordinates
  let baseX = schema.x;
  let baseZ = schema.z;
  let minX = baseX + schema.grids[0].x;
  let maxX = baseX + schema.grids[0].x + schema.grids[0].width;
  let minZ = baseZ + schema.grids[0].z;
  let maxZ = baseZ + schema.grids[0].z + schema.grids[0].length;

  schema.grids.map(grid => (
    minX = Math.min(minX, baseX + grid.x),
    maxX = Math.max(maxX, baseX + grid.x + grid.width),
    minZ = Math.min(minZ, baseZ + grid.z),
    maxZ = Math.max(maxZ, baseZ + grid.z + grid.length)
  ));

  // Add padding
  minX -= gridBasePadding;
  maxX += gridBasePadding;
  minZ -= gridBasePadding;
  maxZ += gridBasePadding;

  let width = maxX - minX;
  let length = maxZ - minZ;

  return {
    x: minX,
    z: minZ,
    width,
    length
  };
}