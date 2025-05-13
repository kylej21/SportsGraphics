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
      switch (cell) {
        case '0':
          scene.add(Ground(position));
          break;
        case 'X':
          scene.add(Ground(position));
          scene.add(Hole(position));
          break;
        case 'S':
          scene.add(Ground(position));
          startPosition = position.clone();
          break;
        case 'VL':
          scene.add(Wall.WallVL(position));
          break;
        case 'VR':
          scene.add(Wall.WallVR(position));
          break;
        case 'HT':
          scene.add(Wall.WallHT(position));
          break;
        case 'HB':
          scene.add(Wall.WallHB(position));
          break;
        case 'LU':
          scene.add(Wall.WallLU(position));
          break;
        case 'RU':
          scene.add(Wall.WallRU(position));
          break;
        case 'UU':
          scene.add(Wall.WallUU(position));
          break;
        case 'DU':
          scene.add(Wall.WallDU(position));
          break;
        case 'TB':
          scene.add(Wall.WallTB(position));
          break;
        case 'LB':
          scene.add(Wall.WallLB(position));
          break;
        case 'RB':
          scene.add(Wall.WallRB(position));
          break;
        case 'LR':
          scene.add(Wall.WallLR(position));
          break;
        case 'C': {
          const neighbors = {
            left: levelData[z][x - 1],
            right: levelData[z][x + 1],
            top: z > 0 ? levelData[z - 1][x] : null,
            bottom: z < height - 1 ? levelData[z + 1][x] : null
          };

          const offset = new THREE.Vector3(0, 0, 0);
          if (neighbors.right && neighbors.bottom) {
            offset.set(0.45, 0.1, 0.45); 
          } else if (neighbors.left && neighbors.bottom) {
            offset.set(-0.45, 0.1, 0.45);
          } else if (neighbors.left && neighbors.top) {
            offset.set(-0.45, 0.1, -0.45); 
          } else if (neighbors.right && neighbors.top) {
            offset.set(0.45, 0.1, -0.45); 
          } else {
            offset.set(0, 0.1, 0);
          }

          const corner = Wall.WallCorner(new THREE.Vector3(
            position.x + offset.x,
            offset.y,
            position.z + offset.z
          ));
          scene.add(corner);
          break;
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

