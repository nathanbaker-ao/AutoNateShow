import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Sequence, useVideoConfig, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Character } from "../characters";

interface SceneCharacter {
  id: string;
  modelPath: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

interface DialogueLine {
  characterId: string;
  audioFile: string;
  startFrame: number;
  durationInFrames: number;
  // Optional: animation to play during this line
  animation?: string;
}

interface SceneProps {
  /** Background color or gradient */
  backgroundColor?: string;
  /** Characters in the scene */
  characters: SceneCharacter[];
  /** Dialogue lines with timing */
  dialogue?: DialogueLine[];
  /** Camera position */
  cameraPosition?: [number, number, number];
  /** Camera look-at target */
  cameraTarget?: [number, number, number];
  /** Ambient light intensity */
  ambientIntensity?: number;
  /** Main light intensity */
  mainLightIntensity?: number;
  children?: React.ReactNode;
}

/**
 * Scene component for setting up a 3D scene with characters and dialogue
 */
export const Scene: React.FC<SceneProps> = ({
  backgroundColor = "#1a1a2e",
  characters,
  dialogue = [],
  cameraPosition = [0, 1.5, 5],
  cameraTarget = [0, 1, 0],
  ambientIntensity = 0.4,
  mainLightIntensity = 0.8,
  children,
}) => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{
          position: cameraPosition,
          fov: 50,
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={ambientIntensity} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={mainLightIntensity}
          castShadow
        />
        <directionalLight
          position={[-5, 5, -5]}
          intensity={mainLightIntensity * 0.3}
        />

        {/* Ground plane (optional) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#2a2a3e" />
        </mesh>

        {/* Characters */}
        {characters.map((char) => (
          <Sequence key={char.id} layout="none">
            <Character
              modelPath={char.modelPath}
              position={char.position}
              rotation={char.rotation}
              scale={char.scale}
            />
          </Sequence>
        ))}

        {children}
      </ThreeCanvas>

      {/* Dialogue audio tracks */}
      {dialogue.map((line, index) => (
        <Sequence
          key={`dialogue-${index}`}
          from={line.startFrame}
          durationInFrames={line.durationInFrames}
        >
          <Audio src={staticFile(line.audioFile)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
