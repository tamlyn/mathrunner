import * as THREE from 'three';
import { GAME_CONSTANTS } from '../config/constants';

export class Character {
  public mesh: THREE.Group;
  public position: THREE.Vector3;
  private speed: number;
  private isFalling: boolean = false;
  private fallStartTime: number = 0;

  constructor(speed: number = GAME_CONSTANTS.CHARACTER_SPEED_BASE) {
    this.speed = speed;
    this.position = new THREE.Vector3(0, GAME_CONSTANTS.CHARACTER_HEIGHT, 0);
    this.mesh = this.createMesh();
  }

  private createMesh(): THREE.Group {
    const group = new THREE.Group();

    // Simple character placeholder (capsule-like)
    const bodyGeometry = new THREE.BoxGeometry(0.6, 1.2, 0.4);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x4ECDC4,
      roughness: 0.5,
      metalness: 0.1,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6;
    group.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFD93D,
      roughness: 0.5,
      metalness: 0.1,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.5;
    group.add(head);

    group.position.copy(this.position);
    return group;
  }

  public update(dt: number): void {
    if (this.isFalling) {
      this.updateFalling(dt);
    } else {
      // Move forward
      this.position.z += this.speed * dt;
      this.mesh.position.copy(this.position);

      // Add subtle bobbing animation
      const bobAmount = Math.sin(Date.now() * 0.01) * 0.05;
      this.mesh.position.y = this.position.y + bobAmount;
    }
  }

  private updateFalling(dt: number): void {
    const elapsedTime = Date.now() - this.fallStartTime;
    const fallProgress = Math.min(elapsedTime / GAME_CONSTANTS.FALLING_DURATION, 1);

    // Fall down and rotate
    this.mesh.position.y = this.position.y - fallProgress * 10;
    this.mesh.rotation.x = fallProgress * Math.PI;

    // Optionally move forward slightly while falling
    this.position.z += this.speed * dt * 0.5;
    this.mesh.position.z = this.position.z;
  }

  public fall(): void {
    if (!this.isFalling) {
      this.isFalling = true;
      this.fallStartTime = Date.now();
    }
  }

  public reset(startZ: number = 0): void {
    this.isFalling = false;
    this.position.set(0, GAME_CONSTANTS.CHARACTER_HEIGHT, startZ);
    this.mesh.position.copy(this.position);
    this.mesh.rotation.set(0, 0, 0);
  }

  public setSpeed(speed: number): void {
    this.speed = speed;
  }

  public getZ(): number {
    return this.position.z;
  }

  public isCurrentlyFalling(): boolean {
    return this.isFalling;
  }
}
