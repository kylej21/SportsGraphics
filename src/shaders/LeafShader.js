// LeafSwayShader.js
import * as THREE from 'three';

export default function LeafSwayShader(leavesTexture, leavesAlpha) {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      map: { value: leavesTexture },
      alphaMap: { value: leavesAlpha }
    },
    vertexShader: `
      varying vec2 vUv;
      uniform float time;

      void main() {
        vUv = uv;
        vec3 transformed = position;

        // Sway movement along X axis
        float sway = sin(position.y * 10.0 + time * 2.0) * 0.03;
        transformed.x += sway;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D map;
      uniform sampler2D alphaMap;

      void main() {
        vec4 texColor = texture2D(map, vUv);
        float alpha = texture2D(alphaMap, vUv).r;

        if (alpha < 0.2) discard;
        gl_FragColor = vec4(texColor.rgb, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide
  });
}
