import { StateMachine } from './StateMachine';

// Forward declaration for Game class
interface IGame {
  loadAssets(): void;
  showMainMenu(): void;
  hideMainMenu(): void;
  showLevelSelect(): void;
  startLevel(): void;
  updateGameplay(dt: number): void;
  cleanupLevel(): void;
  showGameOver(): void;
  hideGameOver(): void;
  showLevelComplete(): void;
  hideLevelComplete(): void;
  startCountdown(): void;
}

export class GameStateMachine extends StateMachine {
  constructor(game: IGame) {
    super();

    this.addState({
      name: 'BOOT',
      onEnter: () => {
        game.loadAssets();
      },
    });

    this.addState({
      name: 'MENU',
      onEnter: () => {
        game.showMainMenu();
      },
      onExit: () => {
        game.hideMainMenu();
      },
    });

    this.addState({
      name: 'LEVEL_SELECT',
      onEnter: () => {
        game.showLevelSelect();
      },
    });

    this.addState({
      name: 'LOADING',
      onEnter: () => {
        game.startLevel();
      },
    });

    this.addState({
      name: 'COUNTDOWN',
      onEnter: () => {
        game.startCountdown();
      },
    });

    this.addState({
      name: 'PLAYING',
      onUpdate: (dt) => {
        game.updateGameplay(dt);
      },
      onExit: () => {
        game.cleanupLevel();
      },
    });

    this.addState({
      name: 'GAME_OVER',
      onEnter: () => {
        game.showGameOver();
      },
      onExit: () => {
        game.hideGameOver();
      },
    });

    this.addState({
      name: 'LEVEL_COMPLETE',
      onEnter: () => {
        game.showLevelComplete();
      },
      onExit: () => {
        game.hideLevelComplete();
      },
    });

    // Start in BOOT state
    this.setState('BOOT');
  }
}
