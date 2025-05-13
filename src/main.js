import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import hole1 from './holes/hole1.js';
import { loadLevel } from './levelparser.js';
import Ball from './models/Ball.js';
import { addGroundPlane , SkyDome, getCourseTileCenters} from './worldbuilder.js';
import RoughField from './models/RoughField.js';

let camera, scene, renderer, controls;
let ball;
const clock = new THREE.Clock();

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0d0ff);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(5, 7, 10);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7.5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  const { startPosition, bounds } = loadLevel(hole1, scene);
  const courseTileArray = getCourseTileCenters(hole1);
  const tileCount = courseTileArray.length / 2;

  addGroundPlane(scene, bounds);
  scene.add(RoughField(bounds, courseTileArray, tileCount));
  scene.add(SkyDome(bounds));

  if (!startPosition) {
    console.error('No start position found in level data');
    return;
  }
  ball = new Ball(startPosition);
  scene.add(ball);

  
}



function animate() {
  requestAnimationFrame(animate);
  scene.traverse((child) => {
  const mat = child.material;
  if (mat?.uniforms?.time) {
    mat.uniforms.time.value = clock.getElapsedTime();
  }
});




  controls.update();
  renderer.render(scene, camera);
}

