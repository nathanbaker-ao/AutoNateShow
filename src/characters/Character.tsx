import React, { useRef, useMemo, useEffect } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
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
  /** Whether this character is visible */
  visible?: boolean;
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
  visible = true,
}) => {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelPath);

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Use SkeletonUtils.clone for proper skeleton/bone cloning (required for rigged models)
  // Include modelPath in dependencies to ensure we get a fresh clone when model changes
  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene);

    // Deep clone materials and enhance texture quality
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = (mesh.material as THREE.Material).clone();
          mesh.material = mat;

          // Helper to enhance any texture
          const enhanceTexture = (texture: THREE.Texture | null) => {
            if (!texture) return;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 16;
            texture.generateMipmaps = true;
            texture.needsUpdate = true;
          };

          // Enhance all texture maps for maximum sharpness
          const stdMat = mat as THREE.MeshStandardMaterial;
          enhanceTexture(stdMat.map);           // Diffuse/albedo
          enhanceTexture(stdMat.normalMap);     // Normal map
          enhanceTexture(stdMat.roughnessMap);  // Roughness
          enhanceTexture(stdMat.metalnessMap);  // Metalness
          enhanceTexture(stdMat.aoMap);         // Ambient occlusion
          enhanceTexture(stdMat.emissiveMap);   // Emissive
        }
      }
    });
    return clone;
  }, [scene, modelPath]);

  // Use ref for animations - attach to the group that wraps our clone
  const { actions, names, mixer } = useAnimations(animations, group);

  // Initialize animation when model/animations change
  useEffect(() => {
    if (names.length === 0 || !actions[names[0]]) return;

    // Stop all current actions and reset mixer
    mixer.stopAllAction();

    const action = actions[names[0]];
    if (action) {
      action.reset();
      action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
      action.clampWhenFinished = !loop;
      action.play();
      action.paused = true;
    }
  }, [names, actions, mixer, loop, modelPath]);

  // Update animation time based on current frame
  useEffect(() => {
    if (names.length === 0 || !actions[names[0]]) return;

    const action = actions[names[0]];
    if (action) {
      // Calculate animation time based on current frame
      const timeInSeconds = (frame / fps) * animationSpeed;
      const clipDuration = action.getClip().duration;

      if (loop) {
        action.time = timeInSeconds % clipDuration;
      } else {
        action.time = Math.min(timeInSeconds, clipDuration);
      }

      // Force mixer update to apply the new time
      mixer.update(0);
    }
  }, [frame, fps, names, actions, animationSpeed, loop, mixer]);

  const scaleArray: [number, number, number] = typeof scale === "number"
    ? [scale, scale, scale]
    : scale;

  // Wrap in group to handle transforms - position/rotation/scale on group, primitive inside
  return (
    <group ref={group} position={position} rotation={rotation} scale={scaleArray} visible={visible}>
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
  /** Whether AutoNate is walking */
  walking?: boolean;
  /** Whether AutoNate is waving */
  waving?: boolean;
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
  walking = false,
  waving = false,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  animationSpeed = 1,
}) => {
  // Determine active state (priority: waving > talking > walking > idle)
  const activeState = waving
    ? "waving"
    : talking
      ? "talking"
      : walking
        ? "walking"
        : "idle";

  // Render all models simultaneously, toggling visibility to avoid jarring swaps.
  // Each model continuously animates in the background so transitions are seamless.
  const sharedProps = { position, rotation, scale, animationSpeed, loop: true };

  return (
    <>
      <Character
        modelPath={staticFile("characters/autonate-idle.glb")}
        visible={activeState === "idle"}
        {...sharedProps}
      />
      <Character
        modelPath={staticFile("characters/autonate-talking.glb")}
        visible={activeState === "talking"}
        {...sharedProps}
      />
      <Character
        modelPath={staticFile("characters/autonate-walking.glb")}
        visible={activeState === "walking"}
        {...sharedProps}
      />
      <Character
        modelPath={staticFile("characters/autonate-waving.glb")}
        visible={activeState === "waving"}
        {...sharedProps}
      />
    </>
  );
};

/**
 * Waypoint for defining a walking path
 */
export interface Waypoint {
  /** Position [x, y, z] */
  position: [number, number, number];
  /** Frame number when character should arrive at this point */
  frame: number;
}

/**
 * Calculate position and rotation along a path of waypoints
 * Returns interpolated position and rotation to face movement direction
 */
export const useWalkingPath = (
  waypoints: Waypoint[],
  baseY: number = 0
): { position: [number, number, number]; rotation: [number, number, number]; isMoving: boolean } => {
  const frame = useCurrentFrame();

  // Need at least 2 waypoints for a path
  if (waypoints.length < 2) {
    const pos = waypoints[0]?.position ?? [0, baseY, 0];
    return {
      position: [pos[0], baseY, pos[2]],
      rotation: [0, 0, 0],
      isMoving: false,
    };
  }

  const firstFrame = waypoints[0].frame;
  const lastFrame = waypoints[waypoints.length - 1].frame;

  // Character is moving if we're within the path timeline
  const isWithinPath = frame >= firstFrame && frame < lastFrame;

  // Find the current segment (which two waypoints we're between)
  let startWaypoint = waypoints[0];
  let endWaypoint = waypoints[1];
  let segmentIndex = 0;

  for (let i = 0; i < waypoints.length - 1; i++) {
    if (frame >= waypoints[i].frame && frame <= waypoints[i + 1].frame) {
      startWaypoint = waypoints[i];
      endWaypoint = waypoints[i + 1];
      segmentIndex = i;
      break;
    }
    // If we're past all waypoints, stay at the last one
    if (frame > waypoints[i + 1].frame) {
      startWaypoint = waypoints[i + 1];
      endWaypoint = waypoints[i + 1];
      segmentIndex = i + 1;
    }
  }

  // Calculate interpolation progress within the segment
  const segmentDuration = endWaypoint.frame - startWaypoint.frame;
  const progress = segmentDuration > 0
    ? Math.max(0, Math.min(1, (frame - startWaypoint.frame) / segmentDuration))
    : 1;

  // Interpolate position
  const x = startWaypoint.position[0] + (endWaypoint.position[0] - startWaypoint.position[0]) * progress;
  const z = startWaypoint.position[2] + (endWaypoint.position[2] - startWaypoint.position[2]) * progress;

  // Calculate rotation to face movement direction
  // Use current segment direction, or look ahead to next segment if at a waypoint
  let dx = endWaypoint.position[0] - startWaypoint.position[0];
  let dz = endWaypoint.position[2] - startWaypoint.position[2];

  // If current segment has no movement (same start/end), look at next segment for rotation
  if (Math.abs(dx) < 0.001 && Math.abs(dz) < 0.001 && segmentIndex < waypoints.length - 2) {
    const nextWaypoint = waypoints[segmentIndex + 2];
    dx = nextWaypoint.position[0] - endWaypoint.position[0];
    dz = nextWaypoint.position[2] - endWaypoint.position[2];
  }

  const hasDirection = Math.abs(dx) > 0.001 || Math.abs(dz) > 0.001;
  const rotationY = hasDirection ? Math.atan2(dx, dz) : 0;

  return {
    position: [x, baseY, z],
    rotation: [0, rotationY, 0],
    isMoving: isWithinPath,
  };
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
preloadCharacter(staticFile("characters/autonate-walking.glb"));
preloadCharacter(staticFile("characters/autonate-waving.glb"));
