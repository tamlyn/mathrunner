import * as THREE from 'three';
import { GAME_CONSTANTS } from '../config/constants';

export class NumberTile {
  public mesh: THREE.Group;
  private value: number;
  private textSprite: THREE.Sprite;
  private blockMesh: THREE.Mesh;
  private isAnimating: boolean = false;

  constructor(value: number) {
    this.value = value;
    this.mesh = new THREE.Group();
    this.blockMesh = this.createBlockMesh();
    this.textSprite = this.createTextSprite();

    this.mesh.add(this.blockMesh);
    this.mesh.add(this.textSprite);
  }

  private createBlockMesh(): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(1.4, 1.4, 0.4);
    const material = new THREE.MeshStandardMaterial({
      color: 0x4ECDC4,
      roughness: 0.3,
      metalness: 0.1,
    });
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
  }

  private createTextSprite(): THREE.Sprite {
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
    return sprite;
  }

  public setValue(value: number): void {
    this.value = value;
    this.updateTextSprite();
  }

  private updateTextSprite(): void {
    // Re-create the sprite with new value
    const oldSprite = this.textSprite;
    this.textSprite = this.createTextSprite();
    this.mesh.remove(oldSprite);
    oldSprite.material.dispose();
    this.mesh.add(this.textSprite);
  }

  public getValue(): number {
    return this.value;
  }

  public animateSelection(onComplete: () => void): void {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const startTime = Date.now();
    const duration = GAME_CONSTANTS.TILE_SELECTION_SCALE_DURATION;
    const startScale = { ...this.mesh.scale };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease in back
      const t = progress;
      const c1 = 1.70158;
      const c3 = c1 + 1;
      const eased = c3 * t * t * t - c1 * t * t;

      this.mesh.scale.set(
        startScale.x * (1 - eased),
        startScale.y * (1 - eased),
        startScale.z * (1 - eased)
      );

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete();
        this.isAnimating = false;
      }
    };

    animate();
  }

  public animateReplacement(newValue: number): void {
    this.setValue(newValue);
    const startY = GAME_CONSTANTS.TILE_Y_POSITION - 3;
    const targetY = 0;

    this.mesh.position.y = startY;
    this.mesh.scale.set(1, 1, 1);

    const startTime = Date.now();
    const duration = 300;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out back
      const t = progress;
      const c1 = 1.70158;
      const c3 = c1 + 1;
      const eased = 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);

      this.mesh.position.y = startY + (targetY - startY) * eased;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  public reset(): void {
    this.mesh.scale.set(1, 1, 1);
    this.mesh.position.y = 0;
    this.isAnimating = false;
  }

  public dispose(): void {
    this.blockMesh.geometry.dispose();
    (this.blockMesh.material as THREE.Material).dispose();
    this.textSprite.material.dispose();
    this.mesh.removeFromParent();
  }
}
