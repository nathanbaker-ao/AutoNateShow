import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface FollowCameraProps {
  /** Target position to follow [x, y, z] */
  target: [number, number, number];
  /** Offset from target [x, y, z] - camera position relative to target */
  offset?: [number, number, number];
  /** How smoothly the camera follows (0-1, lower = smoother) */
  smoothing?: number;
  /** Whether to look at the target */
  lookAt?: boolean;
  /** Fixed look-at offset from target position */
  lookAtOffset?: [number, number, number];
}

/**
 * FollowCamera component that smoothly follows a target position
 * Place this inside your ThreeCanvas to have the camera track a moving character
 */
export const FollowCamera: React.FC<FollowCameraProps> = ({
  target,
  offset = [0, 2, 5],
  smoothing = 0.1,
  lookAt = true,
  lookAtOffset = [0, 0, 0],
}) => {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const currentPosition = useRef(new THREE.Vector3());
  const lookAtTarget = useRef(new THREE.Vector3());

  useFrame(() => {
    // Calculate desired camera position (target + offset)
    targetPosition.current.set(
      target[0] + offset[0],
      target[1] + offset[1],
      target[2] + offset[2]
    );

    // Get current camera position
    currentPosition.current.copy(camera.position);

    // Smoothly interpolate camera position
    currentPosition.current.lerp(targetPosition.current, smoothing);
    camera.position.copy(currentPosition.current);

    // Make camera look at target
    if (lookAt) {
      lookAtTarget.current.set(
        target[0] + lookAtOffset[0],
        target[1] + lookAtOffset[1],
        target[2] + lookAtOffset[2]
      );
      camera.lookAt(lookAtTarget.current);
    }
  });

  return null;
};

/**
 * Hook to calculate camera follow position without using useFrame
 * Useful for Remotion where we want frame-based positioning
 */
export const useCameraFollow = (
  target: [number, number, number],
  offset: [number, number, number] = [0, 2, 5]
): { position: [number, number, number]; lookAt: [number, number, number] } => {
  return {
    position: [
      target[0] + offset[0],
      target[1] + offset[1],
      target[2] + offset[2],
    ],
    lookAt: target,
  };
};
