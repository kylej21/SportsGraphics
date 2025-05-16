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
let shotDirection = new THREE.Vector3();

let lastMoveX = 3;
let lastMoveZ = 3;
let charge = 0;
let isMoving = false;
let isCharging = false;
let chargeStartTime = 0;
let chargeDuration = 0;
let hasTakenFirstShot = false;
const holeTarget = new THREE.Vector3(3.0427, 0.07, 1.01);

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
    keyStates[event.key] = true;
    if (event.key === 'r') {
      camera.position.set(ball.position.x + 1, ball.position.y + 1, ball.position.z);
      camera.lookAt(ball.position);
    }
    if (event.key === ' '){
      if(!isMoving){
        isCharging = true;
        chargeStartTime = clock.getElapsedTime();
      }
    }
    charge += 1;
  });

    document.addEventListener('keyup', (event) => {
    keyStates[event.key] = false;
    if (event.key === ' '){
      if(!isMoving){
        isCharging = false;
        chargeDuration = clock.getElapsedTime() - chargeStartTime;
        fireBall(charge);
        hasTakenFirstShot = true;
      }
      charge = 0;
    }
  });

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7.5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
}
function fireBall(chargeDuration) {
  console.log("charge duration: ", chargeDuration);
  const chargePower = Math.min(chargeDuration / 100, 1); // Normalized power (0 to 1)

  // Get camera's forward direction
  camera.getWorldDirection(shotDirection);

  shotDirection.y = 0;
  shotDirection.normalize(); 

  const force = shotDirection.multiplyScalar(chargePower * 0.7); 
  ball.velocity = force;
  lastMoveX = ball.position.x;
  lastMoveZ = ball.position.z;
  console.log("Fired ball with charge power:", chargePower);
}
//console.log(hole.pole.position.x, hole.pole.position.y, hole.pole.position.z);
function moveCameraToBall() {
  if (ball) {
    const directionToHole = new THREE.Vector3().subVectors(holeTarget, ball.position).normalize();
    
    const cameraDistance = 1.5; // Distance behind the ball (adjust as needed)
    const offset = directionToHole.multiplyScalar(-cameraDistance); 

    camera.position.copy(ball.position).add(offset); 
    camera.position.y = 1.1; 

    camera.lookAt(holeTarget);
    if (controls) {
      controls.target.copy(holeTarget); 
      controls.update(); 
    }
  }
}

function inBounds(pointx, pointz){
  //console.log(pointx, pointz);
  if ((pointx > 3.3741 || pointx < .55069)){
    return 'x';
  }
  if ((pointz > 3.39891 || pointz < .48429)){
    return 'z';
  }
  //(pointx > 1.440625 && pointx < 3.3741)
  //(pointz < 2.53084 && pointz > .9257)
  if ((pointx > 1.440625 && pointx < 3.3741) && (pointz < 2.53084 && pointz > 1.42)){
      let minZ = 0;
      let diffX = Math.abs(pointx - 1.440625)
      let diffZ1 = Math.abs(pointz-2.53084)
      let diffZ2 = Math.abs(pointz - 0.9257)
      minZ = Math.min(diffZ1, diffZ2);
      if (minZ < diffX){
        return 'z';
      }
      return 'x';
  }
  return 'n';
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
function checkWin(ptX, ptZ){
  let dist = Math.sqrt((ptX-3)**2 + (ptZ-1)**2)
  console.log(dist);
  if (dist < 0.08){
    return true;
  }
  return false;
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
  const currentY = camera.position.y;
    hazelnutTrees.forEach(tree => tree.visible = true);
  
  const cameraPos = camera.position;
  const ballPos = ball.position;
  const pathVector = new THREE.Vector3().subVectors(ballPos, cameraPos);
  const pathLength = pathVector.length();
  if (pathLength > 0.1) { 
    hazelnutTrees.forEach(tree => {
      const treePos = tree.getWorldPosition(new THREE.Vector3());
      const treeToCamera = new THREE.Vector3().subVectors(treePos, cameraPos);
      
      const projection = treeToCamera.dot(pathVector) / pathLength;
      if (projection >= -0.5 && projection <= pathLength + 0.2) { //adjust if you want more/less restrictive tree hiding behind camera or ball
        const closestPoint = cameraPos.clone()
          .add(pathVector.clone().multiplyScalar(projection/pathLength));
        const distanceToPath = closestPoint.distanceTo(treePos);
        
        const effectiveRadius = 2.5 * (1 + treePos.y/3); //make this value higher to make the zone you hide trees in larger
        if (distanceToPath < effectiveRadius) {
          tree.visible = false;
        }
      }
    });
  }

    if (ball && ball.velocity && Number.isFinite(ball.velocity.x) &&
        Number.isFinite(ball.velocity.y) &&
        Number.isFinite(ball.velocity.z)) {

      ball.position.add(ball.velocity);
      ball.position.y = 0.07
      ball.velocity.multiplyScalar(0.97);
      let char = inBounds(ball.position.x, ball.position.z);
      if (char != 'n') {
        // Reflect velocity: simple bounce
        if (char == 'x'){
          ball.velocity.x *= -0.8;
        }
        if (char == 'z'){
          ball.velocity.z *= -0.8;
        }
        // Push the ball slightly back toward the valid area
        const backstep = ball.velocity.clone().normalize().multiplyScalar(0.05);
        ball.position.add(backstep);
      }
      if (ball.velocity.length() < 0.001) {
        ball.velocity.set(0, 0, 0);

        if (isMoving) {
          isMoving = false;
          if (checkWin(ball.position.x, ball.position.z)){
            const overlay = document.getElementById('splash-overlay');
            overlay.style.display = 'block';  // Show splash screen
            splashVisible = true;
          }
          moveCameraToBall();  // << Move camera when ball stops
        }
      } else {
        isMoving = true;
      }

    } else {
      if (ball && ball.velocity) {
        ball.velocity.set(0, 0, 0);
        isMoving = false;
      }
    }

    let movementDirection;
    if (keyStates.ArrowUp) {
      //console.log(camera.position.x, camera.position.z);
      //if( camera.position.x - speed > -width )
        camera.position.x -= speed;
        movementDirection = 'x';
    }
    if (keyStates.ArrowDown) {
      //console.log(camera.position.x, camera.position.z);
      //if( camera.position.x + speed < width )
        camera.position.x += speed;
        movementDirection = 'x';
    }
    if (keyStates.ArrowLeft) {
      //console.log(camera.position.x, camera.position.z);
      //if( camera.position.z + speed < height )
        camera.position.z += speed;
        movementDirection = 'z';
    }
    if (keyStates.ArrowRight) {
      //console.log(camera.position.x, camera.position.z);
      //if( camera.position.z - speed > -height )
        camera.position.z -= speed;
        movementDirection = 'z';
    }
    const cameraToCenter = new THREE.Vector3().subVectors(camera.position, domeCenter);
    const distanceToCenter = cameraToCenter.length();

    //domeRadius = Math.max(bounds.width, bounds.height) * 1.1;
    //console.log("OLD values", currentX, currentZ);
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
