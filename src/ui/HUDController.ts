import * as THREE from 'three';
import { NumberTile } from './NumberTile';
import { Equation } from '../types';
import { GAME_CONSTANTS } from '../config/constants';

export class HUDController {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private numberTiles: NumberTile[] = [];
  private equationText: THREE.Sprite | null = null;

  constructor(scene: THREE.Scene, camera: THREE.OrthographicCamera) {
    this.scene = scene;
    this.camera = camera;
    this.createNumberTiles();
  }

  private createNumberTiles(): void {
    const startX =
      -((GAME_CONSTANTS.TILE_COUNT - 1) * GAME_CONSTANTS.TILE_SPACING) / 2;

    for (let i = 0; i < GAME_CONSTANTS.TILE_COUNT; i++) {
      const tile = new NumberTile(0);
      tile.mesh.position.set(
        startX + i * GAME_CONSTANTS.TILE_SPACING,
        GAME_CONSTANTS.TILE_Y_POSITION,
        0
      );
      this.numberTiles.push(tile);
      this.scene.add(tile.mesh);
    }
  }

  private createEquationSprite(text: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.font = 'bold 64px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw outline
    ctx.strokeText(text, 256, 64);
    // Draw fill
    ctx.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(8, 2, 1);
    sprite.position.set(0, GAME_CONSTANTS.EQUATION_Y_POSITION, 0);
    return sprite;
  }

  public setEquation(_equation: Equation, equationString: string): void {
    // Remove old equation sprite
    if (this.equationText) {
      this.equationText.material.dispose();
      this.scene.remove(this.equationText);
    }

    // Create new equation sprite
    this.equationText = this.createEquationSprite(equationString);
    this.scene.add(this.equationText);
  }

  public setTileValues(values: number[]): void {
    values.forEach((value, index) => {
      if (index < this.numberTiles.length) {
        this.numberTiles[index].setValue(value);
        this.numberTiles[index].reset();
      }
    });
  }

  public getTileAtScreenPosition(screenX: number, screenY: number): number {
    const hudX = (screenX / window.innerWidth) * 2 - 1;
    const hudY = -(screenY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(hudX, hudY), this.camera);

    for (let i = 0; i < this.numberTiles.length; i++) {
      const intersects = raycaster.intersectObject(
        this.numberTiles[i].mesh,
        true
      );
      if (intersects.length > 0) {
        return i;
      }
    }

    return -1;
  }

  public selectTile(index: number, onComplete: () => void): number | null {
    if (index < 0 || index >= this.numberTiles.length) {
      return null;
    }

    const tile = this.numberTiles[index];
    const value = tile.getValue();

    // Animate tile selection
    tile.animateSelection(onComplete);

    return value;
  }

  public replaceTile(index: number, newValue: number): void {
    if (index < 0 || index >= this.numberTiles.length) {
      return;
    }

    this.numberTiles[index].animateReplacement(newValue);
  }

  public hideEquation(): void {
    if (this.equationText) {
      this.equationText.visible = false;
    }
  }

  public showEquation(): void {
    if (this.equationText) {
      this.equationText.visible = true;
    }
  }

  public hide(): void {
    this.numberTiles.forEach((tile) => (tile.mesh.visible = false));
    this.hideEquation();
  }

  public show(): void {
    this.numberTiles.forEach((tile) => (tile.mesh.visible = true));
    this.showEquation();
  }

  public dispose(): void {
    this.numberTiles.forEach((tile) => tile.dispose());
    if (this.equationText) {
      this.equationText.material.dispose();
      this.scene.remove(this.equationText);
    }
  }
}
