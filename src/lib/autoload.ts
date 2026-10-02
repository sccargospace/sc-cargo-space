import { ContainerProps } from "@/lib/container";
import {
  VehicleSchemaLayout,
  VehicleSchemaGrid
} from "@/lib/vehicle-schema";

/**
 * Container dimension definitions for different SCU sizes.
 */
const CONTAINER_DIMENSIONS: Record<number, { length: number; width: number; height: number }> = {
  1: { length: 1, width: 1, height: 1 },
  2: { length: 2, width: 1, height: 1 },
  4: { length: 2, width: 2, height: 1 },
  8: { length: 2, width: 2, height: 2 },
  16: { length: 4, width: 2, height: 2 },
  24: { length: 6, width: 2, height: 2 },
  32: { length: 8, width: 2, height: 2 },
};

/**
 * Gets container dimensions, optionally rotated 90 degrees.
 * @param size The SCU size of the container
 * @param rotation Whether to rotate the container (0 or 90 degrees)
 * @returns The dimensions object with length, width, and height
 */
const GetDimensions = (size: number, rotation: 0 | 90) => {
  const dims = CONTAINER_DIMENSIONS[size];
  return rotation === 0
    ? { ...dims }
    : { length: dims.width, width: dims.length, height: dims.height };
}

/**
 * Checks if a container can be placed at a specific position in a grid.
 * Validates bounds, space availability, and stacking rules.
 * @param space 3D boolean array representing occupied space
 * @param grid The grid to place the container in
 * @param x X position to place container
 * @param y Y position to place container  
 * @param z Z position to place container
 * @param dim Container dimensions
 * @returns True if the container can be placed at the position
 */
const CanPlaceContainer = (
  space: boolean[][][],
  grid: VehicleSchemaGrid,
  x: number,
  y: number,
  z: number,
  dim: { length: number; width: number; height: number }
): boolean => {
  if (
    x + dim.width > grid.width ||
    y + dim.height > grid.height ||
    z + dim.length > grid.length
  ) {
    return false;
  }

  for (let dx = 0; dx < dim.width; dx++) {
    for (let dy = 0; dy < dim.height; dy++) {
      for (let dz = 0; dz < dim.length; dz++) {
        if (space[x + dx][y + dy][z + dz]) return false;
      }
    }
  }

  // Check stacking rules: if not at base layer, everything must be supported
  if (y > 0) {
    for (let dx = 0; dx < dim.width; dx++) {
      for (let dz = 0; dz < dim.length; dz++) {
        if (!space[x + dx][y - 1][z + dz]) return false;
      }
    }
  }

  return true;
}

/**
 * Places a container into the grid space by marking occupied positions.
 * @param space 3D boolean array representing occupied space
 * @param x X position to place container
 * @param y Y position to place container
 * @param z Z position to place container
 * @param dim Container dimensions
 */
const PlaceContainer = (
  space: boolean[][][],
  x: number,
  y: number,
  z: number,
  dim: { length: number; width: number; height: number }
) => {
  for (let dx = 0; dx < dim.width; dx++) {
    for (let dy = 0; dy < dim.height; dy++) {
      for (let dz = 0; dz < dim.length; dz++) {
        space[x + dx][y + dy][z + dz] = true;
      }
    }
  }
}

/**
 * Creates a new 3D boolean array for each grid in the schema to track occupied space.
 * @param schema The vehicle schema layout
 * @returns A map of grid IDs to their 3D space arrays
 */
const NewGridArray = (
  schema: VehicleSchemaLayout
): Map<string, boolean[][][]> => {
  const spaces = new Map<string, boolean[][][]>();
  for (let groupIndex = 0; groupIndex < schema.groups.length; groupIndex++) {
    const group = schema.groups[groupIndex];
    for (let gridIndex = 0; gridIndex < group.grids.length; gridIndex++) {
      const grid = group.grids[gridIndex];
      const space = Array(grid.width).fill(false).map(() => {
        return Array(grid.height).fill(false).map(() => {
          return Array(grid.length).fill(false);
        });
      });
      spaces.set(GridArrayKey(groupIndex, gridIndex), space);
    }
  }
  return spaces;
}

/**
 * Generates a unique key for a grid array based on its group and grid indices.
 * @param groupIndex The index of the group within the layout.
 * @param gridIndex The index of the grid within the group.
 * @returns A unique string key for the grid array.
 */
const GridArrayKey = (groupIndex: number, gridIndex: number) => {
  return `${groupIndex}-${gridIndex}`;
}

/**
 * Interface representing an auto-load failure with details about what went wrong.
 */
export interface AutoLoadFailure {
  /** Failure description */
  failure: string;
  /** The size of container that failed to place */
  containerSize: number;
  /** The index of the container that failed */
  containerIndex: number;
}

/**
 * Type guard to check if a value is an AutoLoadFailure.
 * @param value The value to check
 * @returns True if the value is an AutoLoadFailure
 */
export const isAutoLoadFailure = (value: ContainerProps[] | AutoLoadFailure): value is AutoLoadFailure => {
  return (value as AutoLoadFailure).failure !== undefined;
}

/**
 * Automatically fills a vehicle layout with the maximum number of containers possible.
 * Uses caching to avoid recalculating the same layouts.
 * @param schema The vehicle schema layout to fill
 * @returns Array of container props or an AutoLoadFailure if unsuccessful
 */
