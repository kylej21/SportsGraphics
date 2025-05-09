import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createLighting } from './lighting.js';

// scene
export const scene = new THREE.Scene();
/*const loader = new THREE.TextureLoader();
loader.load('/court.jpeg', function(texture) { // can change this background. Keeping as placeholder code
    scene.background = texture;
  });
*/
scene.background = new THREE.Color(0x000000);

// camera
export const camera = new THREE.PerspectiveCamera(75, window.innerHeight/window.innerWidth, 0.3, 1000);

camera.position.set(0, 2.2, 0.5); 
camera.lookAt(0, 2.1, -1);

// renderer 
export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// orbit controls for testing
export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;     
controls.dampingFactor = 0.05;
controls.target.set(0, 1, -5);    
controls.update();

createLighting(scene);
