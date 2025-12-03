# Math Runner

A 3D web-based educational game combining infinite runner mechanics with arithmetic practice. Players guide a character along a suspended path, solving number bond equations to fill gaps before the character reaches them.

## Features

- **Educational Gameplay**: Practice number bonds (making 10, making 20) while playing
- **3D Graphics**: Built with Three.js for smooth 3D rendering
- **Progressive Difficulty**: 5 levels with increasing speed and complexity
- **Save Progress**: LocalStorage-based progress tracking
- **Responsive**: Works on desktop and mobile devices

## Technology Stack

- **Three.js**: 3D rendering engine
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tween.js**: Animation library

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Game Controls

- **Mouse/Touch**: Tap on number tiles at the bottom to select answers
- **Keyboard**: Use number keys 1-9 to select tiles (coming soon)

## How to Play

1. The character runs forward automatically
2. Gaps appear in the path with math equations above them
3. Tap the correct answer from the tiles at the bottom
4. Fill the gap before your character reaches it
5. Complete all gaps to finish the level

## Project Structure

```
mathrunner/
├── src/
│   ├── config/          # Game constants and level definitions
│   ├── core/            # Core systems (state machine, input, etc.)
│   ├── entities/        # Game entities (character, gaps, etc.)
│   ├── math/            # Math utilities (number bonds)
│   ├── scenes/          # Three.js scene management
│   ├── systems/         # Game systems (path, camera, etc.)
│   ├── types/           # TypeScript type definitions
│   ├── ui/              # UI components
│   ├── utils/           # Helper functions
│   ├── Game.ts          # Main game class
│   └── main.ts          # Entry point
├── public/              # Static assets
└── styles/              # CSS styles
```

## Development Notes

This game was implemented following the comprehensive design document in `plan.md`. It includes:

- State machine for game flow management
- Dual-scene rendering (main 3D scene + HUD scene)
- Procedural path generation
- Dynamic problem generation
- Progress persistence using localStorage

## Future Enhancements

- 3D models for character and environment (currently using placeholder geometry)
- Sound effects and music
- Additional operation types (subtraction, multiplication)
- More visual effects and particles
- Leaderboard system
- More levels

## License

ISC
