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

// Timing constants (at 30fps)
const FPS = 30;

// Narrator audio starts immediately
const NARRATOR_START = 0;
const NARRATOR_DURATION_SEC = 6.96;
const NARRATOR_DURATION = Math.ceil(NARRATOR_DURATION_SEC * FPS); // ~209 frames

// Gap between narrator and AutoNate speaking
const GAP_FRAMES = 30; // 1 second pause

// AutoNate audio: "What up doe, world! I'm AutoNate!"
const AUTONATE_START = NARRATOR_START + NARRATOR_DURATION + GAP_FRAMES;
const AUTONATE_DURATION_SEC = 3.456;
const AUTONATE_DURATION = Math.ceil(AUTONATE_DURATION_SEC * FPS); // ~104 frames

// Waving continues after audio ends for a natural finish
const WAVE_EXTRA_FRAMES = 60; // 2 seconds of continued waving after audio

// Waving animation speed control
// The hand raise is roughly the first 1.2s of the 5.37s animation clip.
// We play the raise at 3x speed (done in ~0.4s real time = 12 frames),
// then slow to 0.7x for the actual waving portion.
const WAVE_RAISE_ANIM_TIME = 1.2; // seconds into clip where raise finishes
const WAVE_RAISE_SPEED = 3.0; // fast raise
const WAVE_BODY_SPEED = 0.7; // slower, relaxed waving

// Character position
const CHARACTER_Y = -4.1;
const CHARACTER_POSITION: [number, number, number] = [0, CHARACTER_Y, 1.3];

// Subtitle text
const NARRATOR_TEXT =
  "In a world full of stories waiting to be told, one character is ready to take the stage.";
const AUTONATE_TEXT = "What up doe, world! I'm AutoNate!";

/**
 * Compute waving animation time with variable speed:
 * - Fast during the initial hand raise (~first 1.2s of clip at 3x)
 * - Slow during the actual waving (0.7x)
 */
function getWavingAnimationTime(waveFrame: number): number {
  const realTime = waveFrame / FPS;

  // How long does the raise take in real time at the fast speed?
  const raiseRealDuration = WAVE_RAISE_ANIM_TIME / WAVE_RAISE_SPEED;

  if (realTime <= raiseRealDuration) {
    // During the raise: map real time to animation time at fast speed
    return realTime * WAVE_RAISE_SPEED;
  } else {
    // After the raise: continue from where raise ended, at slow speed
    const timeAfterRaise = realTime - raiseRealDuration;
    return WAVE_RAISE_ANIM_TIME + timeAfterRaise * WAVE_BODY_SPEED;
  }
}

/**
 * Inner scene component for the 3D content
 */
const SceneContent: React.FC<{
  isWaving: boolean;
  wavingAnimationTime?: number;
}> = ({ isWaving, wavingAnimationTime }) => {
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

      {/* AutoNate - idle by default, waving when he speaks */}
      <Sequence layout="none">
        <AutoNate
          talking={false}
          walking={false}
          waving={isWaving}
          wavingAnimationTime={wavingAnimationTime}
          position={CHARACTER_POSITION}
          rotation={[0, 0, 0]}
          scale={1}
        />
      </Sequence>

      {/* Camera focused on AutoNate */}
      <FollowCamera
        target={CHARACTER_POSITION}
        offset={[0, 2, 4]}
        smoothing={0.05}
        lookAt={true}
        lookAtOffset={[0, 1, 0]}
      />
    </>
  );
};

/**
 * AutoNate Intro Scene - Narrated
 *
 * Narrator introduces the scene, then AutoNate speaks with his own voice while waving.
 */
export const AutoNateIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  // AutoNate waves during his audio + continues waving after for a natural finish
  const waveStartFrame = AUTONATE_START;
  const waveEndFrame = AUTONATE_START + AUTONATE_DURATION + WAVE_EXTRA_FRAMES;
  const isWaving = frame >= waveStartFrame && frame < waveEndFrame;

  // Compute variable-speed waving animation time
  const wavingAnimationTime = isWaving
    ? getWavingAnimationTime(frame - waveStartFrame)
    : undefined;

  // Determine which subtitle to show
  const isNarratorSpeaking =
    frame >= NARRATOR_START && frame < NARRATOR_START + NARRATOR_DURATION;
  const isAutoNateSpeaking =
    frame >= AUTONATE_START && frame < AUTONATE_START + AUTONATE_DURATION;

  let subtitleText = "";
  if (isNarratorSpeaking) subtitleText = NARRATOR_TEXT;
  if (isAutoNateSpeaking) subtitleText = AUTONATE_TEXT;

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
        <SceneContent
          isWaving={isWaving}
          wavingAnimationTime={wavingAnimationTime}
        />
      </ThreeCanvas>

      {/* Narrator Audio */}
      <Sequence from={NARRATOR_START} durationInFrames={NARRATOR_DURATION}>
        <Audio src={staticFile("audio/voiceovers/narrator-intro.mp3")} />
      </Sequence>

      {/* AutoNate Audio */}
      <Sequence from={AUTONATE_START} durationInFrames={AUTONATE_DURATION}>
        <Audio src={staticFile("audio/voiceovers/autonate-whatsup.mp3")} />
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
        Frame: {frame} / {fps} fps |{" "}
        {isNarratorSpeaking
          ? "Narrator"
          : isAutoNateSpeaking
            ? "AutoNate (waving)"
            : "Idle"}
      </div>

      {/* Subtitles */}
      {subtitleText && (
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
            {isAutoNateSpeaking && (
              <span
                style={{ color: "#4fc3f7", fontWeight: "bold", fontSize: 14 }}
              >
                AutoNate:{" "}
              </span>
            )}
            {subtitleText}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
