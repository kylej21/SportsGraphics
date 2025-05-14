// main.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import holes from './holes/index.js';
import { loadLevel } from './levelparser.js';
import Ball from './models/Ball.js';
import { generateHazelnuts, addGroundPlane, SkyDome, getCourseTileCenters } from './worldbuilder.js';
import RoughField from './models/RoughField.js';

let camera, scene, renderer, controls, ball;
const clock = new THREE.Clock();
let splashVisible = true;
let hole = holes.hole1;
const keyStates = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
}
let domeRadius, domeCenter, bounds, startPosition;
let hazelnutTrees = []

init();

function init() {
  setupScene();
  loadAndStartLevel('hole1');
  setupLevelButtons();
  animate();
}

function setupScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0d0ff);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

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
}

function loadAndStartLevel(holeKey) {
  hole = holes[holeKey];
  if (!hole) {
    console.error(`Hole '${holeKey}' not found.`);
    return;
  }

  // Clear scene except lights
  scene.children = scene.children.filter(child => child.type === 'AmbientLight' || child.type === 'DirectionalLight');

  const { startPosition, bounds } = loadLevel(hole, scene);
  const courseTileArray = getCourseTileCenters(hole);
  domeRadius = Math.max(bounds.width, bounds.height) * 1.1;
  domeCenter = new THREE.Vector3(bounds.width / 2 - 0.5, 0, bounds.height / 2 - 0.5);
  const tileCount = courseTileArray.length / 2;

  camera.position.set(3, 3, 3);
  camera.lookAt(bounds.width / 2, 0, bounds.width / 2);

  addGroundPlane(scene, bounds);
  scene.add(SkyDome(bounds));
  scene.add(RoughField(bounds, courseTileArray, tileCount, Math.max(bounds.width, bounds.height) * 1.1));

  const loader = new OBJLoader();
  loader.load('/Hazelnut.obj', (object) => {
    const hazelnut = object;
    //scene.add(generateHazelnuts(hazelnut, Math.max(bounds.width, bounds.height) * 1.1, courseTileArray));

    const domeRadius = Math.max(bounds.width, bounds.height) * 1.1;
    const treeGroup = generateHazelnuts(hazelnut, domeRadius, courseTileArray);
    scene.add(treeGroup);

    treeGroup.traverse((child) => {
      if (child.isMesh ) {
        if( child.name.includes('tree') || child.name.includes('leaf') || child.name.includes('leaves') ) {
        hazelnutTrees.push(child);
      }
    }
    });
    
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

  const overlay = document.getElementById('splash-overlay');
  // Keep overlay visible until user selects a level
  splashVisible = true;
}

function setupLevelButtons() {
  document.querySelectorAll('.level-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const holeKey = btn.getAttribute('data-level');
      loadAndStartLevel(holeKey);
      const overlay = document.getElementById('splash-overlay');
      overlay.style.display = 'none';
      splashVisible = false;
    });
  });
}

function animate() {
  requestAnimationFrame(animate); 
  const elapsed = clock.getElapsedTime();

    const speed = 0.08;
    const currentX = camera.position.x;
    const currentY = camera.position.y;
    const currentZ = camera.position.z;
    let movementDirection;
    if (keyStates.ArrowUp) {
      console.log(camera.position.x, camera.position.z);
      //if( camera.position.x - speed > -width )
        camera.position.x -= speed;
        movementDirection = 'x';
    }
    if (keyStates.ArrowDown) {
      console.log(camera.position.x, camera.position.z);
      //if( camera.position.x + speed < width )
        camera.position.x += speed;
        movementDirection = 'x';
    }
    if (keyStates.ArrowLeft) {
      console.log(camera.position.x, camera.position.z);
      //if( camera.position.z + speed < height )
        camera.position.z += speed;
        movementDirection = 'z';
    }
    if (keyStates.ArrowRight) {
      console.log(camera.position.x, camera.position.z);
      //if( camera.position.z - speed > -height )
        camera.position.z -= speed;
        movementDirection = 'z';
    }
    const cameraToCenter = new THREE.Vector3().subVectors(camera.position, domeCenter);
    const distanceToCenter = cameraToCenter.length();

    //domeRadius = Math.max(bounds.width, bounds.height) * 1.1;
    console.log("OLD values", currentX, currentZ);
    if( distanceToCenter > domeRadius ) {
      cameraToCenter.normalize().multiplyScalar(domeRadius);
      camera.position.copy(domeCenter).add(cameraToCenter);
      camera.position.y = currentY;
    }
    camera.position.y = Math.max(0.5, camera.position.y);

  scene.traverse((child) => {
     const mat = child.material;
     if (mat?.uniforms?.time) {
       mat.uniforms.time.value = clock.getElapsedTime();
     }
    if (child.material?.uniforms?.time) {
      child.material.uniforms.time.value = elapsed;
    }
  });

  if (!splashVisible) {
    controls.update();
  }

  renderer.render(scene, camera);
}
