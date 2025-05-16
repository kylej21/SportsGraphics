import * as THREE from "three";

export default function LeafSwayShader(leavesTexture, leavesAlpha) {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      map: { value: leavesTexture },
      alphaMap: { value: leavesAlpha },
      lightDirection: { value: new THREE.Vector3(5, 10, 7.5).normalize() },
      ambientStrength: { value: 0.8 },
      lightColor: { value: new THREE.Color(0xffffff) },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;

      uniform float time;

      void main() {
        vUv = uv;

        vec3 transformed = position;

        float sway = sin(position.y * 10.0 + time * 2.0) * 0.03;
        transformed.x += sway;

        vNormal = normalize(normalMatrix * normal);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying vec3 vNormal;

      uniform sampler2D map;
      uniform sampler2D alphaMap;

      uniform vec3 lightDirection;
      uniform float ambientStrength;
      uniform vec3 lightColor;

      void main() {
        vec4 texColor = texture2D(map, vUv);
        float alpha = texture2D(alphaMap, vUv).r;

        if (alpha < 0.2) discard;

        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(lightDirection);

        float diff = dot(normal, lightDir);
        diff = diff * 0.5 + 0.5;

        vec3 diffuse = diff * lightColor;
        vec3 ambient = ambientStrength * lightColor;

        vec3 finalColor = (ambient + diffuse) * texColor.rgb;

        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
  });
}
