import * as THREE from 'three';
import { Character } from '../entities/Character';
import { GAME_CONSTANTS } from '../config/constants';
import { lerp } from '../utils/helpers';

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private character: Character;
  private targetPosition: THREE.Vector3;

  constructor(camera: THREE.PerspectiveCamera, character: Character) {
    this.camera = camera;
    this.character = character;
    this.targetPosition = new THREE.Vector3();
    this.updateTargetPosition();
  }

  private updateTargetPosition(): void {
    // Position camera behind and above the character
    this.targetPosition.set(
      this.character.position.x,
      this.character.position.y + GAME_CONSTANTS.CAMERA_OFFSET_Y,
      this.character.position.z + GAME_CONSTANTS.CAMERA_OFFSET_Z
    );
  }

  public update(): void {
    this.updateTargetPosition();

    // Smooth camera follow using lerp
    this.camera.position.x = lerp(
      this.camera.position.x,
      this.targetPosition.x,
      GAME_CONSTANTS.CAMERA_FOLLOW_SMOOTHNESS
    );
    this.camera.position.y = lerp(
      this.camera.position.y,
      this.targetPosition.y,
      GAME_CONSTANTS.CAMERA_FOLLOW_SMOOTHNESS
    );
    this.camera.position.z = lerp(
      this.camera.position.z,
      this.targetPosition.z,
      GAME_CONSTANTS.CAMERA_FOLLOW_SMOOTHNESS
    );

    // Look at a point ahead of the character
    const lookAtPoint = new THREE.Vector3(
      this.character.position.x,
      this.character.position.y + 2,
      this.character.position.z + 10
    );
    this.camera.lookAt(lookAtPoint);
  }
}
