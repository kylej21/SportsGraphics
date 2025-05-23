import * as THREE from 'three';
import * as Wall from './models/Wall.js';
import Ground from './models/Ground';
import Hole from './models/Hole';

export function loadLevel(levelData, scene) {
  const tileSize = 1;
  let startPosition = null;
  let holeLocation = null;
  const wallMeshes = [];

  const width = levelData[0].length;
  const height = levelData.length;

  levelData.forEach((row, z) => {
    row.forEach((cell, x) => {
      const position = new THREE.Vector3(x * tileSize, 0, z * tileSize);

      if (cell === '0' || cell === 'X' || cell === 'S') {
        if (cell === 'X') {
          scene.add(Hole(position));
          holeLocation = position;
        } else if (cell === 'S') {
          startPosition = position.clone();
          scene.add(Ground(position));
        } else {
          scene.add(Ground(position));
        }
      }

      else if (/^[LRTB]+$/.test(cell)) {
        const wallGroup = Wall.createWallsFromString(position, cell);
        wallGroup.traverse((child) => {
          if (child.isMesh) wallMeshes.push(child);
        });
        scene.add(wallGroup);
      }

      else if (cell === 'C') {
        const neighbors = {
          left: levelData[z][x - 1],
          right: levelData[z][x + 1],
          top: z > 0 ? levelData[z - 1][x] : null,
          bottom: z < height - 1 ? levelData[z + 1][x] : null
        };

        let corners = [];

        if (neighbors.right && neighbors.bottom) {
          corners.push(new THREE.Vector3(0.45, 0.1, 0.45));
        }
        if (neighbors.left && neighbors.bottom) {
          corners.push(new THREE.Vector3(-0.45, 0.1, 0.45));
        }
        if (neighbors.left && neighbors.top) {
          corners.push(new THREE.Vector3(-0.45, 0.1, -0.45));
        }
        if (neighbors.right && neighbors.top) {
          corners.push(new THREE.Vector3(0.45, 0.1, -0.45));
        }

        for (const offset of corners) {
          const corner = Wall.WallCorner(new THREE.Vector3(
            position.x + offset.x,
            offset.y,
            position.z + offset.z
          ));
          wallMeshes.push(corner);
          scene.add(corner);
        }
      }
    });
  });

  const bounds = {
    width: width * tileSize,
    height: height * tileSize,
  };

  return {
    startPosition,
    bounds,
    holeLocation,
    wallMeshes
  };
}
