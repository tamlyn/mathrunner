import * as THREE from 'three';
import { Gap } from '../entities/Gap';
import { LevelConfig } from '../types';
import { ProblemGenerator } from './ProblemGenerator';
import { GAME_CONSTANTS } from '../config/constants';
import { generateId } from '../utils/helpers';

class PathSegmentEntity {
  public id: string;
  public mesh: THREE.Mesh;
  public startZ: number;
  public endZ: number;
  public gap: Gap | null = null;

  constructor(startZ: number, hasGap: boolean, problemGenerator: ProblemGenerator, pathColor: number) {
    this.id = generateId();
    this.startZ = startZ;
    this.endZ = startZ + GAME_CONSTANTS.SEGMENT_LENGTH;

    this.mesh = this.createMesh(pathColor);
    this.mesh.position.z = startZ + GAME_CONSTANTS.SEGMENT_LENGTH / 2;

    if (hasGap) {
      const equation = problemGenerator.generateEquation();
      const gapZ = startZ + GAME_CONSTANTS.SEGMENT_LENGTH / 2;
      this.gap = new Gap(gapZ, equation);
    }
  }

  private createMesh(pathColor: number): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(
      GAME_CONSTANTS.SEGMENT_WIDTH,
      GAME_CONSTANTS.PATH_HEIGHT,
      GAME_CONSTANTS.SEGMENT_LENGTH
    );
    const material = new THREE.MeshStandardMaterial({
      color: pathColor,
      roughness: 0.7,
      metalness: 0.2,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 0;
    return mesh;
  }

  public dispose(): void {
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
    this.mesh.removeFromParent();
    if (this.gap) {
      this.gap.dispose();
    }
  }
}

export class PathGenerator {
  private scene: THREE.Scene;
  private segments: PathSegmentEntity[] = [];
  private gaps: Gap[] = [];
  private problemGenerator: ProblemGenerator;
  private levelConfig: LevelConfig;
  private segmentsCreated: number = 0;

  constructor(scene: THREE.Scene, levelConfig: LevelConfig) {
    this.scene = scene;
    this.levelConfig = levelConfig;
    this.problemGenerator = new ProblemGenerator(levelConfig.target);
  }

  public update(characterZ: number): void {
    // Spawn new segments ahead
    const lastSegmentEnd = this.getLastSegmentEnd();
    while (lastSegmentEnd < characterZ + GAME_CONSTANTS.SPAWN_DISTANCE) {
      if (this.segmentsCreated < this.levelConfig.segmentCount * 2) {
        this.spawnNextSegment();
      } else {
        break;
      }
    }

    // Despawn old segments behind
    this.segments = this.segments.filter((segment) => {
      if (segment.endZ < characterZ - GAME_CONSTANTS.DESPAWN_DISTANCE) {
        segment.dispose();
        return false;
      }
      return true;
    });

    // Update gaps list
    this.gaps = this.segments
      .map((s) => s.gap)
      .filter((g): g is Gap => g !== null);
  }

  private spawnNextSegment(): void {
    const startZ = this.getLastSegmentEnd();

    // Determine if this segment should have a gap
    const shouldHaveGap =
      this.segmentsCreated > 3 && // Give some warmup distance
      Math.random() < this.levelConfig.gapFrequency / 2;

    const segment = new PathSegmentEntity(
      startZ,
      shouldHaveGap,
      this.problemGenerator,
      this.levelConfig.theme.pathColor
    );

    this.scene.add(segment.mesh);
    if (segment.gap) {
      this.scene.add(segment.gap.mesh);
    }

    this.segments.push(segment);
    this.segmentsCreated++;
  }

  private getLastSegmentEnd(): number {
    if (this.segments.length === 0) {
      return 0;
    }
    return this.segments[this.segments.length - 1].endZ;
  }

  public getNextUnfilledGap(characterZ: number): Gap | null {
    for (const gap of this.gaps) {
      if (!gap.isFilled && gap.worldZ > characterZ) {
        return gap;
      }
    }
    return null;
  }

  public getAllGaps(): Gap[] {
    return this.gaps;
  }

  public hasReachedEnd(): boolean {
    return this.segmentsCreated >= this.levelConfig.segmentCount;
  }

  public reset(): void {
    this.segments.forEach((segment) => segment.dispose());
    this.segments = [];
    this.gaps = [];
    this.segmentsCreated = 0;
  }

  public dispose(): void {
    this.reset();
  }
}
