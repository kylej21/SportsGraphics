import * as THREE from 'three';
import * as Wall from './models/Wall.js';
import Ground from './models/Ground';
import Hole from './models/Hole';

export function loadLevel(levelData, scene) {
  const tileSize = 1;
  let startPosition = null;
  const width = levelData[0].length;
  const height = levelData.length;

  levelData.forEach((row, z) => {
    row.forEach((cell, x) => {
      const position = new THREE.Vector3(x * tileSize, 0, z * tileSize);

      if (cell === '0' || cell === 'X' || cell === 'S') {
        scene.add(Ground(position));
        if (cell === 'X') {
          scene.add(Hole(position));
        } else if (cell === 'S') {
          startPosition = position.clone();
        }
      } else if (/^[LRTB]+$/.test(cell)) {
        scene.add(Wall.createWallsFromString(position, cell));
      } else if (cell === 'C') {
        const neighbors = {
          left: levelData[z][x - 1],
          right: levelData[z][x + 1],
          top: z > 0 ? levelData[z - 1][x] : null,
          bottom: z < height - 1 ? levelData[z + 1][x] : null
        };
        let corners = []
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
        scene.add(corner);
        }
      }
    });
  });

  const bounds = {
    width: width * tileSize,
    height: height * tileSize,
  };

  return { startPosition, bounds };
}
