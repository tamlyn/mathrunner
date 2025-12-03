import { LevelConfig } from '../types';
import { ProgressManager } from '../core/ProgressManager';

export class MenuOverlay {
  private container: HTMLElement;
  private onPlayCallback?: () => void;
  private onLevelSelectCallback?: (levelId: number) => void;
  private onRestartCallback?: () => void;
  private onMenuCallback?: () => void;
  private onNextLevelCallback?: () => void;

  constructor() {
    this.container = document.getElementById('menu-container')!;
  }

  public showMainMenu(): void {
    this.clear();
    const menu = document.createElement('div');
    menu.className = 'menu';
    menu.innerHTML = `
      <h1>Math Runner</h1>
      <button class="menu-button" id="play-button">Play</button>
    `;
    this.container.appendChild(menu);

    document.getElementById('play-button')!.addEventListener('click', () => {
      if (this.onPlayCallback) {
        this.onPlayCallback();
      }
    });
  }

  public showLevelSelect(
    levels: LevelConfig[],
    progressManager: ProgressManager
  ): void {
    this.clear();
    const menu = document.createElement('div');
    menu.className = 'menu';

    const title = document.createElement('h1');
    title.textContent = 'Select Level';
    menu.appendChild(title);

    const levelGrid = document.createElement('div');
    levelGrid.className = 'level-grid';

    levels.forEach((level) => {
      const isUnlocked = progressManager.isLevelUnlocked(level.id);
      const card = document.createElement('div');
      card.className = `level-card ${isUnlocked ? '' : 'locked'}`;

      const score = progressManager.getLevelScore(level.id);
      card.innerHTML = `
        <h3>Level ${level.id}</h3>
        <p>${level.name}</p>
        ${score > 0 ? `<p>Score: ${score}</p>` : ''}
      `;

      if (isUnlocked) {
        card.addEventListener('click', () => {
          if (this.onLevelSelectCallback) {
            this.onLevelSelectCallback(level.id);
          }
        });
      }

      levelGrid.appendChild(card);
    });

    menu.appendChild(levelGrid);

    const backButton = document.createElement('button');
    backButton.className = 'menu-button';
    backButton.textContent = 'Back';
    backButton.addEventListener('click', () => {
      if (this.onMenuCallback) {
        this.onMenuCallback();
      }
    });
    menu.appendChild(backButton);

    this.container.appendChild(menu);
  }

  public showGameOver(): void {
    this.clear();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <h2>Game Over</h2>
      <p>You fell! Try again?</p>
      <div class="modal-buttons">
        <button class="menu-button" id="restart-button">Retry</button>
        <button class="menu-button" id="menu-button">Menu</button>
      </div>
    `;

    this.container.appendChild(overlay);
    this.container.appendChild(modal);

    document.getElementById('restart-button')!.addEventListener('click', () => {
      if (this.onRestartCallback) {
        this.onRestartCallback();
      }
    });

    document.getElementById('menu-button')!.addEventListener('click', () => {
      if (this.onMenuCallback) {
        this.onMenuCallback();
      }
    });
  }

  public showLevelComplete(score: number): void {
    this.clear();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <h2>Level Complete!</h2>
      <p>Score: ${score}</p>
      <div class="modal-buttons">
        <button class="menu-button" id="next-button">Next Level</button>
        <button class="menu-button" id="menu-button">Menu</button>
      </div>
    `;

    this.container.appendChild(overlay);
    this.container.appendChild(modal);

    document.getElementById('next-button')!.addEventListener('click', () => {
      if (this.onNextLevelCallback) {
        this.onNextLevelCallback();
      }
    });

    document.getElementById('menu-button')!.addEventListener('click', () => {
      if (this.onMenuCallback) {
        this.onMenuCallback();
      }
    });
  }

  public showCountdown(count: number): void {
    this.clear();
    const countdown = document.createElement('div');
    countdown.className = 'menu';
    countdown.innerHTML = `
      <h1 style="font-size: 120px;">${count > 0 ? count : 'GO!'}</h1>
    `;
    this.container.appendChild(countdown);
  }

  public clear(): void {
    this.container.innerHTML = '';
  }

  public onPlay(callback: () => void): void {
    this.onPlayCallback = callback;
  }

  public onLevelSelect(callback: (levelId: number) => void): void {
    this.onLevelSelectCallback = callback;
  }

  public onRestart(callback: () => void): void {
    this.onRestartCallback = callback;
  }

  public onMenu(callback: () => void): void {
    this.onMenuCallback = callback;
  }

  public onNextLevel(callback: () => void): void {
    this.onNextLevelCallback = callback;
  }
}
