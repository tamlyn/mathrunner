import * as THREE from 'three';
import { GameStateMachine } from './core/GameStateMachine';
import { AssetLoader } from './core/AssetLoader';
import { InputHandler } from './core/InputHandler';
import { ProgressManager } from './core/ProgressManager';
import { SceneManager } from './scenes/SceneManager';
import { Character } from './entities/Character';
import { PathGenerator } from './systems/PathGenerator';
import { CameraController } from './systems/CameraController';
import { ProblemGenerator } from './systems/ProblemGenerator';
import { LevelManager } from './systems/LevelManager';
import { HUDController } from './ui/HUDController';
import { MenuOverlay } from './ui/MenuOverlay';
import { Gap } from './entities/Gap';
import { GAME_CONSTANTS } from './config/constants';

export class Game {
  private renderer: THREE.WebGLRenderer;
  private sceneManager: SceneManager;
  private stateMachine: GameStateMachine;
  private assetLoader: AssetLoader;
  private inputHandler: InputHandler;
  private progressManager: ProgressManager;
  private levelManager: LevelManager;
  private menuOverlay: MenuOverlay;

  // Gameplay objects
  private character: Character | null = null;
  private pathGenerator: PathGenerator | null = null;
  private problemGenerator: ProblemGenerator | null = null;
  private cameraController: CameraController | null = null;
  private hudController: HUDController | null = null;

  // Game state
  private currentGap: Gap | null = null;
  private currentTileValues: number[] = [];
  private gapsCompleted: number = 0;

  // Loop timing
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly FIXED_TIMESTEP: number = GAME_CONSTANTS.FIXED_TIMESTEP;

  constructor() {
    this.renderer = this.createRenderer();
    this.sceneManager = new SceneManager(this.renderer);
    this.assetLoader = new AssetLoader();
    this.progressManager = new ProgressManager();
    this.levelManager = new LevelManager();
    this.menuOverlay = new MenuOverlay();

    const canvas = this.renderer.domElement;
    this.inputHandler = new InputHandler(canvas);

    this.stateMachine = new GameStateMachine(this);

    this.setupMenuCallbacks();
    this.setupInputHandlers();
    this.gameLoop();
  }

