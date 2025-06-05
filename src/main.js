// main.js
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import holes from "./holes/index.js";
import { loadLevel } from "./levelparser.js";
import Ball from "./models/Ball.js";
import Arrow from "./models/Arrow.js";
import {
  generateHazelnuts,
  addGroundPlane,
  SkyDome,
  getCourseTileCenters,
} from "./worldbuilder.js";
import RoughField from "./models/RoughField.js";

let camera, scene, renderer, controls, ball;
const clock = new THREE.Clock();
let splashVisible = true;
let hole; //= holes.hole1;
const keyStates = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};
let domeRadius, domeCenter, bounds, startPosition;
let hazelnutTrees = [];
let shotDirection = new THREE.Vector3();

let lastMoveX = 3;
let lastMoveZ = 3;
let isMoving = false;
let isCharging = false;
let chargeStartTime = 0;
let chargeDuration = 0;
let hasTakenFirstShot = false;
let holeTarget = new THREE.Vector3(3.0427, 0.07, 1.01);
let wallMeshes = [];
let chargingArrow = null;
let startX, startZ, boundX, boundZ;
let outOfBounds = false;
let tiles;

let hitSound, finishSound;

let levelComplete = false;

init();

function init() {
  setupScene();
  chargingArrow = new Arrow();
  loadAndStartLevel("hole1");
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
    1000,
  );

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const listener = new THREE.AudioListener();
  camera.add(listener);

  hitSound = new THREE.Audio(listener);
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/sounds/hit.mp3", (buffer) => {
    hitSound.setBuffer(buffer);
    hitSound.setVolume(0.5);
  });

  finishSound = new THREE.Audio(listener);
  audioLoader.load("/sounds/holedone.mp3", (buffer) => {
    finishSound.setBuffer(buffer);
    finishSound.setVolume(0.5);
  });

  document.addEventListener("keydown", (event) => {
    keyStates[event.key] = true;
    if (event.key === "r") {
      panToStart();
    }
    if (event.key === " " && !isMoving && !isCharging) {
      isCharging = true;
      chargeStartTime = performance.now();
    }
  });

  document.addEventListener("keyup", (event) => {
    keyStates[event.key] = false;
     if (event.key === " " && !isMoving) {
    isCharging = false;
    const chargeDuration = (performance.now() - chargeStartTime) / 1000;
    fireBall(chargeDuration);
    hasTakenFirstShot = true;
    if (chargingArrow) {
      chargingArrow.hide();
    }
  }
  });

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7.5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  const ui = document.createElement("div");
  ui.id = "game-ui";
  ui.style.position = "fixed";
  ui.style.top = "20px";
  ui.style.left = "20px";
  ui.style.right = "20px";
  ui.style.display = "flex";
  ui.style.justifyContent = "space-between";
  ui.style.zIndex = "1000";
  ui.innerHTML = `
    <button id="menu-button" style="padding: 0.5rem 1rem; font-weight: bold; border-radius: 8px; background: #ff4757; color: white; border: none; cursor: pointer;">Main Menu</button>
    <div id="stroke-counter" style="padding: 0.5rem 1rem; font-weight: bold; background: rgba(255, 255, 255, 0.85); border-radius: 8px; color: #2f3542;">Par: 0</div>
  `;
  document.body.appendChild(ui);

  document.getElementById("menu-button").addEventListener("click", () => {
    const splash = document.getElementById("splash-overlay");
    if (splash) splash.style.display = "flex";
    splashVisible = true;
  });
}

function fireBall(chargeDuration) {
    hitSound.play();
  console.log("charge duration",chargeDuration);
  const maxChargeTime = 2;
  const clampedDuration = Math.min(chargeDuration, maxChargeTime);
  const chargePower = Math.pow(clampedDuration / maxChargeTime, 1.25);

  camera.getWorldDirection(shotDirection);
  shotDirection.y = 0;
  shotDirection.normalize();


  const baseForce = 0.15;
  const force = shotDirection.multiplyScalar(chargePower * baseForce);
  console.log("force", force)
  ball.velocity = force.clone();

  lastMoveX = ball.position.x;
  lastMoveZ = ball.position.z;

  window.strokes = (window.strokes || 0) + 1;
  const counter = document.getElementById("stroke-counter");
  if (counter) counter.textContent = `Par: ${window.strokes}`;
}
//console.log(hole.pole.position.x, hole.pole.position.y, hole.pole.position.z);
function moveCameraToBall() {
  if (ball) {
    const directionToHole = new THREE.Vector3()
      .subVectors(holeTarget, ball.position)
      .normalize();

    const cameraDistance = 1.5; 
    const offset = directionToHole.multiplyScalar(-cameraDistance); 
    const newCameraPosition = ball.position.clone().add(offset);

    camera.position.lerp(newCameraPosition, 0.03); 
    camera.position.y = 1.1; 

    //camera.lookAt(holeTarget);
      controls.target.copy(ball.position);
      controls.update();
  }
}

