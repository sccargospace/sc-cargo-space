import { useRef, useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useGesture } from "@use-gesture/react";
import * as THREE from "three";

import { GlobalObjectScale } from "@/components/canvas/util";

/**
 * Properties for the Draggable component.
 */
export interface DraggableProps {
  /** Reference to the camera controls */
  controlsRef: any;
  /** Child components to make draggable */
  children: any;
}

/**
 * Finds a valid position for a vehicle that doesn't intersect with existing vehicles.
 * Iterates through X positions until a non-intersecting position is found.
 * @param scene The Three.js scene containing all vehicles
 * @param newVehicle The vehicle group to position
 * @returns A tuple of [x, y, z] coordinates for the valid position
 */
const FindValidPosition = (scene: THREE.Scene, newVehicle: THREE.Group): [number, number, number] => {
  let x = 0;
  const padding = GlobalObjectScale * 3; // Add some padding between vehicles

  while (true) {
    // Adjust the tempbox to the new x position
    const tempBox = new THREE.Box3().setFromObject(newVehicle);
    const size = tempBox.max.x - tempBox.min.x;
    tempBox.min.x = x;
    tempBox.max.x = x + size;

    let hasIntersection = false;

    scene.traverse((child) => {
      if (child.type === "Group" && child.name === "vehicle-group" && child !== newVehicle) {
        const box = new THREE.Box3().setFromObject(child);
        if (box.intersectsBox(tempBox)) {
          hasIntersection = true;
          x = box.max.x + padding;
        }
      }
    });

    if (!hasIntersection) {
      break;
    }
  }

  return [x, 0, 0];
};

/**
 * Makes child components draggable in 3D space with collision detection.
 * Handles mouse/touch interactions for moving objects and automatically positions
 * vehicles to avoid overlapping.
 * @param props Draggable configuration including controls reference and children
 */
export const Draggable = (props: DraggableProps) => {
  const groupRef = useRef<THREE.Group>(undefined);
  const { camera, gl, scene } = useThree();
  const [_position, setPosition] = useState([0, 0, 0]);
  const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const raycaster = new THREE.Raycaster();
  const intersectVector = new THREE.Vector3();
  const mouse = new THREE.Vector2();

  useEffect(() => {
    if (groupRef.current) {
      const initialPosition = FindValidPosition(scene, groupRef.current);
      groupRef.current.position.set(initialPosition[0], initialPosition[1], initialPosition[2]);
    }
  }, [scene]);

  const bind = useGesture(
    {
      onDragStart: (_state) => {
        // Disable camera on drag start
        props.controlsRef.current.enabled = false;
        // Change cursor on drag start
        document.body.style.cursor = "grabbing";
      },
      onDrag: (state) => {
        const [x, y] = state.xy;
        mouse.set(
          (x / gl.domElement.clientWidth) * 2 - 1,
          -(y / gl.domElement.clientHeight) * 2 + 1
        );

        raycaster.setFromCamera(mouse, camera);
        const intersect = raycaster.ray.intersectPlane(planeRef.current, intersectVector);
        if (intersect) {
          const snappedPosition = [
            Math.round(intersect.x / GlobalObjectScale) * GlobalObjectScale,
            0,
            Math.round(intersect.z / GlobalObjectScale) * GlobalObjectScale
          ];

          if (groupRef.current) {
            groupRef.current.position.set(snappedPosition[0], snappedPosition[1], snappedPosition[2]);
            setPosition(snappedPosition);
          }
        }
      },
      onDragEnd: (_state) => {
        // Restore cursor and camera on drag end
        props.controlsRef.current.enabled = true;
        document.body.style.cursor = "default";
      }
    }
  );

  return (
    <group
      ref={groupRef}
      name="vehicle-group"
      {...bind()}
    >
      {props.children}
    </group>
  );
}