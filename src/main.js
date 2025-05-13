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

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

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
  const tileCount = courseTileArray.length / 2;

  camera.position.set(3, 3, 3);
  camera.lookAt(bounds.width / 2, 0, bounds.width / 2);

  addGroundPlane(scene, bounds);
  scene.add(SkyDome(bounds));
  scene.add(RoughField(bounds, courseTileArray, tileCount, Math.max(bounds.width, bounds.height) * 1.1));

  const loader = new OBJLoader();
  loader.load('/Hazelnut.obj', (object) => {
    const hazelnut = object;
    scene.add(generateHazelnuts(hazelnut, Math.max(bounds.width, bounds.height) * 1.1, courseTileArray));

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

  scene.traverse((child) => {
    if (child.material?.uniforms?.time) {
      child.material.uniforms.time.value = elapsed;
    }
  });

  if (!splashVisible) {
    controls.update();
  }

  renderer.render(scene, camera);
}
