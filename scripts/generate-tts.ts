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

// Narrator voice configuration
const NARRATOR_VOICE = "onyx" as const;
const NARRATOR_INSTRUCTIONS = `
Voice: Deep, smooth, and cinematic narrator voice.
Style: Like a nature documentary or epic trailer narrator. Authoritative but warm.
Pacing: Measured and deliberate, with dramatic pauses.
Emotion: Sense of wonder and anticipation, building excitement.
`;

// AutoNate's voice configuration - energetic and exciting
const AUTONATE_VOICE = "fable" as const;
const AUTONATE_INSTRUCTIONS = `
Voice: Energetic, youthful, and hyped up.
Personality: Street-smart, confident, genuinely excited, radiating big energy.
Style: Like a hype man or an excited friend greeting you. Urban and cool.
Pacing: Quick and punchy with attitude.
Emotion: Pure excitement and swagger. This is his moment and he's PUMPED.
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
