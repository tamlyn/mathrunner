import * as THREE from 'three';
import { GAME_CONSTANTS } from '../config/constants';

export class SceneManager {
  public mainScene: THREE.Scene;
  public hudScene: THREE.Scene;
  public mainCamera: THREE.PerspectiveCamera;
  public hudCamera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;

  constructor(renderer: THREE.WebGLRenderer) {
    this.renderer = renderer;
    this.mainScene = new THREE.Scene();
    this.hudScene = new THREE.Scene();

    this.mainCamera = this.setupMainCamera();
    this.hudCamera = this.setupHUDCamera();

    this.setupMainScene();
    this.setupHUDScene();
    this.setupResizeHandler();
  }

  private setupMainCamera(): THREE.PerspectiveCamera {
    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.PerspectiveCamera(
      GAME_CONSTANTS.CAMERA_FOV,
      aspect,
      0.1,
      1000
    );

    // Position for isometric-like view
    camera.position.set(10, 12, 10);
    camera.lookAt(0, 0, 0);

    return camera;
  }

  private setupHUDCamera(): THREE.OrthographicCamera {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 10;
    const camera = new THREE.OrthographicCamera(
      (-frustumSize * aspect) / 2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      100
    );
    camera.position.z = 10;
    return camera;
  }

  private setupMainScene(): void {
    this.mainScene.background = new THREE.Color(0x87CEEB);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.mainScene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    this.mainScene.add(directionalLight);

    // Fog for depth
    this.mainScene.fog = new THREE.Fog(0x87CEEB, 50, 100);
  }

  private setupHUDScene(): void {
    // HUD scene doesn't need background (transparent)
    const hudLight = new THREE.AmbientLight(0xffffff, 1);
    this.hudScene.add(hudLight);
  }

  private setupResizeHandler(): void {
    window.addEventListener('resize', this.onResize.bind(this));
  }

  public onResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;

    this.mainCamera.aspect = aspect;
    this.mainCamera.updateProjectionMatrix();

    const frustumSize = 10;
    this.hudCamera.left = (-frustumSize * aspect) / 2;
    this.hudCamera.right = (frustumSize * aspect) / 2;
    this.hudCamera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  public render(): void {
    // Clear and render main scene
    this.renderer.autoClear = true;
    this.renderer.render(this.mainScene, this.mainCamera);

    // Render HUD scene on top (no clear)
    this.renderer.autoClear = false;
    this.renderer.clearDepth();
    this.renderer.render(this.hudScene, this.hudCamera);
    this.renderer.autoClear = true;
  }

  public updateTheme(skyColor: number): void {
    this.mainScene.background = new THREE.Color(skyColor);
    if (this.mainScene.fog) {
      (this.mainScene.fog as THREE.Fog).color = new THREE.Color(skyColor);
    }
  }

  public dispose(): void {
    window.removeEventListener('resize', this.onResize.bind(this));
  }
}
