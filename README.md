# The AutoNate Show

An AI-powered animated content creation pipeline built with Remotion and React Three Fiber, designed for autonomous story-to-video production.

## Vision

We're building the foundation for a fully autonomous content creation system where AI can take an idea from conception to final rendered video. The pipeline will handle:

1. **Idea Generation** - Brainstorming story concepts
2. **Discussion & Refinement** - Iterating on the narrative
3. **Script Writing** - Generating dialogue and scene descriptions
4. **Scene Selection** - AI choosing appropriate environments and settings
5. **Character Assignment** - Selecting characters and their animations based on the story needs
6. **Animation & Rendering** - Producing the final video output

## Tech Stack

### Core Framework
- **Remotion** - React-based video creation framework
- **React Three Fiber** - 3D rendering with Three.js in React
- **TypeScript** - Type-safe development

### AI Integration
- **Claude Code** - AI-assisted development with custom Remotion skills
- **OpenAI TTS** - Voice generation using `gpt-4o-mini-tts-2025-12-15` for character voiceovers and lipsync
- **Meshy.ai** - 3D asset generation for characters and environments

### Output Formats
We target multiple aspect ratios to maximize platform reach:
- **16:9** - YouTube, desktop viewing
- **9:16** - TikTok, Instagram Reels, YouTube Shorts

## Project Structure

```
src/
├── characters/        # Character components and animations
│   ├── Character.tsx  # Base character loader with animation support
│   ├── FollowCamera.tsx # Camera tracking system
│   └── index.ts
├── compositions/      # Remotion compositions
│   └── AutoNateScene.tsx # Main AutoNate walking scene
├── environments/      # 3D environment loaders
└── scenes/           # Reusable scene templates

public/
├── characters/       # Character .glb models
│   ├── autonate-idle.glb
│   ├── autonate-talking.glb
│   └── autonate-walking.glb
└── environments/     # Environment .glb models
```

## Features

### Character System
- **State-based animations** - Characters switch between idle, walking, and talking states
- **Waypoint-based movement** - Define walking paths with frame-accurate timing
- **Automatic rotation** - Characters face their movement direction

### Camera System
- **FollowCamera** - Smooth camera tracking with configurable offset and smoothing
- **Look-at targeting** - Camera automatically focuses on the character

### Animation Sync
- Frame-perfect animation playback synchronized with Remotion's timeline
- Support for looping and one-shot animations

## Commands

**Install Dependencies**
```console
npm i
```

**Start Preview**
```console
npm run dev
```

**Render Video**
```console
npx remotion render
```

**Build Bundle**
```console
npm run build
```

## Claude Code Integration

This project uses Claude Code with custom Remotion skills for AI-assisted development. The AI understands:
- Remotion best practices and patterns
- React Three Fiber 3D scene composition
- Character animation and state management
- Camera systems and movement paths

## Roadmap

- [ ] Lipsync integration with OpenAI TTS
- [ ] Multiple character scene support
- [ ] Dialogue system with automatic timing
- [ ] 9:16 vertical format compositions
- [ ] Scene library with AI selection
- [ ] Character animation library with capability descriptions
- [ ] End-to-end idea-to-video pipeline

## License

Note that for some entities a company license is needed for Remotion. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
