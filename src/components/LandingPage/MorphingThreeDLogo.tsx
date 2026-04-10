"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";

// Ensure this path matches your project structure
import logo from '../../assets/Backgrounds/logo.svg';

interface MorphingLogoProps {
  progress: number;
}

export default function MorphingThreeDLogo({ progress }: MorphingLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const solidMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  // Sync the incoming scroll progress to a ref for the animation loop
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // ─── SCENE SETUP ───────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 6000);
    camera.position.set(0, 0, 700);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const logoGroup = new THREE.Group();
    scene.add(logoGroup);

    // ─── LIGHTING ──────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(100, 100, 500);
    scene.add(mainLight);

    // ─── MATERIALS ─────────────────────────────────────────────────
    const solidMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1.0,
      metalness: 0.5,
      roughness: 0.2
    });
    solidMaterialRef.current = solidMaterial;

    // ─── SVG LOADING & GEOMETRY GENERATION ─────────────────────────
    const loader = new SVGLoader();
    loader.load(logo, (data) => {
      const tempGroup = new THREE.Group();

      data.paths.forEach((path) => {
        const shapes = SVGLoader.createShapes(path);
        shapes.forEach((shape) => {
          // 1. Create the Solid Mesh
          const geometry = new THREE.ExtrudeGeometry(shape, { depth: 40, bevelEnabled: true });
          const mesh = new THREE.Mesh(geometry, solidMaterial);
          tempGroup.add(mesh);

          // 2. Create the Point Cloud (Particles) for Morphing
          const pGeo = new THREE.ShapeGeometry(shape);
          const pMesh = new THREE.Mesh(pGeo);
          const sampler = new MeshSurfaceSampler(pMesh).build();

          const count = 1500; // Increased count for a denser "dust" effect
          const pos = new Float32Array(count * 3);
          const tempV = new THREE.Vector3();

          for (let i = 0; i < count; i++) {
            sampler.sample(tempV);
            pos[i * 3] = tempV.x;
            pos[i * 3 + 1] = tempV.y;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
          }

          const pointsGeo = new THREE.BufferGeometry();
          pointsGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

          const pMat = new THREE.PointsMaterial({
            color: 0x87ceeb,
            size: 1.5,
            transparent: true,
            opacity: 0
          });

          const points = new THREE.Points(pointsGeo, pMat);
          tempGroup.add(points);
        });
      });

      // ─── CENTERING LOGIC ─────────────────────────────────────────
      const box = new THREE.Box3().setFromObject(tempGroup);
      const center = new THREE.Vector3();
      box.getCenter(center);

      tempGroup.children.forEach((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
          child.geometry.translate(-center.x, -center.y, 0);
        }
      });

      logoGroup.add(...tempGroup.children);

      // Flip the SVG coordinate system
      logoGroup.rotation.z = Math.PI;

      // Responsive Scaling
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y);
      const containerDim = Math.min(container.clientWidth, container.clientHeight);
      logoGroup.scale.setScalar((containerDim * 0.75) / maxDim);
    });

    // ─── ANIMATION LOOP ────────────────────────────────────────────
    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const t = clock.getElapsedTime();
      const p = progressRef.current;

      // Constant Y-axis rotation
      logoGroup.rotation.y = t * 0.4;

      // 1. Solid Mesh Fade-Out (Starts exactly at 0.25 with the text)
      const sOpacity = THREE.MathUtils.clamp(
        THREE.MathUtils.mapLinear(p, 0.25, 0.32, 1, 0),
        0, 1
      );

      if (solidMaterialRef.current) {
        solidMaterialRef.current.opacity = sOpacity;
        solidMaterialRef.current.visible = sOpacity > 0.01;
      }

      // 2. Point Cloud Fade-In (Overlaps the solid fade for a smooth morph)
      let pOpacity = THREE.MathUtils.clamp(
        THREE.MathUtils.mapLinear(p, 0.30, 0.40, 0, 1),
        0, 1
      );

      // 3. Point Cloud Exit (Fades out when approaching the Runic/Galaxy transition)
      if (p > 0.45) {
        pOpacity *= THREE.MathUtils.clamp(
          THREE.MathUtils.mapLinear(p, 0.45, 0.52, 1, 0),
          0, 1
        );
      }

      logoGroup.children.forEach((child) => {
        if (child instanceof THREE.Points) {
          (child.material as THREE.PointsMaterial).opacity = pOpacity;
          child.visible = pOpacity > 0.01;

          // Optional: Add subtle particle jitter as they morph
          child.rotation.y = Math.sin(t * 0.5) * 0.1;
        }
      });

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    // ─── CLEANUP ───────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      // Dispose geometries and materials to prevent memory leaks
      logoGroup.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}