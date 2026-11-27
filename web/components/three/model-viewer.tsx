"use client";

import { Suspense } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls, Sparkles } from "@react-three/drei";
import type { CategoryId } from "@/lib/categories";
import { modelFor } from "./models";
import { ShadowBlob, Studio } from "./studio";

/** Single-product turntable: drag to rotate, auto-rotates unless reduced motion. */
export default function ModelViewer({
  id,
  reducedMotion = false,
  transparent = false,
  interactive = true,
  onReady,
}: {
  id: CategoryId;
  reducedMotion?: boolean;
  transparent?: boolean;
  interactive?: boolean;
  onReady?: () => void;
}) {
  const Model = modelFor[id];
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.3, 4.6], fov: 34 }}
      gl={{ antialias: true, alpha: transparent, preserveDrawingBuffer: transparent }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        if (transparent) gl.setClearColor(0x000000, 0);
        onReady?.();
      }}
      style={{ touchAction: "pan-y" }}
    >
      {!transparent && <color attach="background" args={["#08090C"]} />}
      <Studio />
      <Suspense fallback={null}>
        <Float speed={reducedMotion || !interactive ? 0 : 1.4} rotationIntensity={0.2} floatIntensity={0.4}>
          <group scale={1.1}>
            <Model quality="high" />
          </group>
        </Float>
      </Suspense>
      <ShadowBlob y={-1.35} size={3.4} opacity={0.8} />
      {!transparent && !reducedMotion && <Sparkles count={50} scale={[6, 4, 4]} size={2} speed={0.2} opacity={0.5} color="#F3D58A" />}
      {interactive && (
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate={!reducedMotion}
          autoRotateSpeed={0.9}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
        />
      )}
    </Canvas>
  );
}
