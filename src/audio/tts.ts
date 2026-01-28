/**
 * Text-to-Speech utilities for generating voiceovers
 *
 * This file provides helpers for integrating TTS services.
 * You can use various TTS providers:
 *
 * 1. ElevenLabs (high quality, realistic voices)
 *    - npm install elevenlabs
 *    - Requires API key
 *
 * 2. OpenAI TTS
 *    - npm install openai
 *    - Requires API key
 *
 * 3. Google Cloud TTS
 *    - npm install @google-cloud/text-to-speech
 *    - Requires credentials
 *
 * 4. Local/Free options:
 *    - Coqui TTS (open source)
 *    - Edge TTS (free, uses Microsoft Edge voices)
 */

export interface VoiceConfig {
  provider: "elevenlabs" | "openai" | "google" | "edge";
  voiceId: string;
  speed?: number;
  pitch?: number;
}

export interface DialogueLine {
  id: string;
  text: string;
  voice: VoiceConfig;
  outputPath: string;
}

/**
 * Script structure for a comedy skit
 */
export interface Script {
  title: string;
  characters: {
    id: string;
    name: string;
    voice: VoiceConfig;
  }[];
  lines: {
    characterId: string;
    text: string;
    timing?: {
      pauseBefore?: number; // seconds
      pauseAfter?: number; // seconds
    };
  }[];
}

/**
 * Example script structure
 */
export const exampleScript: Script = {
  title: "AI Takes Over",
  characters: [
    {
      id: "bob",
      name: "Bob",
      voice: {
        provider: "elevenlabs",
        voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel voice
        speed: 1.0,
      },
    },
    {
      id: "alice",
      name: "Alice",
      voice: {
        provider: "elevenlabs",
        voiceId: "EXAVITQu4vr4xnSDxMaL", // Bella voice
        speed: 1.0,
      },
    },
  ],
  lines: [
    {
      characterId: "bob",
      text: "Hey Alice, did you hear? AI is writing all the code now.",
      timing: { pauseAfter: 0.5 },
    },
    {
      characterId: "alice",
      text: "Yeah, but can it debug? I think not!",
      timing: { pauseBefore: 0.3, pauseAfter: 0.5 },
    },
    {
      characterId: "bob",
      text: "Actually... it debugged my code yesterday. Found 47 bugs.",
      timing: { pauseBefore: 0.5 },
    },
    {
      characterId: "alice",
      text: "Okay but at least we still have job security, right?",
    },
    {
      characterId: "bob",
      text: "...",
      timing: { pauseAfter: 2.0 },
    },
  ],
};

/**
 * Generate a script file for TTS processing
 * Run this separately to generate audio files before rendering
 */
export const generateTTSScript = (script: Script): string => {
  let output = `# TTS Generation Script\n`;
  output += `# Title: ${script.title}\n\n`;

  script.lines.forEach((line, index) => {
    const character = script.characters.find((c) => c.id === line.characterId);
    if (!character) return;

    output += `## Line ${index + 1}\n`;
    output += `Character: ${character.name}\n`;
    output += `Voice: ${character.voice.voiceId}\n`;
    output += `Text: "${line.text}"\n`;
    output += `Output: public/audio/voiceovers/line-${index + 1}.mp3\n\n`;
  });

  return output;
};

/**
 * Calculate approximate frame timing based on text length
 * Assumes ~150 words per minute speaking rate
 */
export const estimateDialogueDuration = (
  text: string,
  fps: number = 30
): number => {
  const wordsPerMinute = 150;
  const words = text.split(/\s+/).length;
  const durationSeconds = (words / wordsPerMinute) * 60;
  return Math.ceil(durationSeconds * fps);
};

/**
 * Generate dialogue timing from a script
 */
export const generateDialogueTiming = (
  script: Script,
  fps: number = 30,
  startFrame: number = 30 // Start after 1 second
) => {
  let currentFrame = startFrame;
  const dialogue: {
    characterId: string;
    audioFile: string;
    startFrame: number;
    durationInFrames: number;
  }[] = [];

  script.lines.forEach((line, index) => {
    const pauseBefore = (line.timing?.pauseBefore || 0) * fps;
    currentFrame += pauseBefore;

    const duration = estimateDialogueDuration(line.text, fps);

    dialogue.push({
      characterId: line.characterId,
      audioFile: `audio/voiceovers/line-${index + 1}.mp3`,
      startFrame: Math.floor(currentFrame),
      durationInFrames: duration,
    });

    currentFrame += duration;
    const pauseAfter = (line.timing?.pauseAfter || 0.5) * fps;
    currentFrame += pauseAfter;
  });

  return dialogue;
};
