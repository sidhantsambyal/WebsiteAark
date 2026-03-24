"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";

import logo from '../../assets/Backgrounds/logo.svg'

interface MorphingLogoProps {
  progress: number;
}

export default function MorphingThreeDLogo({ progress }: MorphingLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const solidMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 6000);
    camera.position.set(0, 0, 700);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const logoGroup = new THREE.Group();
    scene.add(logoGroup);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(100, 100, 500);
    scene.add(mainLight);

    const solidMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff, transparent: true, opacity: 1.0, metalness: 0.5, roughness: 0.2
    });
    solidMaterialRef.current = solidMaterial;

    const loader = new SVGLoader();
    loader.load(logo, (data) => {
      const tempGroup = new THREE.Group();

      data.paths.forEach((path) => {
        const shapes = SVGLoader.createShapes(path);
        shapes.forEach((shape) => {
          const geometry = new THREE.ExtrudeGeometry(shape, { depth: 40, bevelEnabled: true });
          const mesh = new THREE.Mesh(geometry, solidMaterial);
          tempGroup.add(mesh);

          const pGeo = new THREE.ShapeGeometry(shape);
          const pMesh = new THREE.Mesh(pGeo);
          const sampler = new MeshSurfaceSampler(pMesh).build();

          const count = 1200;
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
          const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.8, transparent: true, opacity: 0 });
          const points = new THREE.Points(pointsGeo, pMat);
          tempGroup.add(points);
        });
      });

      const box = new THREE.Box3().setFromObject(tempGroup);
      const center = new THREE.Vector3();
      box.getCenter(center);

      tempGroup.children.forEach((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
          // Translate to center, but keep Z at 0 for proper rotation
          child.geometry.translate(-center.x, -center.y, 0);
        }
      });

      logoGroup.add(...tempGroup.children);

      // INVERSION FIX: 
      // Instead of scale.y = -1 which flips normals, we rotate the group 180 degrees 
      // on the Z axis to flip the "upside down" SVG coordinate system right-side up.
      logoGroup.rotation.z = Math.PI;

      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y);
      const containerDim = Math.min(container.clientWidth, container.clientHeight);
      logoGroup.scale.setScalar((containerDim * 0.75) / maxDim);
    });

    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const t = clock.getElapsedTime();
      const p = progressRef.current;

      // Spinning stationary on the Y axis
      logoGroup.rotation.y = t * 0.5;

      const sOpacity = THREE.MathUtils.clamp(THREE.MathUtils.mapLinear(p, 0.5, 0.75, 1, 0), 0, 1);
      if (solidMaterialRef.current) {
        solidMaterialRef.current.opacity = sOpacity;
        solidMaterialRef.current.visible = sOpacity > 0.01;
      }

      let pOpacity = THREE.MathUtils.clamp(THREE.MathUtils.mapLinear(p, 0.6, 0.75, 0, 1), 0, 1);
      if (p > 0.72) {
        pOpacity *= THREE.MathUtils.clamp(THREE.MathUtils.mapLinear(p, 0.72, 0.82, 1, 0), 0, 1);
      }

      logoGroup.children.forEach((child) => {
        if (child instanceof THREE.Points) {
          (child.material as THREE.PointsMaterial).opacity = pOpacity;
          child.visible = pOpacity > 0.01;
        }
      });

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}