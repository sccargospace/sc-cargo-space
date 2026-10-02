/**
 * Properties for a container in 3D space.
 */
export interface ContainerProps {
  /** X position in grid units */
  x: number;
  /** Y position in grid units */
  y: number;
  /** Z position in grid units */
  z: number;
  /** Width in grid units */
  width: number;
  /** Height in grid units */
  height: number;
  /** Length in grid units */
  length: number;
  /** Whether the container should be hidden */
  hidden: boolean;
  /** Whether the container is unsecured */
  unsecured: boolean;
  /** Whether to show labels on the container */
  showContainerLabels?: boolean;
}

/**
 * Calculates the SCU size of a container based on its dimensions.
 * @param props Container properties
 * @returns The SCU size (width * height * length)
 */
export const ContainerGetSize = (props: ContainerProps): number => {
  return props.width * props.height * props.length;
}
