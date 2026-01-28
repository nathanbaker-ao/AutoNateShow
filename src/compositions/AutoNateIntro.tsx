import React from "react";
import { ThreeCanvas } from "@remotion/three";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  Audio,
} from "remotion";
import { AutoNate, FollowCamera } from "../characters";
import { Environment } from "../environments";

// Audio timing constants
const AUDIO_START_FRAME = 30; // Start audio after 1 second
const AUDIO_DURATION_SECONDS = 6.912;
const FPS = 30;
const AUDIO_DURATION_FRAMES = Math.ceil(AUDIO_DURATION_SECONDS * FPS); // ~207 frames

// Character position
const CHARACTER_Y = -4.1;
const CHARACTER_POSITION: [number, number, number] = [0, CHARACTER_Y, 1.3];

/**
 * Inner scene component for the 3D content
 */
const SceneContent: React.FC<{ isTalking: boolean }> = ({ isTalking }) => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={3} />
      <hemisphereLight args={["#ffffff", "#444444", 2]} />
      <directionalLight position={[0, 15, 5]} intensity={4} />
      <directionalLight position={[0, 5, 15]} intensity={3} />
      <directionalLight position={[-10, 8, 0]} intensity={2} />
      <directionalLight position={[10, 8, 0]} intensity={2} />
      <directionalLight position={[0, 5, -10]} intensity={2} />
      <pointLight position={[0, 10, 0]} intensity={3} />
      <pointLight position={[-5, 3, 5]} intensity={2} />
      <pointLight position={[5, 3, 5]} intensity={2} />

      {/* Environment */}
      <Sequence layout="none">
        <Environment
          modelPath={staticFile("environments/scene-1.glb")}
          position={[0, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={10}
        />
      </Sequence>

      {/* AutoNate - standing and talking */}
      <Sequence layout="none">
        <AutoNate
          talking={isTalking}
          walking={false}
          position={CHARACTER_POSITION}
          rotation={[0, 0, 0]} // Facing camera
          scale={1}
        />
      </Sequence>

      {/* Camera focused on AutoNate */}
      <FollowCamera
        target={CHARACTER_POSITION}
        offset={[0, 2, 4]} // Closer camera for intro
        smoothing={0.05}
        lookAt={true}
        lookAtOffset={[0, 1, 0]} // Look at upper body/face
      />
    </>
  );
};

/**
 * AutoNate Intro Scene
 *
 * AutoNate introduces himself with voice and talking animation.
 * Audio: "Hello world, I'm AutoNate and I am so excited to take you along with me on my adventures!"
 */
export const AutoNateIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  // Determine if AutoNate should be talking based on audio timing
  const audioStartFrame = AUDIO_START_FRAME;
  const audioEndFrame = AUDIO_START_FRAME + AUDIO_DURATION_FRAMES;
  const isTalking = frame >= audioStartFrame && frame < audioEndFrame;

  // Subtitle text
  const subtitleText =
    "Hello world, I'm AutoNate and I am so excited to take you along with me on my adventures!";

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0f" }}>
      {/* 3D Scene */}
      <ThreeCanvas
        width={width}
        height={height}
        dpr={2}
        camera={{
          position: [0, 2, 5],
          fov: 50,
        }}
      >
        <SceneContent isTalking={isTalking} />
      </ThreeCanvas>

      {/* Audio */}
      <Sequence from={audioStartFrame} durationInFrames={AUDIO_DURATION_FRAMES}>
        <Audio src={staticFile("audio/voiceovers/autonate-intro.mp3")} />
      </Sequence>

      {/* Debug overlay */}
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
        Frame: {frame} / {fps} fps | {isTalking ? "🗣️ Talking" : "😐 Idle"}
      </div>

      {/* Subtitles */}
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
            {subtitleText}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
