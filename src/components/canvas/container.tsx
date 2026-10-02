import * as THREE from "three";

import { AdjustPositionToScale, AdjustSizeToScale } from "@/components/canvas/util";
import {
  Container1Instance,
  Container2Instance,
  Container4Instance,
  Container8Instance,
  Container16Instance,
  Container24Instance,
  Container32Instance,
  Label1Instance,
  Label2Instance,
  Label4Instance,
  Label8Instance,
  Label16Instance,
  Label24Instance,
  Label32Instance,
  GetLabelBoundingBox
} from "@/components/canvas/instanced-containers"
import { ContainerProps } from "@/lib/container";
import { useSettings, ContainerColorsProps } from "@/lib/settings-provider";

/**
 * Padding values help reduce overlap/intersection/flickering.
 */
const labelPadding = 0.1;

/**
 * Generates a cache key for container dimensions.
 * @param width Container width
 * @param height Container height
 * @param length Container length
 * @returns Unique cache key for the dimensions
 */
const CacheKey = (width: number, height: number, length: number) => {
  return width * 10000 + height * 100 + length;
}

/**
 * Gets the appropriate container instance based on SCU size.
 * @param size The SCU size of the container
 * @returns The corresponding container instance component
 */
const GetContainerInstance = (size: number) => {
  switch (size) {
    case 1: return Container1Instance;
    case 2: return Container2Instance;
    case 4: return Container4Instance;
    case 8: return Container8Instance;
    case 16: return Container16Instance;
    case 24: return Container24Instance;
    case 32: return Container32Instance;
    default: return Container1Instance;
  }
}

/**
 * Euler rotations for containers in different orientations.
 */
const rotatedContainerEuler = new THREE.Euler(0, Math.PI / 2, 0);
const defaultContainerEuler = new THREE.Euler(0, 0, 0);

/**
 * Determines the rotation for a container based on its dimensions.
 * @param width Container width
 * @param height Container height  
 * @param length Container length
 * @returns The appropriate Euler rotation
 */
const GetContainerRotation = (width: number, height: number, length: number) => {
  switch (CacheKey(width, height, length)) {
    case CacheKey(2, 1, 1):
    case CacheKey(4, 2, 2):
    case CacheKey(6, 2, 2):
    case CacheKey(8, 2, 2):
      return rotatedContainerEuler;
    default:
      return defaultContainerEuler;
  }
}

/**
 * Gets the appropriate label instance based on SCU size.
 * @param size The SCU size of the container
 * @returns The corresponding label instance component
 */
const GetLabelInstance = (size: number) => {
  switch (size) {
    case 1: return Label1Instance;
    case 2: return Label2Instance;
    case 4: return Label4Instance;
    case 8: return Label8Instance;
    case 16: return Label16Instance;
    case 24: return Label24Instance;
    case 32: return Label32Instance;
    default: return Label1Instance;
  }
}

/**
 * Renders a 3D container with labels and proper positioning.
 * Handles container color based on size and security status.
 * @param props Container properties defining position, size, and display options
 */
export const Container = (props: ContainerProps) => {
  const { settings } = useSettings();

  let position: THREE.Vector3;
  const width = AdjustSizeToScale(props.width);
  const height = AdjustSizeToScale(props.height);
  const length = AdjustSizeToScale(props.length);
  const size = props.width * props.height * props.length;

  // Adjust position so that box snaps to grid
  position = new THREE.Vector3(AdjustPositionToScale(props.x, props.width),
    AdjustPositionToScale(props.y, props.height),
    AdjustPositionToScale(props.z, props.length));

  // Get instanced container component
  const ContainerInstance = GetContainerInstance(size);
  const containerRotation = GetContainerRotation(props.width, props.height, props.length);

  // Get instanced label component
  const LabelInstance = GetLabelInstance(size);
  const labelBoundingBox = GetLabelBoundingBox(size);
  const labelWidth = labelBoundingBox.max.x - labelBoundingBox.min.x;
  const labelHeight = labelBoundingBox.max.y - labelBoundingBox.min.y;

  // grab color
  let color = settings.containerColors[size as keyof ContainerColorsProps];
  if (props.unsecured && settings.useUnsecureContainerColor) {
    color = settings.unsecure_container_color;
  }

  return (
    <>
      {props.hidden ? (<></>) : (// Return null if hidden
        <group position={position} >
          {/* Container */}
          <ContainerInstance
            rotation={containerRotation}
            color={color}
          />

          {/* Labels */}
          {props.showContainerLabels && (
            <>
              <LabelInstance position={[-(labelWidth / 2), -(labelHeight / 2), length / 2 + labelPadding]} rotation={[0, 0, 0]} />
              <LabelInstance position={[(labelWidth / 2), -(labelHeight / 2), -length / 2 - labelPadding]} rotation={[0, Math.PI, 0]} />
              <LabelInstance position={[-width / 2 - labelPadding, -(labelHeight / 2), -(labelWidth / 2)]} rotation={[0, -Math.PI / 2, 0]} />
              <LabelInstance position={[width / 2 + labelPadding, -(labelHeight / 2), (labelWidth / 2)]} rotation={[0, Math.PI / 2, 0]} />
              <LabelInstance position={[(labelWidth / 2), height / 2 + labelPadding, -(labelHeight / 2)]} rotation={[-Math.PI / 2, 0, Math.PI]} />
            </>
          )}

        </group>
      )}
    </>
  );
}