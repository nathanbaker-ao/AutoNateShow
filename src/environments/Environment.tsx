import React, { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface EnvironmentProps {
  /** Path to the environment .glb file */
  modelPath: string;
  /** Position offset [x, y, z] */
  position?: [number, number, number];
  /** Rotation in radians [x, y, z] */
  rotation?: [number, number, number];
  /** Scale */
  scale?: number | [number, number, number];
}

/**
 * Environment component for loading 3D scene/room models
 */
export const Environment: React.FC<EnvironmentProps> = ({
  modelPath,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) => {
  const { scene } = useGLTF(modelPath);

  // Clone the scene
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          mesh.material = (mesh.material as THREE.Material).clone();
        }
        // Enable shadows for environment meshes
        mesh.receiveShadow = true;
        mesh.castShadow = true;
      }
    });
    return clone;
  }, [scene]);

  const scaleArray = typeof scale === "number"
    ? [scale, scale, scale] as [number, number, number]
    : scale;

  return (
    <group position={position} rotation={rotation} scale={scaleArray}>
      <primitive object={clonedScene} />
    </group>
  );
};

/**
 * Preload environment models
 */
export const preloadEnvironment = (modelPath: string) => {
  useGLTF.preload(modelPath);
};

import { staticFile } from "remotion";

// Preload available environments
preloadEnvironment(staticFile("environments/scene-1.glb"));
