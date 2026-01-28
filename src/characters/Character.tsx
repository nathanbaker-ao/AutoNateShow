import React, { useRef, useMemo, useEffect } from "react";
import { useGLTF, useAnimations, Clone } from "@react-three/drei";
import { useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

interface CharacterProps {
  /** Path to the .glb model file */
  modelPath: string;
  /** Position in 3D space [x, y, z] */
  position?: [number, number, number];
  /** Rotation in radians [x, y, z] */
  rotation?: [number, number, number];
  /** Scale - single number or [x, y, z] */
  scale?: number | [number, number, number];
  /** Speed multiplier for animation playback */
  animationSpeed?: number;
  /** Whether to loop the animation */
  loop?: boolean;
}

/**
 * Character component for loading and animating rigged .glb models
 *
 * The animation embedded in the GLB file will automatically play,
 * synchronized with Remotion's timeline.
 */
export const Character: React.FC<CharacterProps> = ({
  modelPath,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  animationSpeed = 1,
  loop = true,
}) => {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelPath);

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Use SkeletonUtils.clone for proper skeleton/bone cloning (required for rigged models)
  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene);

    // Deep clone materials and enhance texture quality
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = (mesh.material as THREE.Material).clone();
          mesh.material = mat;

          // Enhance texture filtering for better quality
          if ((mat as THREE.MeshStandardMaterial).map) {
            const texture = (mat as THREE.MeshStandardMaterial).map!;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 16; // Max anisotropic filtering
            texture.needsUpdate = true;
          }
          if ((mat as THREE.MeshStandardMaterial).normalMap) {
            const normalMap = (mat as THREE.MeshStandardMaterial).normalMap!;
            normalMap.minFilter = THREE.LinearMipmapLinearFilter;
            normalMap.magFilter = THREE.LinearFilter;
            normalMap.anisotropy = 16;
            normalMap.needsUpdate = true;
          }
        }
      }
    });
    return clone;
  }, [scene]);

  // Use ref for animations - attach to the group that wraps our clone
  const { actions, names } = useAnimations(animations, group);

  // Play the first available animation, driven by useCurrentFrame
  useEffect(() => {
    if (names.length === 0 || !actions[names[0]]) return;

    const action = actions[names[0]];
    if (action) {
      action.reset();
      action.play();
      action.paused = true;
      action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);

      // Calculate animation time based on current frame
      const timeInSeconds = (frame / fps) * animationSpeed;
      const clipDuration = action.getClip().duration;

      if (loop) {
        action.time = timeInSeconds % clipDuration;
      } else {
        action.time = Math.min(timeInSeconds, clipDuration);
      }
    }
  }, [frame, fps, names, actions, animationSpeed, loop]);

  const scaleArray: [number, number, number] = typeof scale === "number"
    ? [scale, scale, scale]
    : scale;

  // Wrap in group to handle transforms - position/rotation/scale on group, primitive inside
  return (
    <group ref={group} position={position} rotation={rotation} scale={scaleArray}>
      <primitive object={clonedScene} />
    </group>
  );
};

/**
 * AutoNate component with easy state switching
 * Switches between idle and talking models based on the `talking` prop
 */
interface AutoNateProps {
  /** Whether AutoNate is currently talking */
  talking?: boolean;
  /** Position in 3D space */
  position?: [number, number, number];
  /** Rotation in radians */
  rotation?: [number, number, number];
  /** Scale */
  scale?: number;
  /** Animation speed multiplier */
  animationSpeed?: number;
}

export const AutoNate: React.FC<AutoNateProps> = ({
  talking = false,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  animationSpeed = 1,
}) => {
  const modelPath = talking
    ? staticFile("characters/autonate-talking.glb")
    : staticFile("characters/autonate-idle.glb");

  return (
    <Character
      modelPath={modelPath}
      position={position}
      rotation={rotation}
      scale={scale}
      animationSpeed={animationSpeed}
      loop={true}
    />
  );
};

/**
 * Get available animation names from a model (for debugging)
 */
export const useCharacterAnimations = (modelPath: string) => {
  const { animations } = useGLTF(modelPath);
  return animations.map((a) => a.name);
};

/**
 * Preload character models for better performance
 */
export const preloadCharacter = (modelPath: string) => {
  useGLTF.preload(modelPath);
};

// Preload AutoNate models
preloadCharacter(staticFile("characters/autonate-idle.glb"));
preloadCharacter(staticFile("characters/autonate-talking.glb"));
