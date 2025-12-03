# Math Runner: Project Plan

## Executive Summary

**Math Runner** is a 3D web-based educational game combining infinite runner mechanics with arithmetic practice. Players guide a character along a suspended path, solving number bond equations to fill gaps before the character reaches them. The visual style is low-poly and isometric-inspired, evoking Monument Valley aesthetics.

---

## Table of Contents

1. [Technical Architecture](#1-technical-architecture)
2. [Project Structure](#2-project-structure)
3. [Development Phases](#3-development-phases)
4. [Detailed Task Breakdown](#4-detailed-task-breakdown)
5. [Technical Specifications](#5-technical-specifications)
6. [Asset Requirements](#6-asset-requirements)
7. [Level Design System](#7-level-design-system)
8. [Testing Strategy](#8-testing-strategy)
9. [Definition of Done](#9-definition-of-done)

---

## 1. Technical Architecture

### 1.1 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| 3D Rendering | Three.js (r160+) | Industry standard for web 3D, excellent documentation, large community |
| Build Tool | Vite | Fast HMR, excellent Three.js support, simple config |
| Language | TypeScript | Type safety reduces bugs, better IDE support for junior devs |
| State Management | Custom finite state machine | Simple, debuggable, no external dependencies |
| Animation | Three.js AnimationMixer + Tween.js | Built-in for models, Tween.js for UI animations |
| Persistence | localStorage | Simple, no backend required |
| Asset Pipeline | glTF/GLB format | Web-optimized, Three.js native support |

### 1.2 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER WINDOW                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    HTML CONTAINER                         │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │              THREE.JS CANVAS                        │  │  │
│  │  │  ┌─────────────────────────────────────────────┐    │  │  │
│  │  │  │           MAIN 3D SCENE                     │    │  │  │
│  │  │  │  • Path/Bridge geometry                     │    │  │  │
│  │  │  │  • Character                                │    │  │  │
│  │  │  │  • Gaps with answer slots                   │    │  │  │
│  │  │  │  • Environment/skybox                       │    │  │  │
│  │  │  │  • Flying number blocks                     │    │  │  │
│  │  │  └─────────────────────────────────────────────┘    │  │  │
│  │  │  ┌─────────────────────────────────────────────┐    │  │  │
│  │  │  │           HUD SCENE (Screen Space)          │    │  │  │
│  │  │  │  • Equation display (top)                   │    │  │  │
│  │  │  │  • Number tile selector (bottom)            │    │  │  │
│  │  │  └─────────────────────────────────────────────┘    │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │           HTML OVERLAY (Menus only)                 │  │  │
│  │  │  • Main menu          • Settings                    │  │  │
│  │  │  • Level select       • Game over modal             │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Core Systems Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         GAME ENGINE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │    Game      │    │   Scene      │    │   Asset      │      │
│  │  State       │◄──►│   Manager    │◄──►│   Loader     │      │
│  │  Machine     │    │              │    │              │      │
│  └──────┬───────┘    └──────┬───────┘    └──────────────┘      │
│         │                   │                                   │
│         ▼                   ▼                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Level      │    │   Renderer   │    │   Input      │      │
│  │   Manager    │◄──►│   System     │◄──►│   Handler    │      │
│  │              │    │              │    │              │      │
│  └──────┬───────┘    └──────────────┘    └──────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Path       │    │   Character  │    │   Problem    │      │
│  │   Generator  │◄──►│   Controller │◄──►│   Generator  │      │
│  │              │    │              │    │              │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   HUD        │    │   Animation  │    │   Progress   │      │
│  │   Controller │    │   System     │    │   Manager    │      │
│  │              │    │              │    │              │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.4 Game State Machine

```
                           ┌─────────┐
                           │  BOOT   │
                           └────┬────┘
                                │ assets loaded
                                ▼
                           ┌─────────┐
              ┌───────────►│  MENU   │◄───────────┐
              │            └────┬────┘            │
              │                 │ play            │
              │                 ▼                 │
              │         ┌──────────────┐          │
              │         │ LEVEL_SELECT │          │
              │         └──────┬───────┘          │
              │                │ select level     │
              │                ▼                  │
              │         ┌──────────────┐          │
              │         │   LOADING    │          │
              │         └──────┬───────┘          │
              │                │ ready            │
              │                ▼                  │
              │         ┌──────────────┐          │
      menu    │         │   COUNTDOWN  │          │ menu
              │         └──────┬───────┘          │
              │                │ 3..2..1..GO!     │
              │                ▼                  │
              │         ┌──────────────┐          │
              │    ┌───►│   PLAYING    │───┐      │
              │    │    └──────┬───────┘   │      │
              │    │           │           │      │
              │    │     ┌─────┴─────┐     │      │
              │    │     ▼           ▼     │      │
              │    │ ┌───────┐ ┌──────────┐│      │
              │    │ │ PAUSE │ │GAME_OVER ├┼──────┘
              │    │ └───┬───┘ └──────────┘│ retry
              │    │     │                 │
              │    └─────┘                 │
              │        resume              │
              │                            │
              │    ┌───────────────────────┘
              │    │ fall
              │    ▼
              │ ┌──────────────┐
              │ │LEVEL_COMPLETE│
              │ └──────┬───────┘
              │        │ next level
              └────────┘
```

---

## 2. Project Structure

```
math-runner/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
│
├── public/
│   ├── favicon.ico
│   └── assets/
│       ├── models/
│       │   ├── character.glb
│       │   ├── path-segment.glb
│       │   ├── number-block.glb
│       │   ├── gap-slot.glb
│       │   └── environment/
│       │       ├── clouds.glb
│       │       ├── floating-islands.glb
│       │       └── decorations.glb
│       ├── textures/
│       │   ├── palette.png          # Color palette texture
│       │   └── skybox/
│       └── fonts/
│           └── roboto-bold.json     # 3D text font
│
├── src/
│   ├── main.ts                      # Entry point
│   ├── Game.ts                      # Main game class
│   │
│   ├── config/
│   │   ├── constants.ts             # Game constants
│   │   ├── levels.ts                # Level definitions
│   │   └── theme.ts                 # Visual theme config
│   │
│   ├── core/
│   │   ├── StateMachine.ts          # Generic state machine
│   │   ├── GameStateMachine.ts      # Game-specific states
│   │   ├── AssetLoader.ts           # Asset loading manager
│   │   ├── InputHandler.ts          # Unified input (touch/mouse/keyboard)
│   │   └── ProgressManager.ts       # Save/load progress
│   │
│   ├── scenes/
│   │   ├── SceneManager.ts          # Scene orchestration
│   │   ├── MainScene.ts             # 3D gameplay scene
│   │   └── HUDScene.ts              # Screen-space UI scene
│   │
│   ├── entities/
│   │   ├── Character.ts             # Player character
│   │   ├── Path.ts                  # Path/bridge segments
│   │   ├── Gap.ts                   # Gap with answer slot
│   │   ├── NumberBlock.ts           # Selectable number tiles
│   │   └── Environment.ts           # Background elements
│   │
│   ├── systems/
│   │   ├── PathGenerator.ts         # Procedural path creation
│   │   ├── ProblemGenerator.ts      # Math problem generation
│   │   ├── AnimationSystem.ts       # Centralized animations
│   │   └── CameraController.ts      # Camera follow logic
│   │
│   ├── ui/
│   │   ├── MenuOverlay.ts           # HTML menu screens
│   │   ├── LevelSelectScreen.ts     # Level selection
│   │   ├── GameOverScreen.ts        # Game over modal
│   │   └── UIComponents.ts          # Reusable UI elements
│   │
│   ├── math/
│   │   ├── NumberBonds.ts           # Number bond logic
│   │   └── ProblemTypes.ts          # Problem type definitions
│   │
│   ├── utils/
│   │   ├── helpers.ts               # Utility functions
│   │   ├── easing.ts                # Easing functions
│   │   └── objectPool.ts            # Object pooling
│   │
│   └── types/
│       ├── index.ts                 # Type exports
│       ├── game.types.ts            # Game-related types
│       └── level.types.ts           # Level-related types
│
├── styles/
│   └── main.css                     # Minimal CSS for HTML overlays
│
└── tests/
    ├── ProblemGenerator.test.ts
    ├── NumberBonds.test.ts
    └── StateMachine.test.ts
```

---

## 3. Development Phases

### Phase Overview

```
Phase 1: Foundation (Week 1-2)
├── Project setup
├── Core architecture
├── Basic rendering
└── Input handling

Phase 2: Core Gameplay (Week 3-4)
├── Character movement
├── Path generation
├── Gap/answer system
└── Problem generation

Phase 3: HUD & Interaction (Week 5-6)
├── Screen-space number tiles
├── Equation display
├── Tile selection & animation
└── Answer validation

Phase 4: Game Flow (Week 7-8)
├── State machine implementation
├── Menu screens
├── Level progression
└── Save/load system

Phase 5: Visual Polish (Week 9-10)
├── Asset integration
├── Lighting & atmosphere
├── Animations & effects
└── Visual feedback

Phase 6: Testing & Refinement (Week 11-12)
├── Playtesting
├── Bug fixes
├── Performance optimization
└── Final polish
```

---

## 4. Detailed Task Breakdown

### Phase 1: Foundation

#### 1.1 Project Setup
| Task | Description | Est. Hours |
|------|-------------|------------|
| 1.1.1 | Initialize Vite + TypeScript project | 1 |
| 1.1.2 | Configure Three.js and dependencies | 1 |
| 1.1.3 | Set up folder structure per spec | 1 |
| 1.1.4 | Configure ESLint + Prettier | 1 |
| 1.1.5 | Create basic HTML container with canvas | 1 |
| 1.1.6 | Set up Git repository with .gitignore | 0.5 |

**Deliverable:** Empty project that builds and shows a blank canvas

#### 1.2 Core Rendering Setup
| Task | Description | Est. Hours |
|------|-------------|------------|
| 1.2.1 | Create `Game.ts` main class with game loop | 3 |
| 1.2.2 | Implement `SceneManager.ts` for dual-scene rendering | 4 |
| 1.2.3 | Set up main 3D scene with camera and lights | 2 |
| 1.2.4 | Set up HUD scene with orthographic camera | 3 |
| 1.2.5 | Implement responsive canvas resizing | 2 |
| 1.2.6 | Add basic isometric camera positioning | 2 |

**Deliverable:** Two scenes rendering, proper aspect ratio handling

#### 1.3 Asset Loading System
| Task | Description | Est. Hours |
|------|-------------|------------|
| 1.3.1 | Create `AssetLoader.ts` with loading manager | 3 |
| 1.3.2 | Implement progress tracking and callbacks | 2 |
| 1.3.3 | Add GLTF loader configuration | 1 |
| 1.3.4 | Create loading screen UI | 2 |
| 1.3.5 | Test with placeholder cube model | 1 |

**Deliverable:** Assets load with progress bar, placeholder models render

#### 1.4 Input System
| Task | Description | Est. Hours |
|------|-------------|------------|
| 1.4.1 | Create `InputHandler.ts` with event normalization | 3 |
| 1.4.2 | Implement touch input (tap, drag) | 2 |
| 1.4.3 | Implement mouse input | 1 |
| 1.4.4 | Implement keyboard input (number keys 1-9) | 1 |
| 1.4.5 | Add raycasting for 3D object selection | 3 |
| 1.4.6 | Test input on various devices | 2 |

**Deliverable:** Unified input system that detects taps on 3D objects

---

### Phase 2: Core Gameplay

#### 2.1 Character System
| Task | Description | Est. Hours |
|------|-------------|------------|
| 2.1.1 | Create `Character.ts` entity class | 2 |
| 2.1.2 | Implement forward movement at constant speed | 2 |
| 2.1.3 | Add placeholder character geometry | 1 |
| 2.1.4 | Implement running animation state | 3 |
| 2.1.5 | Create `CameraController.ts` for follow camera | 3 |
| 2.1.6 | Add smooth camera tracking | 2 |

**Deliverable:** Character moves forward, camera follows smoothly

#### 2.2 Path System
| Task | Description | Est. Hours |
|------|-------------|------------|
| 2.2.1 | Create `Path.ts` segment class | 2 |
| 2.2.2 | Design path segment data structure | 2 |
| 2.2.3 | Create `PathGenerator.ts` for level-based generation | 4 |
| 2.2.4 | Implement segment spawning ahead of character | 3 |
| 2.2.5 | Implement segment cleanup behind character | 2 |
| 2.2.6 | Add placeholder path geometry (low-poly blocks) | 2 |
| 2.2.7 | Test infinite scrolling path | 2 |

**Deliverable:** Path segments spawn and despawn as character moves

#### 2.3 Gap System
| Task | Description | Est. Hours |
|------|-------------|------------|
| 2.3.1 | Create `Gap.ts` entity class | 2 |
| 2.3.2 | Define gap data structure with answer slot | 2 |
| 2.3.3 | Integrate gaps into path generation | 3 |
| 2.3.4 | Create visual gap indicator (empty slot) | 2 |
| 2.3.5 | Add equation label above gap (world space text) | 3 |
| 2.3.6 | Implement gap state machine (empty/filled/wrong) | 2 |

**Deliverable:** Gaps appear in path with visible equation labels

#### 2.4 Collision & Falling
| Task | Description | Est. Hours |
|------|-------------|------------|
| 2.4.1 | Implement character-gap collision detection | 3 |
| 2.4.2 | Detect if gap is filled when character reaches it | 2 |
| 2.4.3 | Implement falling animation | 3 |
| 2.4.4 | Trigger game over state on fall | 1 |
| 2.4.5 | Add gap "safe zone" for brief moment before fall | 2 |

**Deliverable:** Character falls through unfilled gaps

---

### Phase 3: HUD & Interaction

#### 3.1 Number Tiles
| Task | Description | Est. Hours |
|------|-------------|------------|
| 3.1.1 | Create `NumberBlock.ts` for HUD tiles | 3 |
| 3.1.2 | Position tiles in screen-space (bottom of screen) | 3 |
| 3.1.3 | Add 3D number labels to tiles | 2 |
| 3.1.4 | Implement tile hover/highlight state | 2 |
| 3.1.5 | Add tile selection feedback | 2 |
| 3.1.6 | Implement tile sliding animation (new tile entering) | 3 |

**Deliverable:** Row of number tiles visible at bottom, respond to interaction

#### 3.2 Equation Display
| Task | Description | Est. Hours |
|------|-------------|------------|
| 3.2.1 | Create equation text renderer (3D text or sprite) | 3 |
| 3.2.2 | Position equation at top of screen | 1 |
| 3.2.3 | Implement equation update when active gap changes | 2 |
| 3.2.4 | Add equation highlight on correct answer | 1 |
| 3.2.5 | Style equation for clarity (large, readable) | 2 |

**Deliverable:** Current equation displays prominently at top

#### 3.3 Answer Selection Flow
| Task | Description | Est. Hours |
|------|-------------|------------|
| 3.3.1 | Connect tile tap to answer submission | 2 |
| 3.3.2 | Implement "fly to gap" animation for correct answer | 4 |
| 3.3.3 | Implement "fly away" animation for wrong answer | 3 |
| 3.3.4 | Fill gap with answered tile (correct) | 2 |
| 3.3.5 | Advance to next gap after correct answer | 2 |
| 3.3.6 | Test sequential answer requirement | 2 |

**Deliverable:** Full answer flow working - tap, animate, fill or miss

#### 3.4 Problem Generation
| Task | Description | Est. Hours |
|------|-------------|------------|
| 3.4.1 | Create `ProblemGenerator.ts` | 3 |
| 3.4.2 | Implement number bonds for target (e.g., 10) | 2 |
| 3.4.3 | Generate varied equations (a + _ = 10, _ + b = 10) | 2 |
| 3.4.4 | Ensure no duplicate answers in visible tiles | 2 |
| 3.4.5 | Generate distractor numbers for tiles | 2 |
| 3.4.6 | Create `NumberBonds.ts` utility module | 2 |

**Deliverable:** Valid math problems generated, tiles include correct answer plus distractors

---

### Phase 4: Game Flow

#### 4.1 State Machine
| Task | Description | Est. Hours |
|------|-------------|------------|
| 4.1.1 | Create generic `StateMachine.ts` class | 3 |
| 4.1.2 | Implement `GameStateMachine.ts` with all states | 4 |
| 4.1.3 | Add state transition logic | 2 |
| 4.1.4 | Implement state enter/exit hooks | 2 |
| 4.1.5 | Connect state machine to game systems | 3 |

**Deliverable:** Game flow controlled by state machine

#### 4.2 Menu System
| Task | Description | Est. Hours |
|------|-------------|------------|
| 4.2.1 | Create `MenuOverlay.ts` base class | 2 |
| 4.2.2 | Implement main menu (Play, Settings) | 3 |
| 4.2.3 | Create `LevelSelectScreen.ts` | 4 |
| 4.2.4 | Design level card component (locked/unlocked/stars) | 3 |
| 4.2.5 | Implement pause menu | 2 |
| 4.2.6 | Create `GameOverScreen.ts` | 2 |
| 4.2.7 | Create level complete screen | 3 |
| 4.2.8 | Style menus to match game aesthetic | 4 |

**Deliverable:** Full menu navigation working

#### 4.3 Level System
| Task | Description | Est. Hours |
|------|-------------|------------|
| 4.3.1 | Define level data structure in `levels.ts` | 2 |
| 4.3.2 | Create level configs for at least 5 levels | 3 |
| 4.3.3 | Implement `LevelManager.ts` | 3 |
| 4.3.4 | Add level loading/initialization | 2 |
| 4.3.5 | Implement level completion detection | 2 |
| 4.3.6 | Calculate level score (e.g., based on accuracy) | 2 |

**Deliverable:** Multiple playable levels with completion tracking

#### 4.4 Progress Persistence
| Task | Description | Est. Hours |
|------|-------------|------------|
| 4.4.1 | Create `ProgressManager.ts` | 2 |
| 4.4.2 | Define save data structure | 1 |
| 4.4.3 | Implement localStorage save | 2 |
| 4.4.4 | Implement localStorage load | 2 |
| 4.4.5 | Add level unlock logic | 2 |
| 4.4.6 | Save best scores per level | 2 |
| 4.4.7 | Add progress reset option | 1 |

**Deliverable:** Progress persists across browser sessions

---

### Phase 5: Visual Polish

#### 5.1 Asset Integration
| Task | Description | Est. Hours |
|------|-------------|------------|
| 5.1.1 | Source/create character model (low-poly) | 4 |
| 5.1.2 | Source/create path segment models | 4 |
| 5.1.3 | Source/create number block models | 3 |
| 5.1.4 | Source/create environment props | 4 |
| 5.1.5 | Integrate all models into asset loader | 3 |
| 5.1.6 | Replace placeholder geometry | 4 |

**Deliverable:** All placeholder art replaced with final assets

#### 5.2 Lighting & Atmosphere
| Task | Description | Est. Hours |
|------|-------------|------------|
| 5.2.1 | Design color palette (Monument Valley inspired) | 2 |
| 5.2.2 | Set up three-point lighting | 2 |
| 5.2.3 | Add ambient lighting for soft shadows | 1 |
| 5.2.4 | Create skybox/gradient background | 3 |
| 5.2.5 | Add fog for depth | 1 |
| 5.2.6 | Implement material shaders (flat/cel-shaded) | 4 |

**Deliverable:** Beautiful, cohesive visual style

#### 5.3 Animation & Effects
| Task | Description | Est. Hours |
|------|-------------|------------|
| 5.3.1 | Polish character run animation | 3 |
| 5.3.2 | Add character idle animation | 2 |
| 5.3.3 | Create tile selection particle effect | 3 |
| 5.3.4 | Add correct answer celebration effect | 3 |
| 5.3.5 | Polish falling animation | 2 |
| 5.3.6 | Add path segment appearance animation | 2 |
| 5.3.7 | Create level complete flourish | 3 |

**Deliverable:** Smooth, juicy animations throughout

#### 5.4 Visual Feedback
| Task | Description | Est. Hours |
|------|-------------|------------|
| 5.4.1 | Add urgency indicator (gap approaching) | 3 |
| 5.4.2 | Highlight next gap to answer | 2 |
| 5.4.3 | Add progress indicator for level | 2 |
| 5.4.4 | Create screen shake for wrong answer | 2 |
| 5.4.5 | Add glow effect for correct answer | 2 |

**Deliverable:** Clear visual communication of game state

---

### Phase 6: Testing & Refinement

#### 6.1 Playtesting
| Task | Description | Est. Hours |
|------|-------------|------------|
| 6.1.1 | Create playtest protocol | 2 |
| 6.1.2 | Conduct 5 playtest sessions | 10 |
| 6.1.3 | Document feedback and issues | 3 |
| 6.1.4 | Prioritize fixes | 2 |

#### 6.2 Bug Fixes
| Task | Description | Est. Hours |
|------|-------------|------------|
| 6.2.1 | Bug fix buffer (estimated) | 20 |

#### 6.3 Performance Optimization
| Task | Description | Est. Hours |
|------|-------------|------------|
| 6.3.1 | Profile with Chrome DevTools | 2 |
| 6.3.2 | Implement object pooling for path segments | 4 |
| 6.3.3 | Optimize draw calls (instancing) | 4 |
| 6.3.4 | Add level-of-detail for distant objects | 3 |
| 6.3.5 | Optimize textures and materials | 2 |

**Deliverable:** Smooth 60fps on target devices

#### 6.4 Final Polish
| Task | Description | Est. Hours |
|------|-------------|------------|
| 6.4.1 | Final visual pass | 4 |
| 6.4.2 | Difficulty balancing | 4 |
| 6.4.3 | Create app icon and splash screen | 2 |
| 6.4.4 | Final cross-browser testing | 2 |
| 6.4.5 | Production build optimization | 2 |

**Deliverable:** Polished, shippable game

---

## 5. Technical Specifications

### 5.1 Game Loop

```typescript
// Game.ts - Main game loop structure
class Game {
  private renderer: THREE.WebGLRenderer;
  private sceneManager: SceneManager;
  private stateMachine: GameStateMachine;
  private inputHandler: InputHandler;
  private clock: THREE.Clock;
  
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly FIXED_TIMESTEP: number = 1000 / 60; // 60 updates/sec
  
  constructor() {
    this.clock = new THREE.Clock();
    this.init();
  }
  
  private init(): void {
    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false 
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('game-container')!.appendChild(this.renderer.domElement);
    
    // Initialize systems
    this.sceneManager = new SceneManager(this.renderer);
    this.inputHandler = new InputHandler(this.renderer.domElement);
    this.stateMachine = new GameStateMachine(this);
    
    // Start loop
    this.gameLoop();
  }
  
  private gameLoop = (): void => {
    requestAnimationFrame(this.gameLoop);
    
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    // Fixed timestep for physics/game logic
    this.accumulator += deltaTime;
    while (this.accumulator >= this.FIXED_TIMESTEP) {
      this.fixedUpdate(this.FIXED_TIMESTEP / 1000);
      this.accumulator -= this.FIXED_TIMESTEP;
    }
    
    // Variable timestep for rendering
    const alpha = this.accumulator / this.FIXED_TIMESTEP;
    this.render(alpha);
  };
  
  private fixedUpdate(dt: number): void {
    this.stateMachine.update(dt);
    this.inputHandler.update();
  }
  
  private render(alpha: number): void {
    this.sceneManager.render(alpha);
  }
}
```

### 5.2 Scene Manager (Dual Scene Rendering)

```typescript
// SceneManager.ts
class SceneManager {
  private mainScene: THREE.Scene;
  private hudScene: THREE.Scene;
  private mainCamera: THREE.PerspectiveCamera;
  private hudCamera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  
  constructor(renderer: THREE.WebGLRenderer) {
    this.renderer = renderer;
    this.setupMainScene();
    this.setupHUDScene();
  }
  
  private setupMainScene(): void {
    this.mainScene = new THREE.Scene();
    this.mainScene.background = new THREE.Color(0x87CEEB); // Sky blue
    
    // Isometric-ish perspective camera
    const aspect = window.innerWidth / window.innerHeight;
    this.mainCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    
    // Position for isometric-like view
    // Looking down at 45 degrees, offset to the side
    this.mainCamera.position.set(10, 10, 10);
    this.mainCamera.lookAt(0, 0, 0);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.mainScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    this.mainScene.add(directionalLight);
  }
  
  private setupHUDScene(): void {
    this.hudScene = new THREE.Scene();
    
    // Orthographic camera for screen-space HUD
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 10;
    this.hudCamera = new THREE.OrthographicCamera(
      -frustumSize * aspect / 2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      100
    );
    this.hudCamera.position.z = 10;
    
    // Soft lighting for HUD elements
    const hudLight = new THREE.AmbientLight(0xffffff, 1);
    this.hudScene.add(hudLight);
  }
  
  public render(alpha: number): void {
    // Clear and render main scene
    this.renderer.autoClear = true;
    this.renderer.render(this.mainScene, this.mainCamera);
    
    // Render HUD scene on top (no clear)
    this.renderer.autoClear = false;
    this.renderer.clearDepth();
    this.renderer.render(this.hudScene, this.hudCamera);
    this.renderer.autoClear = true;
  }
  
  public onResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;
    
    this.mainCamera.aspect = aspect;
    this.mainCamera.updateProjectionMatrix();
    
    const frustumSize = 10;
    this.hudCamera.left = -frustumSize * aspect / 2;
    this.hudCamera.right = frustumSize * aspect / 2;
    this.hudCamera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
  }
}
```

### 5.3 State Machine

```typescript
// StateMachine.ts
interface State {
  name: string;
  onEnter?: () => void;
  onExit?: () => void;
  onUpdate?: (dt: number) => void;
}

class StateMachine {
  private states: Map<string, State> = new Map();
  private currentState: State | null = null;
  
  public addState(state: State): void {
    this.states.set(state.name, state);
  }
  
  public setState(name: string): void {
    const newState = this.states.get(name);
    if (!newState) {
      console.error(`State "${name}" not found`);
      return;
    }
    
    if (this.currentState?.onExit) {
      this.currentState.onExit();
    }
    
    this.currentState = newState;
    
    if (this.currentState.onEnter) {
      this.currentState.onEnter();
    }
  }
  
  public update(dt: number): void {
    if (this.currentState?.onUpdate) {
      this.currentState.onUpdate(dt);
    }
  }
  
  public getCurrentState(): string | null {
    return this.currentState?.name ?? null;
  }
}

// GameStateMachine.ts - Game-specific implementation
class GameStateMachine extends StateMachine {
  constructor(game: Game) {
    super();
    
    this.addState({
      name: 'BOOT',
      onEnter: () => game.loadAssets(),
    });
    
    this.addState({
      name: 'MENU',
      onEnter: () => game.showMainMenu(),
      onExit: () => game.hideMainMenu(),
    });
    
    this.addState({
      name: 'PLAYING',
      onEnter: () => game.startLevel(),
      onUpdate: (dt) => game.updateGameplay(dt),
      onExit: () => game.cleanupLevel(),
    });
    
    // ... other states
  }
}
```

### 5.4 Path & Gap System

```typescript
// types/level.types.ts
interface PathSegment {
  id: string;
  length: number;          // Length in world units
  hasGap: boolean;
  gap?: GapConfig;
}

interface GapConfig {
  position: number;        // Position along segment (0-1)
  equation: Equation;
}

interface Equation {
  type: 'addition' | 'subtraction';
  format: 'a+_=c' | '_+b=c' | 'a+b=_';  // Which part is missing
  operandA: number;
  operandB: number;
  answer: number;
  target: number;          // The number we're making (e.g., 10)
}

// Path.ts
class Path {
  private segments: PathSegmentEntity[] = [];
  private readonly SEGMENT_LENGTH = 20;
  private readonly SPAWN_DISTANCE = 100;  // Spawn when this far from character
  private readonly DESPAWN_DISTANCE = 20;  // Despawn when this far behind
  
  constructor(
    private scene: THREE.Scene,
    private levelConfig: LevelConfig,
    private problemGenerator: ProblemGenerator
  ) {}
  
  public update(characterZ: number): void {
    // Spawn new segments ahead
    const lastSegmentEnd = this.getLastSegmentEnd();
    while (lastSegmentEnd < characterZ + this.SPAWN_DISTANCE) {
      this.spawnNextSegment();
    }
    
    // Despawn old segments behind
    this.segments = this.segments.filter(segment => {
      if (segment.endZ < characterZ - this.DESPAWN_DISTANCE) {
        segment.dispose();
        return false;
      }
      return true;
    });
  }
  
  private spawnNextSegment(): void {
    const segmentConfig = this.levelConfig.getNextSegment();
    const startZ = this.getLastSegmentEnd();
    
    const segment = new PathSegmentEntity(
      startZ,
      segmentConfig,
      this.problemGenerator
    );
    
    this.scene.add(segment.mesh);
    this.segments.push(segment);
  }
  
  public getNextUnfilledGap(characterZ: number): GapEntity | null {
    for (const segment of this.segments) {
      if (segment.gap && !segment.gap.isFilled && segment.gap.worldZ > characterZ) {
        return segment.gap;
      }
    }
    return null;
  }
}

// Gap.ts
class GapEntity {
  public mesh: THREE.Group;
  public worldZ: number;
  public equation: Equation;
  public isFilled: boolean = false;
  
  private slot: THREE.Mesh;
  private filledBlock: THREE.Mesh | null = null;
  
  constructor(worldZ: number, equation: Equation) {
    this.worldZ = worldZ;
    this.equation = equation;
    this.mesh = new THREE.Group();
    
    this.createVisuals();
  }
  
  private createVisuals(): void {
    // Create empty slot (glowing outline effect)
    const slotGeometry = new THREE.BoxGeometry(2, 0.5, 2);
    const slotMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    });
    this.slot = new THREE.Mesh(slotGeometry, slotMaterial);
    this.mesh.add(this.slot);
  }
  
  public fill(answerBlock: NumberBlockEntity): void {
    this.isFilled = true;
    this.filledBlock = answerBlock.mesh.clone();
    this.filledBlock.position.set(0, 0, 0);
    this.mesh.add(this.filledBlock);
    
    // Hide slot visual
    this.slot.visible = false;
  }
  
  public checkAnswer(answer: number): boolean {
    return answer === this.equation.answer;
  }
}
```

### 5.5 Problem Generator

```typescript
// ProblemGenerator.ts
class ProblemGenerator {
  private target: number;
  private usedEquations: Set<string> = new Set();
  
  constructor(target: number = 10) {
    this.target = target;
  }
  
  public generateEquation(): Equation {
    const bonds = this.getNumberBonds(this.target);
    const [a, b] = this.pickRandomBond(bonds);
    
    // Randomly choose format
    const formats: Array<'a+_=c' | '_+b=c' | 'a+b=_'> = ['a+_=c', '_+b=c'];
    const format = formats[Math.floor(Math.random() * formats.length)];
    
    let answer: number;
    switch (format) {
      case 'a+_=c':
        answer = b;
        break;
      case '_+b=c':
        answer = a;
        break;
      case 'a+b=_':
        answer = this.target;
        break;
    }
    
    return {
      type: 'addition',
      format,
      operandA: a,
      operandB: b,
      answer,
      target: this.target
    };
  }
  
  private getNumberBonds(target: number): Array<[number, number]> {
    const bonds: Array<[number, number]> = [];
    for (let i = 0; i <= target; i++) {
      bonds.push([i, target - i]);
    }
    return bonds;
  }
  
  private pickRandomBond(bonds: Array<[number, number]>): [number, number] {
    // Avoid 0 and target (too easy)
    const filtered = bonds.filter(([a, b]) => a > 0 && b > 0);
    return filtered[Math.floor(Math.random() * filtered.length)];
  }
  
  public generateTileOptions(correctAnswer: number, count: number = 6): number[] {
    const options = new Set<number>([correctAnswer]);
    
    // Add distractors
    while (options.size < count) {
      // Generate plausible wrong answers (within reasonable range)
      const distractor = Math.floor(Math.random() * (this.target + 2));
      if (distractor !== correctAnswer && distractor > 0) {
        options.add(distractor);
      }
    }
    
    // Shuffle
    return this.shuffle([...options]);
  }
  
  private shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  public formatEquationString(eq: Equation): string {
    switch (eq.format) {
      case 'a+_=c':
        return `${eq.operandA} + _ = ${eq.target}`;
      case '_+b=c':
        return `_ + ${eq.operandB} = ${eq.target}`;
      case 'a+b=_':
        return `${eq.operandA} + ${eq.operandB} = _`;
    }
  }
}
```

### 5.6 HUD Controller (Screen-Space 3D)

```typescript
// HUDController.ts
class HUDController {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private numberTiles: NumberTileHUD[] = [];
  private equationDisplay: EquationDisplayHUD;
  
  private readonly TILE_COUNT = 6;
  private readonly TILE_SPACING = 1.8;
  private readonly TILE_Y_POSITION = -4;  // Bottom of screen
  
  constructor(scene: THREE.Scene, camera: THREE.OrthographicCamera) {
    this.scene = scene;
    this.camera = camera;
    
    this.createEquationDisplay();
    this.createNumberTiles();
  }
  
  private createEquationDisplay(): void {
    this.equationDisplay = new EquationDisplayHUD();
    this.equationDisplay.mesh.position.set(0, 4, 0); // Top of screen
    this.scene.add(this.equationDisplay.mesh);
  }
  
  private createNumberTiles(): void {
    const startX = -((this.TILE_COUNT - 1) * this.TILE_SPACING) / 2;
    
    for (let i = 0; i < this.TILE_COUNT; i++) {
      const tile = new NumberTileHUD(0); // Initial value, updated later
      tile.mesh.position.set(
        startX + i * this.TILE_SPACING,
        this.TILE_Y_POSITION,
        0
      );
      this.numberTiles.push(tile);
      this.scene.add(tile.mesh);
    }
  }
  
  public setEquation(equation: Equation, equationString: string): void {
    this.equationDisplay.setText(equationString);
  }
  
  public setTileValues(values: number[]): void {
    values.forEach((value, index) => {
      if (index < this.numberTiles.length) {
        this.numberTiles[index].setValue(value);
      }
    });
  }
  
  public onTileSelected(index: number): number {
    const tile = this.numberTiles[index];
    const value = tile.getValue();
    
    // Animate tile disappearing
    tile.animateSelection();
    
    return value;
  }
  
  public replaceTile(index: number, newValue: number): void {
    const tile = this.numberTiles[index];
    tile.animateReplacement(newValue);
  }
  
  public getTileAtScreenPosition(screenX: number, screenY: number): number {
    // Convert screen coords to HUD coords and find tile
    const hudX = (screenX / window.innerWidth) * 2 - 1;
    const hudY = -(screenY / window.innerHeight) * 2 + 1;
    
    // Raycast against tiles
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(hudX, hudY), this.camera);
    
    const tileMeshes = this.numberTiles.map(t => t.mesh);
    const intersects = raycaster.intersectObjects(tileMeshes, true);
    
    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      return this.numberTiles.findIndex(t => t.mesh === hitMesh || t.mesh.children.includes(hitMesh));
    }
    
    return -1;
  }
}

// NumberTileHUD.ts
class NumberTileHUD {
  public mesh: THREE.Group;
  private value: number;
  private textMesh: THREE.Mesh;
  private blockMesh: THREE.Mesh;
  
  constructor(value: number) {
    this.value = value;
    this.mesh = new THREE.Group();
    
    this.createBlockMesh();
    this.createTextMesh();
  }
  
  private createBlockMesh(): void {
    const geometry = new THREE.BoxGeometry(1.4, 1.4, 0.4);
    const material = new THREE.MeshStandardMaterial({
      color: 0x4ECDC4,  // Teal color
      roughness: 0.3,
      metalness: 0.1
    });
    this.blockMesh = new THREE.Mesh(geometry, material);
    this.mesh.add(this.blockMesh);
  }
  
  private createTextMesh(): void {
    // Use TextGeometry or Sprite for number display
    // Simplified: using a sprite here
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.value.toString(), 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1, 1, 1);
    sprite.position.z = 0.25;
    this.textMesh = sprite as unknown as THREE.Mesh;
    this.mesh.add(sprite);
  }
  
  public setValue(value: number): void {
    this.value = value;
    // Update text sprite
    this.updateTextMesh();
  }
  
  public getValue(): number {
    return this.value;
  }
  
  public animateSelection(): void {
    // Use Tween.js for smooth animation
    new TWEEN.Tween(this.mesh.scale)
      .to({ x: 0, y: 0, z: 0 }, 200)
      .easing(TWEEN.Easing.Back.In)
      .start();
  }
  
  public animateReplacement(newValue: number): void {
    // Animate in from below
    this.setValue(newValue);
    this.mesh.position.y = this.TILE_Y_POSITION - 3;
    this.mesh.scale.set(1, 1, 1);
    
    new TWEEN.Tween(this.mesh.position)
      .to({ y: this.TILE_Y_POSITION }, 300)
      .easing(TWEEN.Easing.Back.Out)
      .start();
  }
}
```

### 5.7 Level Configuration

```typescript
// config/levels.ts
interface LevelConfig {
  id: number;
  name: string;
  target: number;           // Number bonds target (10, 20, etc.)
  speed: number;            // Character speed (units/second)
  segmentCount: number;     // Number of segments to complete level
  gapFrequency: number;     // Gaps per segment (average)
  theme: ThemeConfig;
}

const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: "Making 10",
    target: 10,
    speed: 5,
    segmentCount: 10,
    gapFrequency: 1,
    theme: {
      pathColor: 0x7B68EE,    // Medium slate blue
      skyColor: 0x87CEEB,      // Sky blue
      accentColor: 0xFFD700,   // Gold
    }
  },
  {
    id: 2,
    name: "Making 10 - Faster",
    target: 10,
    speed: 7,
    segmentCount: 15,
    gapFrequency: 1.2,
    theme: {
      pathColor: 0x9370DB,
      skyColor: 0x98D8C8,
      accentColor: 0xFF6B6B,
    }
  },
  {
    id: 3,
    name: "Making 20",
    target: 20,
    speed: 5,
    segmentCount: 12,
    gapFrequency: 1,
    theme: {
      pathColor: 0x20B2AA,
      skyColor: 0xFFE4E1,
      accentColor: 0xFFB347,
    }
  },
  {
    id: 4,
    name: "Making 20 - Challenge",
    target: 20,
    speed: 8,
    segmentCount: 18,
    gapFrequency: 1.5,
    theme: {
      pathColor: 0xDA70D6,
      skyColor: 0xE6E6FA,
      accentColor: 0x00CED1,
    }
  },
  {
    id: 5,
    name: "Mixed Practice",
    target: -1,  // -1 = random between 10 and 20
    speed: 6,
    segmentCount: 20,
    gapFrequency: 1.3,
    theme: {
      pathColor: 0xFF69B4,
      skyColor: 0xFFFACD,
      accentColor: 0x32CD32,
    }
  },
];

export { LEVELS, LevelConfig };
```

---

## 6. Asset Requirements

### 6.1 3D Models Needed

| Asset | Description | Poly Budget | Format | Source Suggestion |
|-------|-------------|-------------|--------|-------------------|
| Character | Simple humanoid, stylized | < 2000 tris | GLB | Quaternius, Kenney |
| Path Segment | Rectangular block/platform | < 500 tris | GLB | Create in Blender |
| Number Block | Cube with beveled edges | < 200 tris | GLB | Create in Blender |
| Gap Slot | Frame/outline for missing block | < 300 tris | GLB | Create in Blender |
| Cloud | Low-poly cotton ball style | < 300 tris | GLB | Kenney |
| Floating Island | Decorative background | < 1000 tris | GLB | Quaternius |
| Tree (stylized) | Simple geometric | < 500 tris | GLB | Kenney |

### 6.2 Free Asset Sources

1. **Kenney.nl** (https://kenney.nl/assets)
   - Completely free (CC0), high quality
   - Good for: Characters, props, UI elements

2. **Quaternius** (https://quaternius.com)
   - Free low-poly packs
   - Good for: Characters, environments

3. **Poly Pizza** (https://poly.pizza)
   - CC-licensed models
   - Good for: Various props

4. **Sketchfab** (https://sketchfab.com, filter by "downloadable" and "CC0")
   - Wide variety
   - Check license carefully

### 6.3 Textures & Materials

For the Monument Valley aesthetic, use:
- Flat colors (no texture maps)
- Soft gradients via vertex colors
- Color palette limited to 8-12 harmonious colors

**Suggested Palette:**
```
Primary:    #7B68EE (Slate Blue)
Secondary:  #4ECDC4 (Teal)
Accent:     #FFD93D (Warm Yellow)
Success:    #6BCB77 (Green)
Error:      #FF6B6B (Coral Red)
Background: #F8F9FA (Off White)
Dark:       #2C3E50 (Navy)
```

### 6.4 Fonts

- **3D Text:** Use `three-bmfont-text` or canvas-based text sprites
- **UI Text (HTML):** Google Fonts - "Nunito" or "Poppins" (rounded, friendly)

---

## 7. Level Design System

### 7.1 Level Data Format

```typescript
// types/level.types.ts
interface LevelDefinition {
  id: number;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  mathConfig: MathConfig;
  pathConfig: PathConfig;
  visualConfig: VisualConfig;
}

interface MathConfig {
  targets: number[];           // e.g., [10] or [10, 20]
  operationTypes: ('add' | 'subtract')[];
  equationFormats: EquationFormat[];
}

interface PathConfig {
  totalLength: number;         // Total level length in units
  characterSpeed: number;
  gapPatterns: GapPattern[];
  warmupLength: number;        // Safe distance at start
}

interface GapPattern {
  minSpacing: number;          // Min distance between gaps
  maxSpacing: number;          // Max distance between gaps
  weight: number;              // Probability weight
}

interface VisualConfig {
  themeId: string;
  pathStyle: 'straight' | 'curved' | 'zigzag';
  decorations: DecorationConfig[];
}
```

### 7.2 Level Authoring Guide

**For the Junior Engineer:**

To create a new level:

1. Add entry to `src/config/levels.ts`
2. Configure difficulty by adjusting:
   - `speed`: Higher = harder (5-10 range)
   - `gapFrequency`: Higher = more problems (1-2 range)
   - `target`: 10 is easier than 20

**Example - Creating Level 6:**
```typescript
{
  id: 6,
  name: "Speed Demon",
  target: 10,
  speed: 10,              // Fast!
  segmentCount: 12,
  gapFrequency: 1.8,      // Lots of gaps
  theme: {
    pathColor: 0xFF4500,  // Orange-red (danger!)
    skyColor: 0x2F4F4F,   // Dark slate
    accentColor: 0xFFFF00, // Yellow
  }
}
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

Test these modules with Jest/Vitest:

| Module | Test Cases |
|--------|------------|
| `ProblemGenerator` | Generates valid equations, no duplicate answers in tiles, correct answer always included |
| `NumberBonds` | Returns all pairs for given target, excludes 0 when configured |
| `StateMachine` | Transitions correctly, calls enter/exit hooks |
| `ProgressManager` | Saves/loads correctly, handles corrupted data |

### 8.2 Integration Tests

| Scenario | Validation |
|----------|------------|
| Complete a level | Score saved, next level unlocked |
| Answer correctly | Tile flies to gap, gap fills, equation advances |
| Answer incorrectly | Tile flies away, gap remains empty |
| Fall into gap | Game over triggered, can retry |
| Pause mid-game | Game pauses, can resume |

### 8.3 Manual Testing Checklist

**Before Each Release:**

- [ ] Fresh browser (no localStorage) - game starts correctly
- [ ] Existing save data loads properly
- [ ] All levels playable start to finish
- [ ] All menu transitions work
- [ ] Touch input on tablet/phone
- [ ] Mouse input on desktop
- [ ] Keyboard input (number keys) on desktop
- [ ] No console errors during normal play
- [ ] FPS stays above 55 on target device
- [ ] Resize window - layout adapts

---

## 9. Definition of Done

### 9.1 MVP Feature Completeness

- [ ] Player can start game from menu
- [ ] Player can select from 5 levels
- [ ] Character runs forward automatically at constant speed
- [ ] Path generates with gaps containing equations
- [ ] Number tiles displayed at bottom of screen
- [ ] Tapping tile submits answer
- [ ] Correct answer: tile fills gap, character continues
- [ ] Wrong answer: tile flies away
- [ ] Character falls if reaching unfilled gap
- [ ] Game over screen shows on fall
- [ ] Level complete screen shows when all gaps passed
- [ ] Progress saved to localStorage
- [ ] Level unlocking works (complete level N to unlock N+1)

### 9.2 Visual Quality Bar

- [ ] Consistent low-poly aesthetic throughout
- [ ] Color palette is harmonious
- [ ] Animations are smooth (no jerky movements)
- [ ] UI elements are clearly readable
- [ ] No z-fighting or visual glitches
- [ ] Camera framing shows relevant action

### 9.3 Performance Requirements

- [ ] Initial load < 5 seconds on broadband
- [ ] 60 FPS during gameplay (Chrome, 2020+ laptop)
- [ ] No memory leaks (30 min play session)
- [ ] Build size < 5MB (excluding large optional assets)

### 9.4 Code Quality

- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Key functions documented with JSDoc
- [ ] README with setup instructions
- [ ] All unit tests passing

---

## Appendix A: Development Environment Setup

```bash
# Create project
npm create vite@latest math-runner -- --template vanilla-ts
cd math-runner

# Install dependencies
npm install three @types/three
npm install @tweenjs/tween.js
npm install -D vite-plugin-glsl

# Development
npm run dev

# Build for production
npm run build
```

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [glsl()],
  build: {
    target: 'esnext',
    assetsInlineLimit: 0,
  },
  server: {
    host: true, // For testing on mobile devices on same network
  },
});
```

---

## Appendix B: Useful Code Snippets

### Flying Animation (Tile to Gap)

```typescript
function animateTileToGap(
  tile: THREE.Object3D,
  startPos: THREE.Vector3,    // Screen space
  endPos: THREE.Vector3,      // World space
  onComplete: () => void
): void {
  // Create a clone in main scene for the flight
  const flyingTile = tile.clone();
  mainScene.add(flyingTile);
  
  // Calculate arc path
  const midPoint = new THREE.Vector3().lerpVectors(startPos, endPos, 0.5);
  midPoint.y += 5; // Arc height
  
  const curve = new THREE.QuadraticBezierCurve3(startPos, midPoint, endPos);
  
  const duration = 500;
  const startTime = performance.now();
  
  function animate() {
    const elapsed = performance.now() - startTime;
    const t = Math.min(elapsed / duration, 1);
    
    const point = curve.getPoint(easeOutQuad(t));
    flyingTile.position.copy(point);
    
    // Spin while flying
    flyingTile.rotation.y += 0.1;
    flyingTile.rotation.x += 0.05;
    
    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      mainScene.remove(flyingTile);
      onComplete();
    }
  }
  
  animate();
}

function easeOutQuad(t: number): number {
  return t * (2 - t);
}
```

### Responsive Isometric Camera

```typescript
function setupIsometricCamera(): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(
    35,  // Narrower FOV for more orthographic feel
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  
  // Classic isometric angle
  const distance = 30;
  const angle = Math.PI / 4;  // 45 degrees
  const elevation = Math.atan(1 / Math.sqrt(2)); // ~35.264 degrees
  
  camera.position.set(
    distance * Math.cos(angle) * Math.cos(elevation),
    distance * Math.sin(elevation),
    distance * Math.sin(angle) * Math.cos(elevation)
  );
  
  camera.lookAt(0, 0, 0);
  
  return camera;
}
```
