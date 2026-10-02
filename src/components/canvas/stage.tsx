import * as THREE from "three";
import { useTheme } from "@/lib/theme-provider";

/**
 * Properties for the Stage component that renders a grid plane.
 */
export interface StageProps {
  /** Color of the grid lines */
  color?: THREE.Color;
  /** Size of the inner grid cells */
  size1?: number;
  /** Size of the outer grid cells */
  size2?: number;
  /** Maximum distance for grid visibility */
  distance?: number;
  /** Axes orientation for the grid plane */
  axes?: string;
  /** Whether the grid should be visible */
  visible?: boolean;
}

/**
 * Renders a 3D grid stage with configurable size, color, and visibility.
 * Uses a custom shader material to create dynamic grid lines that fade with distance.
 * @param props Stage configuration properties
 */
export const Stage = (props: StageProps) => {
  const theme = useTheme();
  let color = props.color || new THREE.Color(theme.canvasColors.gridLines);
  let size1 = props.size1 || 10;
  let size2 = props.size2 || 100;
  let distance = props.distance || 8000;
  let axes = props.axes || "xzy";
  const planeAxes = axes.substr(0, 2);
  let visible = props.visible;

  if (visible === undefined) {
    visible = true;
  }

  return (
    <mesh frustumCulled={false} visible={visible}>
      <planeGeometry args={[2, 2, 1, 1]} />
      <shaderMaterial
        side={THREE.DoubleSide}
        uniforms={
          {
            uSize1: {
              value: size1
            },
            uSize2: {
              value: size2
            },
            uColor: {
              value: color
            },
            uDistance: {
              value: distance
            }
          }
        }
        transparent={true}
        vertexShader={`
    
    varying vec3 worldPosition;
    
    uniform float uDistance;
    
    void main() {
    
        vec3 pos = position.${axes} * uDistance;
        pos.${planeAxes} += cameraPosition.${planeAxes};
        
        worldPosition = pos;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    
    }
    `}

        fragmentShader={`
    
    varying vec3 worldPosition;
    
    uniform float uSize1;
    uniform float uSize2;
    uniform vec3 uColor;
    uniform float uDistance;
    
    
    
    float getGrid(float size) {
    
        vec2 r = worldPosition.${planeAxes} / size;
        
        
        vec2 grid = abs(fract(r - 0.5) - 0.5) / fwidth(r);
        float line = min(grid.x, grid.y);
        
    
        return 1.0 - min(line, 1.0);
    }
    
    void main() {
    
        
            float d = 1.0 - min(distance(cameraPosition.${planeAxes}, worldPosition.${planeAxes}) / uDistance, 1.0);
        
            float g1 = getGrid(uSize1);
            float g2 = getGrid(uSize2);
            
            
            gl_FragColor = vec4(uColor.rgb, mix(g2, g1, g1) * pow(d, 3.0));
            gl_FragColor.a = mix(0.5 * gl_FragColor.a, gl_FragColor.a, g2);
        
            if ( gl_FragColor.a <= 0.0 ) discard;
        
    
    }`}
      />
    </mesh>
  );

}
