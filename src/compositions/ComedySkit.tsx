import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  staticFile,
} from "remotion";
import { Scene } from "../scenes";

/**
 * Example Comedy Skit composition
 *
 * To use this:
 * 1. Add your character .glb files to public/characters/
 * 2. Add voiceover audio files to public/audio/voiceovers/
 * 3. Update the characters and dialogue arrays below
 */
export const ComedySkit: React.FC = () => {
  const frame = useCurrentFrame();

  // Define your characters
  // Place .glb files in public/characters/ folder
  const characters = [
    {
      id: "character-1",
      modelPath: staticFile("characters/character-1.glb"),
      position: [-1.5, 0, 0] as [number, number, number],
      rotation: [0, 0.3, 0] as [number, number, number],
      scale: 1,
    },
    {
      id: "character-2",
      modelPath: staticFile("characters/character-2.glb"),
      position: [1.5, 0, 0] as [number, number, number],
      rotation: [0, -0.3, 0] as [number, number, number],
      scale: 1,
    },
  ];

  // Define dialogue timing
  // Place audio files in public/audio/voiceovers/ folder
  const dialogue = [
    {
      characterId: "character-1",
      audioFile: "audio/voiceovers/line-1.mp3",
      startFrame: 30, // Start at 1 second
      durationInFrames: 90, // 3 seconds
    },
    {
      characterId: "character-2",
      audioFile: "audio/voiceovers/line-2.mp3",
      startFrame: 150, // Start at 5 seconds
      durationInFrames: 60, // 2 seconds
    },
    {
      characterId: "character-1",
      audioFile: "audio/voiceovers/line-3.mp3",
      startFrame: 240, // Start at 8 seconds
      durationInFrames: 90, // 3 seconds
    },
  ];

  // Subtitle display (optional)
  const subtitles = [
    { text: "Hey, did you hear about AI?", startFrame: 30, endFrame: 120 },
    { text: "Yeah, it's taking over everything!", startFrame: 150, endFrame: 210 },
    { text: "Well... at least it writes good jokes.", startFrame: 240, endFrame: 330 },
  ];

  const currentSubtitle = subtitles.find(
    (s) => frame >= s.startFrame && frame < s.endFrame
  );

  return (
    <AbsoluteFill>
      <Scene
        characters={characters}
        dialogue={dialogue}
        backgroundColor="#1a1a2e"
        cameraPosition={[0, 1.5, 5]}
      />

      {/* Subtitles overlay */}
      {currentSubtitle && (
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
              fontSize: 28,
              fontFamily: "sans-serif",
              maxWidth: "80%",
              textAlign: "center",
            }}
          >
            {currentSubtitle.text}
          </div>
        </AbsoluteFill>
      )}

      {/* Title card at the beginning */}
      <Sequence durationInFrames={30}>
        <AbsoluteFill
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              color: "white",
              fontSize: 64,
              fontFamily: "sans-serif",
              opacity: interpolate(frame, [0, 15, 25, 30], [0, 1, 1, 0]),
            }}
          >
            Comedy Skit Title
          </h1>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
