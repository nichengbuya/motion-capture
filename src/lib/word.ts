import * as THREE from 'three';
import { OrbitControls, TransformControls } from 'three/examples/jsm/Addons.js';

class ThreeManager {
  private static instance: ThreeManager;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private animationFunctions: Array<() => void> = [];
  public transformControls: TransformControls;
  private container: HTMLElement | null = null;

  private constructor() {
    // Initialize the scene, camera, and renderer
    const camera = this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(100, 200, 300);

    const scene = this.scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);
    scene.fog = new THREE.Fog(0xa0a0a0, 200, 1000);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 5);
    hemiLight.position.set(0, 200, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 5);
    dirLight.position.set(0, 200, 100);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 180;
    dirLight.shadow.camera.bottom = -100;
    dirLight.shadow.camera.left = -120;
    dirLight.shadow.camera.right = 120;
    scene.add(dirLight);

    // scene.add(new THREE.CameraHelper(dirLight.shadow.camera));

    // ground
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);

    const renderer = this.renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 100, 0);
    controls.update();

    const control = this.transformControls = new TransformControls(camera, renderer.domElement);
    control.addEventListener('dragging-changed', function (event) {
      controls.enabled = !event.value;
    });
    scene.add(control.getHelper());

    window.addEventListener('resize', this.onWindowResize);

    this.animate = this.animate.bind(this);
  }

  public static getInstance(): ThreeManager {
    if (!ThreeManager.instance) {
      ThreeManager.instance = new ThreeManager();
    }

    return ThreeManager.instance;
  }

  public addAnimationFunction(func: () => void) {
    this.animationFunctions.push(func);
  }

  public removeAnimationFunction(func: () => void) {
    const index = this.animationFunctions.indexOf(func);
    if (index !== -1) {
      this.animationFunctions.splice(index, 1);
    }
  }

  // Mount the renderer to an external DOM element
  public mountRenderer(domElement: HTMLElement) {
    this.container = domElement;
    domElement.appendChild(this.renderer.domElement);
    this.onWindowResize();
  }

  // Unmount the renderer from an external DOM element
  public unmountRenderer(domElement: HTMLElement) {
    domElement.removeChild(this.renderer.domElement);
    this.container = null;
  }

  public onWindowResize = () => {
    if (this.container) {
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
    }
  }

  public animate() {
    requestAnimationFrame(() => this.animate());
    for (const func of this.animationFunctions) {
      func();
    }
    this.renderer.render(this.scene, this.camera);
  }

  public dispose(): void {
    // Remove event listeners
    window.removeEventListener('resize', this.onWindowResize);
    
    // Dispose the TransformControls
    this.transformControls.dispose();
    
    // Dispose all objects in the scene
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
    });
    
    // Dispose the renderer
    this.renderer.dispose();
    
    // If the renderer is mounted to the DOM, unmount it
    if (this.container) {
      this.unmountRenderer(this.container);
    }
  }
}

export default ThreeManager;