"use client";

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshTransmissionMaterial, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const FluidMaterial = () => {
  const meshRef = useRef<THREE.Mesh>(null!);

  const shaderArgs = useMemo(() => ({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      
      float noise(vec2 p) {
        return sin(p.x * 12.0 + uTime * 0.5) * sin(p.y * 12.0 + uTime * 0.5);
      }

      void main() {
        vec2 p = vUv - 0.5;
        
        vec3 cRed = vec3(1.0, 0.047, 0.0);
        vec3 cBlue = vec3(0.0, 0.451, 0.949);
        vec3 cPink = vec3(0.953, 0.133, 0.380);
        float tSpeed = uTime * 1.2;
        vec2 q = vec2(0.0);
        q.x = sin(vUv.x * 4.0 + tSpeed) + cos(vUv.y * 4.0 + tSpeed * 1.2);
        q.y = cos(vUv.x * 4.0 - tSpeed) + sin(vUv.y * 4.0 - tSpeed * 0.9);
        
        float n = noise(p * 1.2 + q * 0.2);
        vec2 distUv = p + vec2(n * 0.2, n * 0.2) + q * 0.1;
        
        float angle = atan(distUv.y, distUv.x) + tSpeed * 0.2;
        float t = fract((angle + 3.14159) / 6.28318);
        
        vec3 finalColor;
        
        if (t < 0.333) {
            finalColor = mix(cRed, cPink, smoothstep(0.0, 0.333, t));
        } else if (t < 0.666) {
            finalColor = mix(cPink, cBlue, smoothstep(0.333, 0.666, t));
        } else {
            finalColor = mix(cBlue, cRed, smoothstep(0.666, 1.0, t));
        }
        
        finalColor *= 0.9; 

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.65, 64, 64]} />
      <shaderMaterial args={[shaderArgs]} transparent />
    </mesh>
  );
};

const Eyes = ({ mousePos }: { mousePos: { x: number, y: number } }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const blinkRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (!groupRef.current || !blinkRef.current) return;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, mousePos.x * 0.25, 0.15);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, mousePos.y * 0.25, 0.15);
    const time = Date.now() * 0.001;
    const isBlinking = Math.sin(time * 0.8) > 0.97;
    blinkRef.current.scale.y = THREE.MathUtils.lerp(blinkRef.current.scale.y, isBlinking ? 0.05 : 1, 0.25);
  });

  return (
    // ✅ FIX: z pushed to 0.76 — just outside the glass sphere radius (0.75)
    // This ensures the eyes are never inside the transmissive glass shell,
    // preventing any refraction/reflection artifacts entirely.
    <group ref={groupRef} position={[0, 0, 0.76]}>
      <group ref={blinkRef}>
        <mesh position={[-0.15, 0.15, 0]}>
          <capsuleGeometry args={[0.05, 0.12, 4, 8]} />
          {/* ✅ FIX: depthWrite=false + renderOrder=1 ensures eyes always paint
              on top of the glass surface without z-fighting or glass interactions */}
          <meshBasicMaterial color="#ffffff" depthWrite={false} />
        </mesh>
        <mesh position={[0.15, 0.15, 0]} renderOrder={1}>
          <capsuleGeometry args={[0.05, 0.12, 4, 8]} />
          <meshBasicMaterial color="#ffffff" depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
};

const GlassBot = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  return (
    <div
      className="relative w-full h-full"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
          y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
        });
      }}
    >
      <Canvas
        className="relative z-10 drop-shadow-[0_0_10px_rgba(0,163,255,0.7)]"
        key="glassbot-canvas"
        gl={{ antialias: true, alpha: true }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 3]} fov={45} />
        <ambientLight intensity={0.8} />

        <FluidMaterial />

        <Sphere args={[0.75, 64, 64]}>
          <MeshTransmissionMaterial
            thickness={1.5}
            roughness={0.0}
            transmission={1}
            ior={1.2}
            chromaticAberration={0.03}
            backside={false}
          />
        </Sphere>

        <Eyes mousePos={mousePos} />
      </Canvas>
    </div>
  );
};

export default GlassBot;