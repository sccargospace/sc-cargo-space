
import { ReactNode } from "react";
// @ts-ignore
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
// @ts-ignore
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { extend } from "@react-three/fiber";
import { createInstances, Wireframe } from "@react-three/drei";

import { AdjustSizeToScale } from "@/components/canvas/util";

/**
 * Extend Three.js with TextGeometry for 3D text rendering.
 */
extend({ TextGeometry });
import fontImport from "@/fonts/helvetiker_regular.typeface.json";
const font = new FontLoader().parse(fontImport);

/**
 * Padding values help reduce overlap/intersection/flickering.
 */
const containerPadding = 0.05;

/**
 * Wireframe properties for container bounding box visualization.
 * This is used to create a wireframe around the containers to help visualize the bounding boxes.
 */
const wireframeProps = {
  simplify: true,
  stroke: "#000000",
  thickness: 0.01
};

/**
 * Text properties for container labels.
 * This is used to create the text labels for the containers.
 */
const textGeometryProps = {
  font,
  size: 2,
  depth: 0.01
};

/**
 * Instance properties for performance optimization.
 * This is used to create the instances for the containers and labels.
 * The limit is set to 10000 to allow for a large number of instances.
 * The frustumCulled property is set to false to disable frustum culling for the instances.
 * This is necessary to ensure that the instances are always rendered, even if they are not in the camera view.
 */
const instanceProps = {
  limit: 10000,
  frustumCulled: false
}

/**
 * Pre-computed text geometries for different container sizes.
 * Cached for performance to avoid recreating geometries repeatedly.
 */
const LabelGeometries = new Map<number, TextGeometry>();
[1, 2, 4, 8, 16, 24, 32].forEach((value) => {
  const geo = new TextGeometry(value.toString(), textGeometryProps);
  geo.computeBoundingBox();
  LabelGeometries.set(value, geo);
});

/**
 * Gets the bounding box for a label geometry of a specific container size.
 * @param size The container size to get the label bounding box for
 * @returns The bounding box of the label geometry
 */
export const GetLabelBoundingBox = (size: number) => {
  return LabelGeometries.get(size).boundingBox;
}

/**
 * Container instance creators for different SCU sizes.
 * Each size has its own instanced mesh for performance optimization.
 */
const [Container1Instances, Container1Instance] = createInstances();
const [Container2Instances, Container2Instance] = createInstances();
const [Container4Instances, Container4Instance] = createInstances();
const [Container8Instances, Container8Instance] = createInstances();
const [Container16Instances, Container16Instance] = createInstances();
const [Container24Instances, Container24Instance] = createInstances();
const [Container32Instances, Container32Instance] = createInstances();

/**
 * Label instance creators for different SCU sizes.
 * Each size has its own instanced text mesh for performance optimization.
 */
const [Label1Instances, Label1Instance] = createInstances();
const [Label2Instances, Label2Instance] = createInstances();
const [Label4Instances, Label4Instance] = createInstances();
const [Label8Instances, Label8Instance] = createInstances();
const [Label16Instances, Label16Instance] = createInstances();
const [Label24Instances, Label24Instance] = createInstances();
const [Label32Instances, Label32Instance] = createInstances();

/**
 * Properties for the InstancedContainers component.
 */
export interface InstancedContainersProps {
  /** Child components to render within the instanced container context */
  children: ReactNode
}

/**
 * Provides instanced rendering for containers and labels to optimize performance.
 * Creates separate instance groups for each container size with appropriate geometries.
 * @param props Component properties including children to render
 */