function panToStart() {
  if (ball) {
    const directionToHole = new THREE.Vector3()
      .subVectors(holeTarget, ball.position)
      .normalize();

    const cameraDistance = 1.5; 
    const offset = directionToHole.multiplyScalar(-cameraDistance); 
    const newCameraPosition = ball.position.clone().add(offset);

    camera.position.copy(newCameraPosition);
    camera.position.y = ball.position.y + 1.1; // Adjust height to be above the ball

    //camera.lookAt(holeTarget);
      controls.target.copy(ball.position);
      controls.update();
  }
}

/*function inBounds(pointx, pointz){
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
}*/

function collidesWithWall(ball) {
  const ballBB = new THREE.Box3().setFromCenterAndSize(
    ball.position.clone(),
    new THREE.Vector3(0.03, 0.03, 0.03),
  );

  for (let wall of wallMeshes) {
    const wallBB = new THREE.Box3().setFromObject(wall);
    if (ballBB.intersectsBox(wallBB)) {
      const ballCenter = ballBB.getCenter(new THREE.Vector3());
      const wallCenter = wallBB.getCenter(new THREE.Vector3());
      const dx = ballCenter.x - wallCenter.x;
      const dz = ballCenter.z - wallCenter.z;

      const overlapX =
        (ballBB.max.x - ballBB.min.x) / 2 +
        (wallBB.max.x - wallBB.min.x) / 2 -
        Math.abs(dx);
      const overlapZ =
        (ballBB.max.z - wallBB.min.z) / 2 +
        (wallBB.max.z - wallBB.min.z) / 2 -
        Math.abs(dz);

      if (overlapX < overlapZ) {
        return new THREE.Vector3(Math.sign(dx), 0, 0);
      } else {
        return new THREE.Vector3(0, 0, Math.sign(dz));
      }
    }
  }

  return null;
}