  private createRenderer(): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('game-container')!.appendChild(renderer.domElement);
    return renderer;
  }

  private setupMenuCallbacks(): void {
    this.menuOverlay.onPlay(() => {
      this.stateMachine.setState('LEVEL_SELECT');
    });

    this.menuOverlay.onLevelSelect((levelId: number) => {
      this.levelManager.loadLevel(levelId);
      this.stateMachine.setState('LOADING');
    });

    this.menuOverlay.onRestart(() => {
      this.stateMachine.setState('LOADING');
    });

    this.menuOverlay.onMenu(() => {
      this.stateMachine.setState('MENU');
    });

    this.menuOverlay.onNextLevel(() => {
      const nextLevelId = this.levelManager.getNextLevelId();
      if (nextLevelId) {
        this.levelManager.loadLevel(nextLevelId);
        this.stateMachine.setState('LOADING');
      } else {
        this.stateMachine.setState('MENU');
      }
    });
  }

  private setupInputHandlers(): void {
    this.inputHandler.onClick((x: number, y: number) => {
      if (this.stateMachine.getCurrentState() === 'PLAYING') {
        this.handleTileClick(x, y);
      }
    });
  }

  private handleTileClick(x: number, y: number): void {
    if (!this.hudController || !this.currentGap) return;

    const tileIndex = this.hudController.getTileAtScreenPosition(x, y);
    if (tileIndex >= 0) {
      const value = this.hudController.selectTile(tileIndex, () => {
        // Animation complete - now handle the answer
        if (value !== null && this.currentGap) {
          this.handleAnswer(value, tileIndex);
        }
      });
    }
  }

  private handleAnswer(answer: number, tileIndex: number): void {
    if (!this.currentGap || !this.hudController || !this.problemGenerator) return;

    const isCorrect = this.currentGap.checkAnswer(answer);

    if (isCorrect) {
      // Fill the gap
      this.currentGap.fill(answer);
      this.levelManager.incrementCorrectAnswers();

      // Generate new tile value
      const newValue = this.problemGenerator.generateTileOptions(0, 1)[0];
      this.hudController.replaceTile(tileIndex, newValue);
      this.currentTileValues[tileIndex] = newValue;

      // Move to next gap
      this.gapsCompleted++;
      this.advanceToNextGap();
    } else {
      // Wrong answer - generate new tile
      const newValue = this.problemGenerator.generateTileOptions(
        this.currentGap.equation.answer,
        1
      )[0];
      this.hudController.replaceTile(tileIndex, newValue);
      this.currentTileValues[tileIndex] = newValue;
    }
  }

  private advanceToNextGap(): void {
    if (!this.character || !this.pathGenerator || !this.hudController || !this.problemGenerator)
      return;

    const nextGap = this.pathGenerator.getNextUnfilledGap(this.character.getZ());
    if (nextGap) {
      this.currentGap = nextGap;

      // Update equation display
      const equationString = this.problemGenerator.formatEquationString(nextGap.equation);
      this.hudController.setEquation(nextGap.equation, equationString);

      // Generate new tile options including the correct answer
      const newTileValues = this.problemGenerator.generateTileOptions(
        nextGap.equation.answer,
        GAME_CONSTANTS.TILE_COUNT
      );
      this.currentTileValues = newTileValues;
      this.hudController.setTileValues(newTileValues);
    } else {
      this.currentGap = null;
    }
  }

  // State machine callbacks
  public loadAssets(): void {
    const loadingScreen = document.getElementById('loading-screen')!;
    const progressFill = document.getElementById('progress-fill')!;
    const loadingText = document.getElementById('loading-text')!;

    this.assetLoader.setOnProgress((progress: number) => {
      progressFill.style.width = `${progress}%`;
      loadingText.textContent = `Loading... ${Math.floor(progress)}%`;
    });

    this.assetLoader.setOnComplete(() => {
      loadingScreen.classList.add('hidden');
      this.stateMachine.setState('MENU');
    });

    this.assetLoader.load();
  }

  public showMainMenu(): void {
    this.menuOverlay.showMainMenu();
  }

  public hideMainMenu(): void {
    this.menuOverlay.clear();
  }

  public showLevelSelect(): void {
    const levels = this.levelManager.getAllLevels();
    this.menuOverlay.showLevelSelect(levels, this.progressManager);
  }

  public startLevel(): void {
    const levelConfig = this.levelManager.getCurrentLevel();
    if (!levelConfig) {
      console.error('No level loaded');
      return;
    }

    // Initialize gameplay objects
    this.character = new Character(levelConfig.speed);
    this.sceneManager.mainScene.add(this.character.mesh);

    this.pathGenerator = new PathGenerator(this.sceneManager.mainScene, levelConfig);
    this.problemGenerator = new ProblemGenerator(levelConfig.target);

    this.cameraController = new CameraController(
      this.sceneManager.mainCamera,
      this.character
    );

    this.hudController = new HUDController(
      this.sceneManager.hudScene,
      this.sceneManager.hudCamera
    );

    // Update scene theme
    this.sceneManager.updateTheme(levelConfig.theme.skyColor);

    // Reset counters
    this.gapsCompleted = 0;

    // Start countdown
    this.stateMachine.setState('COUNTDOWN');
  }

  public startCountdown(): void {
    let count = 3;
    this.menuOverlay.showCountdown(count);

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        this.menuOverlay.showCountdown(count);
      } else {
        this.menuOverlay.showCountdown(0); // Show "GO!"
        setTimeout(() => {
          this.menuOverlay.clear();
          this.stateMachine.setState('PLAYING');
          this.advanceToNextGap(); // Start the first gap
        }, 500);
        clearInterval(interval);
      }
    }, 1000);
  }

  public updateGameplay(dt: number): void {
    if (!this.character || !this.pathGenerator || !this.cameraController) return;

    // Update character
    this.character.update(dt);

    // Update path
    this.pathGenerator.update(this.character.getZ());

    // Update camera
    this.cameraController.update();

    // Check for collision with current gap
    if (this.currentGap && !this.currentGap.isFilled) {
      if (this.currentGap.isBehind(this.character.getZ())) {
        // Character reached gap without filling it - game over!
        this.character.fall();
        setTimeout(() => {
          this.stateMachine.setState('GAME_OVER');
        }, 1000);
      }
    }

    // Check for level completion
    if (this.pathGenerator.hasReachedEnd() && this.character) {
      const allGaps = this.pathGenerator.getAllGaps();
      const allFilled = allGaps.every((gap) => gap.isFilled);
      const characterPastAllGaps = allGaps.every((gap) =>
        gap.isBehind(this.character!.getZ())
      );

      if (allFilled && characterPastAllGaps) {
        this.completeLevel();
      }
    }
  }

  private completeLevel(): void {
    const score = this.levelManager.calculateScore();
    const levelId = this.levelManager.getCurrentLevelId();

    // Save progress
    this.progressManager.setLevelScore(levelId, score);

    // Unlock next level
    const nextLevelId = this.levelManager.getNextLevelId();
    if (nextLevelId) {
      this.progressManager.unlockLevel(nextLevelId);
    }

    this.stateMachine.setState('LEVEL_COMPLETE');
  }

  public cleanupLevel(): void {
    if (this.character) {
      this.sceneManager.mainScene.remove(this.character.mesh);
      this.character = null;
    }

    if (this.pathGenerator) {
      this.pathGenerator.dispose();
      this.pathGenerator = null;
    }

    if (this.hudController) {
      this.hudController.dispose();
      this.hudController = null;
    }

    this.cameraController = null;
    this.currentGap = null;
    this.currentTileValues = [];
  }

  public showGameOver(): void {
    this.menuOverlay.showGameOver();
  }

  public hideGameOver(): void {
    this.menuOverlay.clear();
  }

  public showLevelComplete(): void {
    const score = this.levelManager.calculateScore();
    this.menuOverlay.showLevelComplete(score);
  }

  public hideLevelComplete(): void {
    this.menuOverlay.clear();
  }

  // Main game loop
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

    // Render
    this.render();
  };

  private fixedUpdate(dt: number): void {
    this.stateMachine.update(dt);
    this.inputHandler.update();
  }

  private render(): void {
    this.sceneManager.render();
  }
}