const InstancedContainers = (props: InstancedContainersProps) => {
  return (
    <Container1Instances {...instanceProps}>
      <boxGeometry args={[
        AdjustSizeToScale(1) - containerPadding,
        AdjustSizeToScale(1) - containerPadding,
        AdjustSizeToScale(1) - containerPadding]} />
      <meshBasicMaterial />
      <Wireframe {...wireframeProps} />
      <Container2Instances {...instanceProps}>
        <boxGeometry args={[
          AdjustSizeToScale(1) - containerPadding,
          AdjustSizeToScale(1) - containerPadding,
          AdjustSizeToScale(2) - containerPadding]} />
        <meshBasicMaterial />
        <Wireframe {...wireframeProps} />
        <Container4Instances {...instanceProps}>
          <boxGeometry args={[
            AdjustSizeToScale(2) - containerPadding,
            AdjustSizeToScale(1) - containerPadding,
            AdjustSizeToScale(2) - containerPadding]} />
          <meshBasicMaterial />
          <Wireframe {...wireframeProps} />
          <Container8Instances {...instanceProps}>
            <boxGeometry args={[
              AdjustSizeToScale(2) - containerPadding,
              AdjustSizeToScale(2) - containerPadding,
              AdjustSizeToScale(2) - containerPadding]} />
            <meshBasicMaterial />
            <Wireframe {...wireframeProps} />
            <Container16Instances {...instanceProps}>
              <boxGeometry args={[
                AdjustSizeToScale(2) - containerPadding,
                AdjustSizeToScale(2) - containerPadding,
                AdjustSizeToScale(4) - containerPadding]} />
              <meshBasicMaterial />
              <Wireframe {...wireframeProps} />
              <Container24Instances {...instanceProps}>
                <boxGeometry args={[
                  AdjustSizeToScale(2) - containerPadding,
                  AdjustSizeToScale(2) - containerPadding,
                  AdjustSizeToScale(6) - containerPadding]} />
                <meshBasicMaterial />
                <Wireframe {...wireframeProps} />
                <Container32Instances {...instanceProps}>
                  <boxGeometry args={[
                    AdjustSizeToScale(2) - containerPadding,
                    AdjustSizeToScale(2) - containerPadding,
                    AdjustSizeToScale(8) - containerPadding]} />
                  <meshBasicMaterial />
                  <Wireframe {...wireframeProps} />
                  <Label1Instances {...instanceProps}>
                    {/* @ts-ignore */}
                    <textGeometry args={["1", textGeometryProps]} />
                    <meshBasicMaterial color="#000000" />
                    <Label2Instances {...instanceProps}>
                      {/* @ts-ignore */}
                      <textGeometry args={["2", textGeometryProps]} />
                      <meshBasicMaterial color="#000000" />
                      <Label4Instances {...instanceProps}>
                        {/* @ts-ignore */}
                        <textGeometry args={["4", textGeometryProps]} />
                        <meshBasicMaterial color="#000000" />
                        <Label8Instances {...instanceProps}>
                          {/* @ts-ignore */}
                          <textGeometry args={["8", textGeometryProps]} />
                          <meshBasicMaterial color="#000000" />
                          <Label16Instances {...instanceProps}>
                            {/* @ts-ignore */}
                            <textGeometry args={["16", textGeometryProps]} />
                            <meshBasicMaterial color="#000000" />
                            <Label24Instances {...instanceProps}>
                              {/* @ts-ignore */}
                              <textGeometry args={["24", textGeometryProps]} />
                              <meshBasicMaterial color="#000000" />
                              <Label32Instances {...instanceProps}>
                                {/* @ts-ignore */}
                                <textGeometry args={["32", textGeometryProps]} />
                                <meshBasicMaterial color="#000000" />
                                <>
                                  {props.children}
                                </>
                              </Label32Instances>
                            </Label24Instances>
                          </Label16Instances>
                        </Label8Instances>
                      </Label4Instances>
                    </Label2Instances>
                  </Label1Instances>
                </Container32Instances>
              </Container24Instances>
            </Container16Instances>
          </Container8Instances>
        </Container4Instances>
      </Container2Instances>
    </Container1Instances>
  );
}

export {
  InstancedContainers,
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
};