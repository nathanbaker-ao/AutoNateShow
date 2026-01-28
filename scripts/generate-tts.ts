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

// AutoNate's voice configuration
const AUTONATE_VOICE = "onyx";
const AUTONATE_INSTRUCTIONS = `
Voice: Deep, warm, and enthusiastic male voice.
Personality: Friendly, adventurous, and genuinely excited to share stories.
Style: Speak with energy and expressiveness, like a passionate storyteller or show host.
Pacing: Clear articulation with natural pauses for emphasis.
Emotion: Convey genuine excitement and warmth.
`;

// Generate AutoNate's intro
async function main() {
  const text = "Hello world, I'm AutoNate and I am so excited to take you along with me on my adventures!";

  await generateTTS({
    text,
    voice: AUTONATE_VOICE,
    outputPath: path.join(__dirname, "../public/audio/voiceovers/autonate-intro.mp3"),
    instructions: AUTONATE_INSTRUCTIONS,
    speed: 1.0,
  });

  console.log("\nDone! Audio generated successfully.");
}

main().catch(console.error);
