import { useMediaQuery } from "react-responsive";

/**
 * Breakpoint width for mobile devices in pixels.
 */
export const MobileWidth = 600;

/**
 * Hook to determine if the current viewport is mobile-sized.
 * @returns True if the viewport width is less than or equal to MobileWidth
 */
export const IsMobile = () => {
  return useMediaQuery({ query: `(max-width: ${MobileWidth}px)` });
}

/**
 * Creates a deep copy of an object using JSON serialization.
 * @param obj The object to copy
 * @returns A deep copy of the object
 */
export const DeepCopy = (obj: any) => {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Common container sizes in SCU.
 */
export const ContainerSizes = [1, 2, 4, 8, 16, 24, 32];