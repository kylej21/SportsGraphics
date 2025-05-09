import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Hoop {
  constructor(scene, onLoad = () => {}) {
    const loader = new GLTFLoader();

    loader.load('/basket_ball.glb', (gltf) => {
      const hoopMesh = gltf.scene.getObjectByName('BasktBallBasket_Optimized');

      if (!hoopMesh) {
        console.warn('Hoop mesh not found in GLB');
        return;
      }

      hoopMesh.position.set(0, 3.5, -5);
      this.mesh = hoopMesh;
      scene.add(this.mesh);
      onLoad(this.mesh);
    }, undefined, (error) => {
      console.error('Error loading hoop model:', error);
    });
  }
}