export const AutoFill = (schema: VehicleSchemaLayout): ContainerProps[] | AutoLoadFailure => {
  // First, check if loadout is in cache already.
  const containers: ContainerProps[] = [];
  const spaces = NewGridArray(schema);
  // Define container sizes to try.
  const sizes = [32, 24, 16, 8, 4, 2, 1];
  // Walk the groups
  for (let groupIndex = 0; groupIndex < schema.groups.length; groupIndex++) {
    const group = schema.groups[groupIndex];
    // Walk the grids
    for (let gridIndex = 0; gridIndex < group.grids.length; gridIndex++) {
      const grid = group.grids[gridIndex];
      const gridKey = GridArrayKey(groupIndex, gridIndex);
      // Create the space context.
      const space = spaces.get(gridKey);
      if (!space) {
        return {
          failure: `Failed to create space for grid ${gridKey}`,
          containerSize: 0,
          containerIndex: 0
        };
      }
      // Fill the bigger size containers first.
      for (const size of sizes) {
        // Skip if the size is bigger than the grid's max size.
        if (grid.maxSize !== undefined && size > grid.maxSize) {
          continue;
        }
        // Skip if the size is smaller than the grid's min size.
        if (grid.minSize !== undefined && size < grid.minSize) {
          continue;
        }
        // Prioritize lower positions.
        for (let y = 0; y < grid.height; y++) {
          // Prioritize slots in the front.
          for (let z = 0; z < grid.length; z++) {
            // Prioritize slots on the right.
            for (let x = 0; x < grid.width; x++) {
              let rotations: (0 | 90)[] = grid.preferHorizontal ? [90, 0] : [0, 90];
              for (const rotation of rotations) {
                const dim = GetDimensions(size, rotation);
                if (CanPlaceContainer(space, grid, x, y, z, dim)) {
                  PlaceContainer(space, x, y, z, dim);
                  containers.push({
                    x: group.x + grid.x + x,
                    y: grid.y + y,
                    z: group.z + grid.z + z,
                    width: dim.width,
                    height: dim.height,
                    length: dim.length,
                    hidden: false,
                    unsecured: grid.unsecured ?? false,
                  });
                }
              }
            }
          }
        }
      }
    }
  }

  return containers;
}

/**
 * Gets the next container size to place from the available containers.
 * Prioritizes larger containers first (32 SCU down to 1 SCU).
 * @param containerSizes Map of container sizes to their available counts
 * @returns The next container size to place, or null if none available
 */
const GetNextContainerSize = (containerSizes: Map<number, number>): number | null => {
  for (let size of [32, 24, 16, 8, 4, 2, 1]) {
    let count = containerSizes.get(size);
    if (count === undefined || count <= 0) {
      continue;
    }
    count -= 1;
    containerSizes.set(size, count);
    return size;
  }

  return null;
}

/**
 * Loads containers into a vehicle layout according to specified quantities.
 * Places containers optimally, prioritizing larger containers first.
 * @param schema The vehicle schema layout
 * @param containerSizes Map of container sizes to desired quantities (not modified)
 * @returns Array of placed containers or an AutoLoadFailure if unsuccessful
 */
export const AutoLoad = (schema: VehicleSchemaLayout, containerSizes: Map<number, number>): ContainerProps[] | AutoLoadFailure => {
  const containers: ContainerProps[] = [];
  const spaces = NewGridArray(schema);
  // Create a copy of containerSizes to avoid mutating the input parameter
  const remainingContainers = new Map(containerSizes);
  let containerSize: number | null = null;

  // Keep iterating until we run out of containers or space.
  while ((containerSize = GetNextContainerSize(remainingContainers)) !== null) {
    let placed = false;

    // Walk each grid group.
    for (let groupIndex = 0; groupIndex < schema.groups.length; groupIndex++) {
      const group = schema.groups[groupIndex];
      // Walk each grid in the group.
      for (let gridIndex = 0; gridIndex < group.grids.length; gridIndex++) {
        const grid = group.grids[gridIndex];
        // Skip if the size is bigger than the grid's max size.
        if (grid.maxSize !== undefined && containerSize > grid.maxSize) {
          continue;
        }
        // Skip if the size is smaller than the grid's min size.
        if (grid.minSize !== undefined && containerSize < grid.minSize) {
          continue;
        }

        // Grab the space array
        let space = spaces.get(GridArrayKey(groupIndex, gridIndex));
        if (!space) {
          let index = remainingContainers.get(containerSize) || 0;
          return {
            failure: `Failed to place a ${containerSize}scu container. (I:${index})`,
            containerSize: containerSize,
            containerIndex: index
          };
        }

        // Prioritize lower positions.
        for (let y = 0; y < grid.height && !placed; y++) {
          // Prioritize slots in the front.
          for (let z = 0; z < grid.length && !placed; z++) {
            // Prioritize slots on the right.
            for (let x = 0; x < grid.width && !placed; x++) {
              for (const rotation of [0, 90] as const) {
                if (placed) {
                  break;
                }
                const dim = GetDimensions(containerSize, rotation);
                if (CanPlaceContainer(space, grid, x, y, z, dim)) {
                  PlaceContainer(space, x, y, z, dim);
                  containers.push({
                    x: group.x + grid.x + x,
                    y: grid.y + y,
                    z: group.z + grid.z + z,
                    width: dim.width,
                    height: dim.height,
                    length: dim.length,
                    hidden: false,
                    unsecured: grid.unsecured ?? false,
                  });
                  placed = true;
                  break;
                }
              }
            }
          }
        }
        if (placed) break;
      }
      if (placed) break;
    }

    if (!placed) {
      let index = remainingContainers.get(containerSize) || 0;
      return {
        failure: `Failed to place a ${containerSize}scu container. (I:${index})`,
        containerSize: containerSize,
        containerIndex: index
      };
    }
  }

  return containers;
}
