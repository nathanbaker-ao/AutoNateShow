import React from "react";
import { ThreeCanvas } from "@remotion/three";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  staticFile,
} from "remotion";
import { AutoNate } from "../characters";
import { Environment } from "../environments";

/**
 * Test scene with AutoNate in an environment
 *
 * This demonstrates:
 * - Loading the 3D environment
 * - Placing AutoNate in the scene
 * - Switching between idle and talking animations
 * - Camera positioning
 */
export const AutoNateScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();

  // Define when AutoNate is talking (frames 60-180, i.e. seconds 2-6)
  const isTalking = frame >= 60 && frame < 180;

  // Camera low and angled down toward ground
  const cameraY = interpolate(frame, [0, durationInFrames], [0.1, 0.2], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0f" }}>
      <ThreeCanvas
        width={width}
        height={height}
        dpr={2}
        camera={{
          position: [0, cameraY, 4.5],
          fov: 50,
          rotation: [-0.25, 0, 0],
        }}
      >
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

        {/* AutoNate - positioned on the floor in front of couch */}
        <Sequence layout="none">
          <AutoNate
            talking={isTalking}
            position={[0, -2.4, 1.3]}
            rotation={[0, 0, 0]}
            scale={1}
          />
        </Sequence>
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
        Frame: {frame} | {isTalking ? "🗣️ Talking" : "😐 Idle"}
      </div>

      {/* Subtitles area */}
      {isTalking && (
        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: 60,
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              color: "white",
              padding: "12px 24px",
              borderRadius: 8,
              fontSize: 24,
              fontFamily: "sans-serif",
              maxWidth: "80%",
              textAlign: "center",
            }}
          >
            AutoNate is talking... (add your script here!)
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
