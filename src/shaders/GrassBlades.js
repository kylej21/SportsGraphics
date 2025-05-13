import * as THREE from 'three';

export default function GrassShaderMaterial(courseTileData, tileCount) {
  return new THREE.ShaderMaterial({
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldPosition;

      uniform float time;
      attribute float offset;

      void main() {
        vUv = uv;

        vec4 mvPosition = vec4(position, 1.0);
        #ifdef USE_INSTANCING
          mvPosition = instanceMatrix * mvPosition;
        #endif

        float dispPower = 1.0 - cos(uv.y * 3.1416 / 2.0);
        float displacement = sin(mvPosition.z + time * 0.5) * (0.1 * dispPower);
        mvPosition.z += displacement;

        vec4 worldPosition = modelMatrix * mvPosition;
        vWorldPosition = worldPosition.xyz;

        vec4 modelViewPosition = modelViewMatrix * mvPosition;
        gl_Position = projectionMatrix * modelViewPosition;
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying vec3 vWorldPosition;

      uniform vec2 courseTiles[100];
      uniform int tileCount;

      void main() {
        bool isCourse = false;
        for (int i = 0; i < 100; i++) {
          if (i >= tileCount) break;
          vec2 tilePos = courseTiles[i];
          if (
            abs(vWorldPosition.x - tilePos.x) < 0.55 &&
            abs(vWorldPosition.z - tilePos.y) < 0.55
          ) {
            isCourse = true;
          }
        }

        if (isCourse) discard;

        vec3 baseColor = vec3(0.094, 0.247, 0.0);
        float clarity = (vUv.y * 0.5) + 0.5;
        gl_FragColor = vec4(baseColor * clarity, 1.0);
      }
    `,
    uniforms: {
      time: { value: 0 },
      courseTiles: { value: courseTileData },
      tileCount: { value: tileCount }
    },
    side: THREE.DoubleSide,
    transparent: true
  });
}