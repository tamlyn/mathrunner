import * as THREE from 'three';

export class AssetLoader {
  private loadingManager: THREE.LoadingManager;
  private onProgressCallback?: (progress: number) => void;
  private onCompleteCallback?: () => void;

  constructor() {
    this.loadingManager = new THREE.LoadingManager();
    this.setupLoadingManager();
  }

  private setupLoadingManager(): void {
    this.loadingManager.onProgress = (_url, itemsLoaded, itemsTotal) => {
      const progress = (itemsLoaded / itemsTotal) * 100;
      if (this.onProgressCallback) {
        this.onProgressCallback(progress);
      }
    };

    this.loadingManager.onLoad = () => {
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
      }
    };

    this.loadingManager.onError = (url) => {
      console.error(`Error loading ${url}`);
    };
  }

  public setOnProgress(callback: (progress: number) => void): void {
    this.onProgressCallback = callback;
  }

  public setOnComplete(callback: () => void): void {
    this.onCompleteCallback = callback;
  }

  public async load(): Promise<void> {
    return new Promise((resolve) => {
      // For now, we'll just simulate loading since we don't have actual assets
      // In a real implementation, this would load GLB models, textures, etc.

      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (this.onProgressCallback) {
          this.onProgressCallback(progress);
        }

        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            if (this.onCompleteCallback) {
              this.onCompleteCallback();
            }
            resolve();
          }, 100);
        }
      }, 100);
    });
  }

  public getLoadingManager(): THREE.LoadingManager {
    return this.loadingManager;
  }
}
