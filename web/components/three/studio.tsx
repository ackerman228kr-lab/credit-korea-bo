"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Environment, Lightformer } from "@react-three/drei";

/**
 * Cinematic studio lighting built from procedural light-formers
 * (no HDR downloads): warm gold key ring, cool platinum rims, top softbox.
 */
export function Studio({ intensity = 1 }: { intensity?: number }) {
  return (
    <>
      <ambientLight intensity={0.18 * intensity} />
      <directionalLight position={[4, 6, 5]} intensity={1.6 * intensity} color="#fff3dc" />
      <directionalLight position={[-6, 2, -4]} intensity={0.8 * intensity} color="#c9d4ff" />
      <Environment resolution={256} frames={1} environmentIntensity={intensity}>
        <color attach="background" args={["#050507"]} />
        <Lightformer form="rect" intensity={4} color="#fff6e6" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={3.2} color="#F3D58A" position={[-6, 1.5, 2]} rotation-y={Math.PI / 2} scale={[6, 2.2, 1]} />
        <Lightformer form="rect" intensity={2.4} color="#e8eeff" position={[6, 1, 1]} rotation-y={-Math.PI / 2} scale={[6, 1.4, 1]} />
        <Lightformer form="ring" intensity={2.6} color="#D6B56D" position={[0, 2, -8]} scale={6} />
        <Lightformer form="rect" intensity={1.6} color="#ffffff" position={[0, -3, 5]} rotation-x={-Math.PI / 3} scale={[8, 1, 1]} />
        <Lightformer form="circle" intensity={6} color="#ffffff" position={[3, 4, 6]} scale={1.2} />
      </Environment>
    </>
  );
}

/** Cheap baked soft shadow (radial gradient) — stable on every GPU, no extra render pass. */
export function ShadowBlob({ y = -1.3, size = 3, opacity = 0.85 }: { y?: number; size?: number; opacity?: number }) {
  const mat = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, `rgba(0,0,0,${opacity})`);
    grad.addColorStop(0.45, `rgba(0,0,0,${opacity * 0.5})`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    return new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false });
  }, [opacity]);
  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat}>
      <planeGeometry args={[size, size]} />
    </mesh>
  );
}
