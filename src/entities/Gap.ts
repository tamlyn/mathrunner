import * as THREE from 'three';
import { Equation } from '../types';
import { GAME_CONSTANTS } from '../config/constants';

export class Gap {
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
    this.slot = this.createSlot();
    this.mesh.add(this.slot);
    this.mesh.position.z = worldZ;
  }

  private createSlot(): THREE.Mesh {
    // Create glowing outline effect for empty slot
    const slotGeometry = new THREE.BoxGeometry(
      GAME_CONSTANTS.GAP_WIDTH,
      GAME_CONSTANTS.PATH_HEIGHT,
      GAME_CONSTANTS.GAP_WIDTH
    );
    const slotMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.3,
      wireframe: true,
    });
    const slot = new THREE.Mesh(slotGeometry, slotMaterial);
    slot.position.y = GAME_CONSTANTS.PATH_HEIGHT / 2;
    return slot;
  }

  public fill(_answerValue: number): void {
    this.isFilled = true;

    // Create filled block
    const blockGeometry = new THREE.BoxGeometry(
      GAME_CONSTANTS.GAP_WIDTH * 0.9,
      GAME_CONSTANTS.PATH_HEIGHT,
      GAME_CONSTANTS.GAP_WIDTH * 0.9
    );
    const blockMaterial = new THREE.MeshStandardMaterial({
      color: 0x4ECDC4,
      roughness: 0.3,
      metalness: 0.1,
    });
    this.filledBlock = new THREE.Mesh(blockGeometry, blockMaterial);
    this.filledBlock.position.y = GAME_CONSTANTS.PATH_HEIGHT / 2;
    this.mesh.add(this.filledBlock);

    // Hide slot visual
    this.slot.visible = false;
  }

  public checkAnswer(answer: number): boolean {
    return answer === this.equation.answer;
  }

  public isInRange(characterZ: number, range: number): boolean {
    return Math.abs(this.worldZ - characterZ) < range;
  }

  public isBehind(characterZ: number): boolean {
    return this.worldZ < characterZ - GAME_CONSTANTS.GAP_SAFE_DISTANCE;
  }

  public dispose(): void {
    this.mesh.removeFromParent();
    this.slot.geometry.dispose();
    (this.slot.material as THREE.Material).dispose();
    if (this.filledBlock) {
      this.filledBlock.geometry.dispose();
      (this.filledBlock.material as THREE.Material).dispose();
    }
  }
}