function loadAndStartLevel(holeKey) {
  levelComplete = false;
  window.strokes = 0;
  const counter = document.getElementById("stroke-counter");
  if (counter) counter.textContent = "Par: 0";
  if (holeKey === "custom") {
    if (!window.customlevel) {
      console.warn("No custom level set. Defaulting to hole1.");
      holeKey = "hole1";
      return;
    }
    else{
      hole = window.customlevel;
    }
    
  } 
  else{    
    hole = holes[holeKey];
    if (!hole) {
      console.error(`Hole '${holeKey}' not found.`);
      return;
    }
  }
  

  // Clear scene except lights
  scene.children = scene.children.filter(
    (child) =>
      child.type === "AmbientLight" || child.type === "DirectionalLight",
  );
  const {
    startPosition,
    bounds,
    holeLocation,
    wallMeshes: levelWalls,
  } = loadLevel(hole, scene);
    wallMeshes = levelWalls;

    // For each wall, nudge its vertices along the proper axis so overlapping faces no longer share depth ──
  const EPSILON = 0.005; 

  wallMeshes.forEach((wall) => {
    if (!wall.geometry) return;

    wall.updateMatrixWorld();
    const box = new THREE.Box3().setFromObject(wall);
    const size = new THREE.Vector3();
    box.getSize(size);

    let faceNormal = new THREE.Vector3();
    if (size.x > size.z) {
      faceNormal.set(0, 0, 1);
    } else {
      faceNormal.set(1, 0, 0);
    }

    const geom = wall.geometry.clone();

    if (!geom.attributes.normal) {
      geom.computeVertexNormals();
    }

    const posAttr = geom.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i),
        vy = posAttr.getY(i),
        vz = posAttr.getZ(i);

      posAttr.setXYZ(
        i,
        vx + faceNormal.x * EPSILON,
        vy + faceNormal.y * EPSILON,
        vz + faceNormal.z * EPSILON
      );
    }
    posAttr.needsUpdate = true;

    wall.geometry = geom;

    if (wall.material) {
      wall.material = wall.material.clone();
      wall.material.polygonOffset = true;
      wall.material.polygonOffsetFactor = 1;
      wall.material.polygonOffsetUnits = 1;
      wall.material.needsUpdate = true;
    }
  });

  holeTarget = new THREE.Vector3(holeLocation.x, 0, holeLocation.z);
  const courseTileArray = getCourseTileCenters(hole);
  domeRadius = Math.max(bounds.width, bounds.height) * 1.1;
  domeCenter = new THREE.Vector3(
    bounds.width / 2 - 0.5,
    0,
    bounds.height / 2 - 0.5,
  );
  const tileCount = courseTileArray.length / 2;
  tiles = courseTileArray;
  boundX = bounds.width;
  boundZ = bounds.height;

  camera.position.set(3, 3, 3);
  camera.lookAt(bounds.width / 2, 0, bounds.width / 2);

  addGroundPlane(scene, bounds);
  scene.add(SkyDome(bounds));
  scene.add(
    RoughField(
      bounds,
      courseTileArray,
      tileCount,
      Math.max(bounds.width, bounds.height) * 1.1,
    ),
  );

  const loader = new OBJLoader();
  loader.load("/Hazelnut.obj", (object) => {
    const hazelnut = object;
    //scene.add(generateHazelnuts(hazelnut, Math.max(bounds.width, bounds.height) * 1.1, courseTileArray));

    const domeRadius = Math.max(bounds.width, bounds.height) * 1.1;
    const treeGroup = generateHazelnuts(hazelnut, domeRadius, courseTileArray);
    scene.add(treeGroup);

    treeGroup.traverse((child) => {
      if (child.isMesh) {
        if (
          child.name.includes("tree") ||
          child.name.includes("leaf") ||
          child.name.includes("leaves")
        ) {
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
    console.error("No start position found in level data");
    return;
  }
  startX = startPosition.x;
  startZ = startPosition.z;
  ball = new Ball(startPosition);
  scene.add(ball);
  
  if (chargingArrow) {
    chargingArrow.addToScene(scene);
  }
  
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;

  if (ball !== undefined) {
    controls.target.copy(ball.position);
  }
  controls.enableDamping = true;
  controls.saveState();

  panToStart();

  const overlay = document.getElementById("splash-overlay");
  // Keep overlay visible until user selects a level
  splashVisible = true;
}
function checkWin(ptX, ptZ, ballY = 0.07) {
  const holeRadius = 0.08;
  const dist = Math.sqrt((ptX - holeTarget.x) ** 2 + (ptZ - holeTarget.z) ** 2);
  
  if (dist < holeRadius && ballY < 0.06) {
    return true;
  }
  return false;
}
function setupLevelButtons() {
  document.querySelectorAll(".level-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const holeKey = btn.getAttribute("data-level");
      loadAndStartLevel(holeKey);
      const overlay = document.getElementById("splash-overlay");
      overlay.style.display = "none";
      splashVisible = false;
    });
  });
}
function isOverHole(ballPos) {
  const holeRadius = 0.08;
  const dist = Math.sqrt((ballPos.x - holeTarget.x) ** 2 + (ballPos.z - holeTarget.z) ** 2);
  return dist < holeRadius;
}
function isOutofBounds( x, z ) {
  const halfSize = 0.55;
  for( let i = 0; i < tiles.length; i += 2 ) {
    const tileX = tiles[i];
    const tileZ = tiles[i + 1];
    const dx = Math.abs( x - tileX );
    const dz = Math.abs( z - tileZ );
    if( dx < halfSize && dz < halfSize ) {
      return false; 
    }
  }
  return true;
}

function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();

  if (chargingArrow) {
    chargingArrow.update(isCharging, ball, camera, chargeStartTime);
  }

  const speed = 0.04;
  const currentY = camera.position.y;
  hazelnutTrees.forEach((tree) => (tree.visible = true));

  const cameraPos = camera.position;
  const ballPos = ball.position;
  const pathVector = new THREE.Vector3().subVectors(ballPos, cameraPos);
  const pathLength = pathVector.length();

  if (pathLength > 0.1) {
    hazelnutTrees.forEach((tree) => {
      const treePos = tree.getWorldPosition(new THREE.Vector3());
      const treeToCamera = new THREE.Vector3().subVectors(treePos, cameraPos);

      const projection = treeToCamera.dot(pathVector) / pathLength;
      if (projection >= -0.5 && projection <= pathLength + 0.2) {
        //adjust if you want more/less restrictive tree hiding behind camera or ball
        const closestPoint = cameraPos
          .clone()
          .add(pathVector.clone().multiplyScalar(projection / pathLength));
        const distanceToPath = closestPoint.distanceTo(treePos);

        const effectiveRadius = 2.5 * (1 + treePos.y / 3); //make this value higher to make the zone you hide trees in larger
        if (distanceToPath < effectiveRadius) {
          tree.visible = false;
        }
      }
    });
  }

    if (ball && ball.velocity && Number.isFinite(ball.velocity.x) &&
        Number.isFinite(ball.velocity.y) &&
        Number.isFinite(ball.velocity.z)) {
      
      console.log( "x:", ball.position.x, "z:", ball.position.z);
      //if( ball.position.x < -0.5 || ball.position.x > 4.5 || ball.position.z < -0.5 || ball.position.z > 4.5 ) {
      if( isOutofBounds(ball.position.x, ball.position.z) ) {
        console.log( "Ball out of bounds (", ball.position.x, ",", ball.position.z, "), resetting position");
        ball.velocity.set(0, 0, 0);
        isMoving = false;
        ball.position.set(startX, 0.07, startZ);
        panToStart();
      }
      if( isMoving ) {
        moveCameraToBall(); 
        controls.enabled = false;
        controls.update();
      }
      else {
        controls.enabled = true;
        controls.update();
      }
      ball.position.add(ball.velocity);
      
      const overHole = isOverHole(ball.position);
      
      if (overHole) {
        const holeDepth = 0.05;
        const fallRate = 0.005;
        
        if (ball.position.y > (0.07 - holeDepth)) {
          ball.position.y -= fallRate;
          ball.velocity.multiplyScalar(0.95);
          
          const holeDirection = new THREE.Vector3()
            .subVectors(holeTarget, ball.position)
            .normalize()
            .multiplyScalar(0.002);
          ball.velocity.add(holeDirection);
        } else {
          ball.position.y = 0.07 - holeDepth;
          ball.velocity.set(0, 0, 0);
          isMoving = false;
          
          if (!levelComplete && checkWin(ball.position.x, ball.position.z, ball.position.y)) {
            finishSound.play();
            levelComplete = true;
            setTimeout(() => {
              const overlay = document.getElementById('splash-overlay');
              overlay.style.display = 'flex';
              splashVisible = true;

            }, 500); 
            return;
          }
        }
      } else {
        // Ball is not over hole - normal ground physics
        ball.position.y = 0.07; // Keep ball at ground level
        ball.velocity.multiplyScalar(0.99); // Normal friction
      }
      
      // Wall collision detection (unchanged)
      const normal = collidesWithWall(ball);
      if (normal) {
        const velocityDot = ball.velocity.dot(normal);
        const reflected = ball.velocity.clone().sub(normal.multiplyScalar(2 * velocityDot)).multiplyScalar(0.8);
        ball.velocity.copy(reflected);
        
        if (reflected.length() < 0.01) {
          reflected.set(0, 0, 0); 
        }
        const backstep = reflected.clone().normalize().multiplyScalar(0.08);
        ball.position.add(backstep);
      }
      
      // Check if ball has stopped moving
      if (ball.velocity.length() < 0.001) {
        ball.velocity.set(0, 0, 0);
        
        if (isMoving) {
          isMoving = false;
          // Only check win if ball is actually in the hole (not just stopped near it)
          if (overHole && ball.position.y < 0.05) {
            if (checkWin(ball.position.x, ball.position.z, ball.position.y)) {
              const overlay = document.getElementById('splash-overlay');
              overlay.style.display = 'flex';
              splashVisible = true;
            }
          }
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
    movementDirection = "x";
  }
  if (keyStates.ArrowDown) {
    //console.log(camera.position.x, camera.position.z);
    //if( camera.position.x + speed < width )
    camera.position.x += speed;
    movementDirection = "x";
  }
  if (keyStates.ArrowLeft) {
    //console.log(camera.position.x, camera.position.z);
    //if( camera.position.z + speed < height )
    camera.position.z += speed;
    movementDirection = "z";
  }
  if (keyStates.ArrowRight) {
    //console.log(camera.position.x, camera.position.z);
    //if( camera.position.z - speed > -height )
    camera.position.z -= speed;
    movementDirection = "z";
  }
  const cameraToCenter = new THREE.Vector3().subVectors(
    camera.position,
    domeCenter,
  );
  const distanceToCenter = cameraToCenter.length();

    //domeRadius = Math.max(bounds.width, bounds.height) * 1.1;
    //console.log("OLD values", currentX, currentZ);
    if( distanceToCenter > domeRadius ) {
      cameraToCenter.normalize().multiplyScalar(domeRadius);
      camera.position.copy(domeCenter).add(cameraToCenter);
      camera.position.y = currentY;
    }
    camera.position.y = Math.max(0.5, camera.position.y);
    camera.position.y = Math.min(5, camera.position.y);

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
    if( isMoving ) {
      controls.enabled = false;
      controls.target.copy(ball.position);
      controls.update();
    }
    else{
      controls.enabled = true;
      controls.update();
    }
  }
  renderer.render(scene, camera);
}

window.loadAndStartLevel = loadAndStartLevel;
window.setupLevelButtons = setupLevelButtons;