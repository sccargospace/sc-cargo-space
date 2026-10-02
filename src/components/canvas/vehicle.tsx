import * as THREE from "three";
import { Text } from "@react-three/drei";

import { Grid, } from "@/components/canvas/grid";
import { Container } from "@/components/canvas/container";
import { Draggable } from "@/components/canvas/draggable";
import { InstancedContainers } from "@/components/canvas/instanced-containers";
import { VehicleProps, LabelProps } from "@/lib/vehicle";
import { useSettings } from "@/lib/settings-provider";


/**
 * Replaces special placeholder values in label text with vehicle-specific data.
 * @param vehicle The vehicle instance
 * @param value The label text that may contain placeholders
 * @returns The label text with placeholders replaced
 */
const LabelReplaceSpecialValue = (vehicle: VehicleProps, value: string): string => {
  if (value.includes("${scu}")) {
    const size = vehicle.size;
    const capacity = vehicle.capacity;
    if (size === capacity) {
      value = value.replace("${scu}", `(${capacity})`);
    } else {
      value = value.replace("${scu}", `(${size} / ${capacity})`);
    }
  }
  return value;
}

/**
 * Renders a 3D text label with configurable position, rotation, and styling.
 * @param props Label properties including position, text, and styling
 */
const Label = (props: LabelProps) => {
  const rotations = new Map<number, THREE.Euler>();
  rotations.set(0, new THREE.Euler(-Math.PI / 2, 0, Math.PI));
  rotations.set(90, new THREE.Euler(-Math.PI / 2, 0, Math.PI / 2));
  rotations.set(180, new THREE.Euler(-Math.PI / 2, 0, 0));
  rotations.set(270, new THREE.Euler(-Math.PI / 2, 0, -Math.PI / 2));
  const padding = 0.1;
  const rotation = rotations.get(props.rotation || 0) || rotations.get(0);

  return (
    <Text
      fontSize={props.fontSize || 3.5}
      color={"black"}
      anchorX="center"
      anchorY="bottom"
      position={new THREE.Vector3(props.x, padding, props.z)}
      rotation={rotation}
    >
      {props.value}
    </Text>
  );
}

/**
 * Determines if the vehicle size exceeds the label entity limit (4096).
 * This limits the number of container labels being rendered.
 * @param props The vehicle properties
 * @returns True if the vehicle size exceeds the label entity limit
 */
// const ExceedsLabelEntityLimit = (props: VehicleProps): boolean => {
//   return props.size > 4608;
// }

/**
 * Renders a single vehicle with its grids, containers, and labels.
 * Conditionally displays vehicle labels based on settings.
 * @param props Vehicle properties including layout and containers
 */
const Vehicle = (props: VehicleProps) => {
  const { settings } = useSettings();
  //const showContainerLabels = settings.showContainerLabels && !ExceedsLabelEntityLimit(props);
  const showContainerLabels = settings.showContainerLabels;

  return (
    <group key={`${props.manufacturer}-${props.name}-group`}>

      {/* Place grids */}
      {props.grids.map((grid, index) => (
        <Grid
          key={`${props.name}-${index}-grid`}
          {...grid}
        />
      ))}

      {/* Place containers */}
      {props.containers.map((container, index) => (
        <Container
          key={`${props.name}-${index}-container`}
          showContainerLabels={showContainerLabels}
          {...container}
        />
      ))}

      {/* Place labels */}
      {settings.showVehicleLabels && props.labels.map((label, index) => (
        <Label
          key={`${props.name}-${index}-label`}
          {...label}
          value={LabelReplaceSpecialValue(props, label.value)} />
      ))}
    </group>
  );
}

/**
 * Properties for the Vehicles component.
 */
export interface VehiclesProps {
  /** Array of vehicles to render */
  vehicles: VehicleProps[];
  /** Reference to camera controls for drag functionality */
  controlsRef: any;
}

/**
 * Renders multiple vehicles with instanced containers and drag functionality.
 * Each vehicle is wrapped in a Draggable component for 3D positioning.
 * @param props Vehicle array and controls reference
 */
export const Vehicles = (props: VehiclesProps) => {
  return (
    <InstancedContainers>
      {props.vehicles.map(vehicle => (
        <Draggable
          key={`${vehicle.manufacturer}-${vehicle.name}-drag`}
          controlsRef={props.controlsRef}>
          <Vehicle
            key={`${vehicle.manufacturer}-${vehicle.name}-vehicle`}
            {...vehicle}
          />
        </Draggable>
      ))}
    </InstancedContainers>
  );
}