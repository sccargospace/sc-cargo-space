/**
 * Global scale factor for all 3D objects in the scene.
 */
export const GlobalObjectScale = 10;

/**
 * Adjusts a size value by the global object scale.
 * @param value The size value to scale
 * @returns The scaled size value
 */
export const AdjustSizeToScale = (value: number) => {
  return value * GlobalObjectScale;
}

/**
 * Adjusts a position value by the global object scale and centers it based on dimension.
 * @param value The position value to scale
 * @param dimension The dimension size for centering
 * @returns The scaled and centered position value
 */
export const AdjustPositionToScale = (value: number, dimension: number) => {
  return AdjustSizeToScale(value) + (dimension * GlobalObjectScale) / 2;
}