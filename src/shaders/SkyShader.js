// shaders/SkyDomeShader.js
import * as THREE from 'three';

export default function SkyDomeShaderMaterial(silhouetteTexture) {
  silhouetteTexture.wrapS = THREE.RepeatWrapping;
  silhouetteTexture.wrapT = THREE.ClampToEdgeWrapping;
  silhouetteTexture.repeat.set(4, 1);

  return new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vWorldPosition;
      varying vec2 vUv;

      void main() {
        vUv = uv * vec2(4.0, 1.0); // Repeat horizontally only
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vWorldPosition;
      varying vec2 vUv;

      uniform sampler2D silhouetteTexture;

      void main() {
        float h = clamp(normalize(vWorldPosition).y, 0.0, 1.0);

        vec3 bottomColor = vec3(0.95, 0.82, 0.52);   // soft sunset yellow
        vec3 midColor    = vec3(0.99, 0.55, 0.27);   // muted orange
        vec3 topColor    = vec3(0.76, 0.45, 0.57);   // dusky pink

        vec3 baseColor;
        if (h < 0.5) {
          baseColor = mix(bottomColor, midColor, h / 0.5);
        } else {
          baseColor = mix(midColor, topColor, (h - 0.5) / 0.5);
        }

        vec4 silhouette = texture2D(silhouetteTexture, vUv);
        vec3 color = mix(baseColor, silhouette.rgb, silhouette.a);

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    uniforms: {
      silhouetteTexture: { value: silhouetteTexture }
    },
    side: THREE.BackSide,
    transparent: false
  });
}
