import React from "react";
import { ThreeCanvas } from "@remotion/three";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";
import {
  AutoNate,
  useWalkingPath,
  FollowCamera,
  type Waypoint,
} from "../characters";
import { Environment } from "../environments";

/**
 * Define the walking path for AutoNate
 * Each waypoint specifies a position and the frame when he should arrive there
 */
const WALKING_PATH: Waypoint[] = [
  { position: [0, 0, 1.3], frame: 0 }, // Start position
  { position: [2, 0, 1.3], frame: 60 }, // Walk right
  { position: [2, 0, -1], frame: 120 }, // Walk toward back
  { position: [-2, 0, -1], frame: 180 }, // Walk left
  { position: [-2, 0, 1.3], frame: 240 }, // Walk forward
  { position: [0, 0, 1.3], frame: 300 }, // Return to start
];

// Character's Y position on the ground
const CHARACTER_Y = -4.1;

/**
 * Inner scene component that uses the walking path hook
 * Separated because hooks need to be inside the ThreeCanvas context
 */
const SceneContent: React.FC = () => {
  // Get interpolated position and rotation from the walking path
  const { position, rotation } = useWalkingPath(WALKING_PATH, CHARACTER_Y);

  return (
    <>
      {/* Strong ambient to brighten everything */}
      <ambientLight intensity={3} />

      {/* Hemisphere light - sky/ground lighting */}
      <hemisphereLight args={["#ffffff", "#444444", 2]} />

      {/* Main overhead light */}
      <directionalLight position={[0, 15, 5]} intensity={4} />

      {/* Front light */}
      <directionalLight position={[0, 5, 15]} intensity={3} />

      {/* Left fill */}
      <directionalLight position={[-10, 8, 0]} intensity={2} />

      {/* Right fill */}
      <directionalLight position={[10, 8, 0]} intensity={2} />

      {/* Back light */}
      <directionalLight position={[0, 5, -10]} intensity={2} />

      {/* Point lights around the scene */}
      <pointLight position={[0, 10, 0]} intensity={3} />
      <pointLight position={[-5, 3, 5]} intensity={2} />
      <pointLight position={[5, 3, 5]} intensity={2} />

      {/* Environment - scaled down, camera zooms in */}
      <Sequence layout="none">
        <Environment
          modelPath={staticFile("environments/scene-1.glb")}
          position={[0, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={10}
        />
      </Sequence>

      {/* AutoNate - walking around the scene (always use walking animation) */}
      <Sequence layout="none">
        <AutoNate
          talking={false}
          walking={true}
          position={position}
          rotation={rotation}
          scale={1}
        />
      </Sequence>

      {/* Camera that follows AutoNate */}
      <FollowCamera
        target={position}
        offset={[0, 2.5, 5]} // Camera behind and above
        smoothing={0.08} // Smooth follow
        lookAt={true}
        lookAtOffset={[0, 0.5, 0]} // Look slightly above character's feet
      />
    </>
  );
};

/**
 * Test scene with AutoNate walking around with a following camera
 *
 * This demonstrates:
 * - Loading the 3D environment
 * - AutoNate walking along a path
 * - Camera following the character
 * - Switching between idle and talking animations
 */
export const AutoNateScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Get position for the debug overlay
  const { position } = useWalkingPath(WALKING_PATH, CHARACTER_Y);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0f" }}>
      <ThreeCanvas
        width={width}
        height={height}
        dpr={2}
        camera={{
          position: [0, 2, 5],
          fov: 50,
        }}
      >
        <SceneContent />
      </ThreeCanvas>

      {/* Debug overlay showing current state */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          color: "white",
          fontFamily: "monospace",
          fontSize: 14,
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: "8px 12px",
          borderRadius: 4,
        }}
      >
        Frame: {frame} | 🚶 Walking
        <br />
        Pos: [{position[0].toFixed(1)}, {position[2].toFixed(1)}]
      </div>
    </AbsoluteFill>
  );
};
