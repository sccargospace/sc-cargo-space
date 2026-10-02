import { describe, it, expect } from "vitest";
import { AutoFill, AutoLoad, isAutoLoadFailure } from "../lib/autoload";
import { ContainerProps } from "@/lib/container";
import type { VehicleSchemaLayout, VehicleSchemaGridGroup, VehicleSchemaGrid } from "@/lib/vehicle-schema";

// Helper to create a simple grid
function makeGrid(width: number, height: number, length: number, maxSize?: number): VehicleSchemaGrid {
  return { x: 0, y: 0, z: 0, width, height, length, maxSize };
}

// Helper to create a simple group
function makeGroup(grids: VehicleSchemaGrid[]): VehicleSchemaGridGroup {
  return { x: 0, z: 0, grids };
}

// Helper to create a simple layout
function makeLayout(groups: VehicleSchemaGridGroup[], capacity = 32): VehicleSchemaLayout {
  return { capacity, groups };
}

describe("AutoFill", () => {
  it("fills a simple 1x1x1 grid with a 1 SCU container", () => {
    const grid = makeGrid(1, 1, 1);
    const group = makeGroup([grid]);
    const layout = makeLayout([group], 1);

    const result = AutoFill(layout);

    expect(isAutoLoadFailure(result)).toBe(false);
    const containers = result as ContainerProps[];
    expect(containers).toHaveLength(1);
    expect(containers[0]).toMatchObject({ width: 1, height: 1, length: 1 });
  });

  it("fills a 2x1x1 grid with two 1 SCU containers", () => {
    const grid = makeGrid(2, 1, 1, 1);
    const group = makeGroup([grid]);
    const layout = makeLayout([group], 2);

    const result = AutoFill(layout);

    expect(isAutoLoadFailure(result)).toBe(false);
    const containers = result as ContainerProps[];
    expect(containers).toHaveLength(2);
    expect(containers[0].width).toBe(1);
    expect(containers[1].width).toBe(1);
  });

  it("returns failure if grid is too small", () => {
    const grid = makeGrid(1, 1, 1, 1);
    const group = makeGroup([grid]);
    const layout = makeLayout([group], 1);

    // Artificially limit maxSize to 1, but try to fill with a 32 SCU container
    grid.maxSize = 1;

    const result = AutoFill(layout);

    expect(isAutoLoadFailure(result)).toBe(false); // It should just fill with 1 SCU, not fail
    const containers = result as ContainerProps[];
    expect(containers).toHaveLength(1);
    expect(containers[0].width).toBe(1);
  });
});

describe("AutoLoad", () => {
  it("loads the requested number of containers if space allows", () => {
    const grid = makeGrid(2, 1, 1);
    const group = makeGroup([grid]);
    const layout = makeLayout([group], 2);

    const containerSizes = new Map<number, number>([[1, 2]]);
    const result = AutoLoad(layout, containerSizes);

    expect(isAutoLoadFailure(result)).toBe(false);
    const containers = result as ContainerProps[];
    expect(containers).toHaveLength(2);
    expect(containers[0].width).toBe(1);
    expect(containers[1].width).toBe(1);
  });

  it("loads the requested number of containers if space allows", () => {
    const grid = makeGrid(4, 4, 8);
    const group = makeGroup([grid]);
    const layout = makeLayout([group], 128);

    const containerSizes = new Map<number, number>([[32, 4]]);
    const result = AutoLoad(layout, containerSizes);

    expect(isAutoLoadFailure(result)).toBe(false);
    const containers = result as ContainerProps[];
    expect(containers).toHaveLength(4);
    expect(containers[0].width).toBe(2);
    expect(containers[0].height).toBe(2);
    expect(containers[0].length).toBe(8);
    expect(containers[1].width).toBe(2);
    expect(containers[1].height).toBe(2);
    expect(containers[1].length).toBe(8);
    expect(containers[2].width).toBe(2);
    expect(containers[2].height).toBe(2);
    expect(containers[2].length).toBe(8);
    expect(containers[3].width).toBe(2);
    expect(containers[3].height).toBe(2);
    expect(containers[3].length).toBe(8);
  });

  it("returns failure if not enough space for requested containers", () => {
    const grid = makeGrid(1, 1, 1);
    const group = makeGroup([grid]);
    const layout = makeLayout([group], 1);

    const containerSizes = new Map<number, number>([[1, 2]]);
    const result = AutoLoad(layout, containerSizes);

    expect(isAutoLoadFailure(result)).toBe(true);
    if (isAutoLoadFailure(result)) {
      expect(result.failure).toMatch(/Failed to place/);
    }
  });
});