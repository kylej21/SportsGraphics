import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import hole1 from './holes/hole1.js';
import hole2 from './holes/hole2.js';
import { loadLevel } from './levelparser.js';
import Ball from './models/Ball.js';
import {generateHazelnuts, addGroundPlane , SkyDome, getCourseTileCenters} from './worldbuilder.js';
import RoughField from './models/RoughField.js';

let camera, scene, renderer, controls;
let ball;
const clock = new THREE.Clock();
const keyStates = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
}

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

  document.addEventListener('keydown', (event) => {
    if (event.key === 'r') {
      camera.position.set(ball.position.x + 1, ball.position.y + 1, ball.position.z);
      camera.lookAt(ball.position);
    }
  });

  document.addEventListener('keydown', (event) => keyStates[event.key] = true);
  document.addEventListener('keyup', (event) => keyStates[event.key] = false);

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
  const domeRadius = Math.max(bounds.width, bounds.height) * 1.1;
  scene.add(SkyDome(bounds));
  scene.add(RoughField(bounds, courseTileArray, tileCount, domeRadius));

  const loader = new OBJLoader();
  loader.load('/Hazelnut.obj', (object) => {
    const hazelnut = object;
    scene.add(generateHazelnuts(hazelnut, domeRadius, courseTileArray));
    
    hazelnut.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  });

  if (!startPosition) {
    console.error('No start position found in level data');
    return;
  }
  ball = new Ball(startPosition);
  scene.add(ball);
  controls = new OrbitControls(camera, renderer.domElement);
  if( ball !== undefined ) {
    controls.target.copy( ball.position );
  }
  controls.enableDamping = true;
  controls.saveState();

  camera.position.set(ball.position.x + 1, ball.position.y+1, ball.position.z);
  camera.lookAt(ball.position);

  
}



function animate() {
  requestAnimationFrame(animate);
  scene.traverse((child) => {
     const mat = child.material;
     if (mat?.uniforms?.time) {
       mat.uniforms.time.value = clock.getElapsedTime();
     }
    if (child.material?.uniforms?.time) {
      child.material.uniforms.time.value = clock.getElapsedTime();
    }
    const speed = 0.0005;
    const dir = new THREE.Vector3();
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    const right = new THREE.Vector3().crossVectors( cameraDirection, camera.up ).normalize();

    if (keyStates.ArrowUp) camera.position.x -= speed;
    if (keyStates.ArrowDown) camera.position.x += speed;
    if (keyStates.ArrowLeft) camera.position.z += speed;
    if (keyStates.ArrowRight) camera.position.z -= speed;
    controls.target.copy(ball.position);
    controls.update();
  });




  //controls.update();
  renderer.render(scene, camera);
}

