import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas as ThreeCanvas, useThree } from "@react-three/fiber";
import { MapControls, PerspectiveCamera, Text, Stats } from "@react-three/drei";

import { Stage } from "./stage";
import { GlobalObjectScale } from "@/components/canvas/util";
import { Vehicles } from "@/components/canvas/vehicle";
import { useTheme } from "@/lib/theme-provider";
import { useSettings } from "@/lib/settings-provider";
import { useCanvas, CanvasControls } from "@/lib/canvas-provider";

/**
 * Default camera position for the 3D scene.
 */
const DEFAULT_CAMERA_POSITION = new THREE.Vector3(-100, 100, -200);

/**
 * Default camera lookAt target for the 3D scene.
 */
const DEFAULT_CAMERA_LOOKAT = new THREE.Vector3(0, 0, 0);

/**
 * Component that displays performance statistics for the 3D scene.
 * Creates a DOM element to display FPS and other performance metrics.
 */
const Statistics = () => {
  const node = useRef(document.createElement("div"));

  useEffect(() => {
    node.current.id = "stats-container";
    node.current.style.zIndex = "1500";
    document.body.appendChild(node.current);

    return () => { document.body.removeChild(node.current); }
  }, []);

  return (
    <Stats showPanel={1} className="stats" parent={node} />
  );
}

/**
 * Component that provides canvas controls to the context.
 * This component must be rendered inside the ThreeCanvas.
 */
const CanvasControlsProvider = ({
  cam,
  mapControlsRef
}: {
  cam: THREE.PerspectiveCamera | null;
  mapControlsRef: React.RefObject<any>;
}) => {
  const { gl, scene, camera } = useThree();
  const { setControls } = useCanvas();

  useEffect(() => {
    if (cam) {
      const controls: CanvasControls = {
        takeScreenshot: () => {
          // Force a render
          gl.render(scene, camera);

          // Get the canvas data
          const dataURL = gl.domElement.toDataURL("image/png", 1.0);

          // Create download link
          const link = document.createElement("a");
          link.download = `cargo-grid-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.png`;
          link.href = dataURL;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
        resetCamera: () => {
          if (cam && mapControlsRef.current) {
            // Reset camera position
            cam.position.copy(DEFAULT_CAMERA_POSITION);

            // Reset map controls target to default lookAt and update controls
            const controls = mapControlsRef.current as any;
            controls.target.copy(DEFAULT_CAMERA_LOOKAT);
            controls.update();
          }
        }
      };

      setControls(controls);
    }
  }, [cam, gl, scene, camera, mapControlsRef, setControls]);

  return null;
};

/**
 * Main canvas component that renders the 3D scene with vehicles, controls, and camera.
 * Handles lighting, camera controls, grid display, and performance statistics.
 * Gets its state from the CanvasContext.
 */
export const Canvas = () => {
  const { state } = useCanvas();
  const { settings } = useSettings();
  const theme = useTheme();
  const mapControlsRef = useRef(null);
  const [cam, setCam] = useState<THREE.PerspectiveCamera | null>(null);

  return (
    <ThreeCanvas
      frameloop={"demand"}
      style={{
        visibility: state.isVisible ? "visible" : "hidden",
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1
      }}
    >
      <color attach="background" args={[theme.canvasColors.background]} />
      <hemisphereLight args={[0xffffff, 0xffffff, 1]} />

      {settings.showPerfStats && <Statistics />}

      {/* Provide canvas controls to context */}
      <CanvasControlsProvider cam={cam} mapControlsRef={mapControlsRef} />

      {/*
        drei Text is causing a Suspend on first render.
        Adding Text here to do the render/suspend on load
        instead of on the first actual Text render.

        Issue for tracking.
        - https://github.com/pmndrs/drei/issues/2051
      */}
      <Text visible={false}>fixme</Text>

      <PerspectiveCamera
        ref={setCam}
        position={DEFAULT_CAMERA_POSITION}
        makeDefault
      />

      {cam &&
        <MapControls
          ref={mapControlsRef}
          camera={cam}
          maxPolarAngle={Math.PI / 2 - .6}
          minDistance={100}
          maxDistance={1500}
          onStart={() => {
            document.body.style.cursor = "move";
          }}
          onEnd={() => {
            document.body.style.cursor = "default";
          }}
        />
      }

      {settings.showGrid &&
        <Stage size1={GlobalObjectScale} size2={GlobalObjectScale} distance={1000} />
      }

      <Vehicles
        vehicles={state.vehicles}
        controlsRef={mapControlsRef} />
    </ThreeCanvas>
  );
}
