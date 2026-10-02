import * as THREE from "three";

import { AdjustPositionToScale, AdjustSizeToScale } from "@/components/canvas/util";
import { GridProps } from "@/lib/grid";
import { useTheme } from "@/lib/theme-provider";
import { useSettings } from "@/lib/settings-provider";

/**
 * Cached materials for grid rendering to avoid recreating them on each render.
 */
let lightMaterial: THREE.MeshBasicMaterial | null = null;
let darkMaterial: THREE.MeshBasicMaterial | null = null;

/**
 * Gets the appropriate material for the current theme, creating it if necessary.
 * @param isDarkMode Whether dark mode is enabled
 * @param gridColor The grid color for the current theme
 * @returns The cached material for the theme
 */
const getGridMaterial = (isDarkMode: boolean, gridColor: string): THREE.MeshBasicMaterial => {
  if (isDarkMode) {
    if (!darkMaterial || darkMaterial.color.getHexString() !== gridColor.replace('#', '')) {
      darkMaterial = new THREE.MeshBasicMaterial({ color: gridColor, side: THREE.DoubleSide });
    }
    return darkMaterial;
  } else {
    if (!lightMaterial || lightMaterial.color.getHexString() !== gridColor.replace('#', '')) {
      lightMaterial = new THREE.MeshBasicMaterial({ color: gridColor, side: THREE.DoubleSide });
    }
    return lightMaterial;
  }
};

/**
 * Renders a grid mesh if the grid base is enabled in settings.
 * @param props The grid properties.
 */
export const Grid = (props: GridProps) => {
  const { settings } = useSettings();
  const { isDarkMode, canvasColors } = useTheme();
  const material = getGridMaterial(isDarkMode, canvasColors.grid);

  return (
    <>
      {settings.showGridBase &&
        <mesh
          position={[AdjustPositionToScale(props.x, props.width), -.5, AdjustPositionToScale(props.z, props.length)]}
          geometry={new THREE.PlaneGeometry(AdjustSizeToScale(props.width), AdjustSizeToScale(props.length))}
          material={material}
          rotation={[Math.PI / 2, 0, 0]}
        />
      }
    </>
  );
}
