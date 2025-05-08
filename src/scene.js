import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// scene
export const scene = new THREE.Scene();
const loader = new THREE.TextureLoader();
loader.load('/th.jpeg', function(texture) { // can change this background. Keeping as placeholder code
    scene.background = texture;
  });

// lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);


// camera
export const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-5, 5, 10);
camera.lookAt(0, 1, -5)

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