import "dotenv/config";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

// Check for API key
if (!process.env.OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY environment variable is not set.");
  console.error("Please create a .env file with OPENAI_API_KEY=your-key-here");
  console.error("Or export OPENAI_API_KEY in your terminal.");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TTSOptions {
  text: string;
  voice: "alloy" | "ash" | "ballad" | "coral" | "echo" | "fable" | "onyx" | "nova" | "sage" | "shimmer" | "verse" | "marin" | "cedar";
  outputPath: string;
  instructions?: string;
  speed?: number;
}

async function generateTTS(options: TTSOptions): Promise<void> {
  const { text, voice, outputPath, instructions, speed = 1.0 } = options;

  console.log(`Generating TTS for: "${text.substring(0, 50)}..."`);
  console.log(`Voice: ${voice}`);
  console.log(`Output: ${outputPath}`);

  const response = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts-2025-12-15",
    voice: voice,
    input: text,
    instructions: instructions,
    speed: speed,
    response_format: "mp3",
  });

  const buffer = Buffer.from(await response.arrayBuffer());

  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, buffer);
  console.log(`Audio saved to: ${outputPath}`);
}

// Narrator voice configuration - warm female narrator
const NARRATOR_VOICE = "nova" as const;
const NARRATOR_INSTRUCTIONS = `
Voice: Warm, smooth, and captivating female narrator.
Style: Like a polished storyteller or cinematic trailer narrator. Confident and inviting.
Pacing: Measured and deliberate, with dramatic pauses for effect.
Emotion: Sense of wonder and anticipation, drawing the listener in.
`;

// AutoNate's voice configuration - young, happy, excited
const AUTONATE_VOICE = "ash" as const;
const AUTONATE_INSTRUCTIONS = `
Voice: Young, bright, and bursting with excitement.
Personality: Happy, enthusiastic kid energy. Like a young person who just got the best news ever.
Style: Genuine joy and infectious excitement. Big smile in the voice.
Pacing: Upbeat and lively, words tumbling out with pure happiness.
Emotion: Overflowing excitement and joy. This is the happiest moment of his life and he wants the whole world to know.
`;

// Generate narrated intro scene
async function main() {
  const outputDir = path.join(__dirname, "../public/audio/voiceovers");

  // 1. Narrator introduces AutoNate
  await generateTTS({
    text: "In a world full of stories waiting to be told, one character is ready to take the stage.",
    voice: NARRATOR_VOICE,
    outputPath: path.join(outputDir, "narrator-intro.mp3"),
    instructions: NARRATOR_INSTRUCTIONS,
    speed: 1.0,
  });

  // 2. AutoNate speaks
  await generateTTS({
    text: "What up doe, world! I'm AutoNate!",
    voice: AUTONATE_VOICE,
    outputPath: path.join(outputDir, "autonate-whatsup.mp3"),
    instructions: AUTONATE_INSTRUCTIONS,
    speed: 1.0,
  });

  console.log("\nDone! All audio generated successfully.");
}

main().catch(console.error);
