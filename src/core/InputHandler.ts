export class InputHandler {
  private element: HTMLElement;
  private clickCallbacks: Array<(x: number, y: number) => void> = [];
  private keyCallbacks: Map<string, () => void> = new Map();

  constructor(element: HTMLElement) {
    this.element = element;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Mouse events
    this.element.addEventListener('click', this.handleClick.bind(this));

    // Touch events
    this.element.addEventListener('touchend', this.handleTouch.bind(this), {
      passive: false,
    });

    // Keyboard events
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handleClick(event: MouseEvent): void {
    const rect = this.element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.notifyClickCallbacks(x, y);
  }

  private handleTouch(event: TouchEvent): void {
    event.preventDefault();
    if (event.changedTouches.length > 0) {
      const touch = event.changedTouches[0];
      const rect = this.element.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      this.notifyClickCallbacks(x, y);
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const callback = this.keyCallbacks.get(event.key);
    if (callback) {
      callback();
    }
  }

  private notifyClickCallbacks(x: number, y: number): void {
    this.clickCallbacks.forEach((callback) => callback(x, y));
  }

  public onClick(callback: (x: number, y: number) => void): void {
    this.clickCallbacks.push(callback);
  }

  public onKey(key: string, callback: () => void): void {
    this.keyCallbacks.set(key, callback);
  }

  public removeClickCallback(callback: (x: number, y: number) => void): void {
    const index = this.clickCallbacks.indexOf(callback);
    if (index > -1) {
      this.clickCallbacks.splice(index, 1);
    }
  }

  public removeKeyCallback(key: string): void {
    this.keyCallbacks.delete(key);
  }

  public update(): void {
    // Reserved for future input polling if needed
  }

  public dispose(): void {
    this.element.removeEventListener('click', this.handleClick.bind(this));
    this.element.removeEventListener('touchend', this.handleTouch.bind(this));
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }
}
