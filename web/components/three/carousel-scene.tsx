"use client";

import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor, Sparkles, SpotLight } from "@react-three/drei";
import { easing } from "maath";
import type { Category } from "@/lib/categories";
import { modelFor } from "./models";
import { ShadowBlob, Studio } from "./studio";

export interface DragState {
  /** True while the user is dragging. */
  active: boolean;
  /** Live offset (in item units) while dragging. */
  offset: number;
  /** Pixels moved during the current gesture — used to tell clicks from drags. */
  moved: number;
}

export interface CarouselSceneProps {
  items: Category[];
  /** Unbounded target position (in item units). Active index = mod(target, n). */
  target: number;
  drag: MutableRefObject<DragState>;
  /** Shared live offset so the HTML layer can follow the scene. */
  live: MutableRefObject<number>;
  focusing: boolean;
  reducedMotion: boolean;
  quality: "high" | "low";
  onSelect: (i: number) => void;
  onOpen: (i: number) => void;
  onReady?: () => void;
  active: boolean;
}

const mod = (a: number, n: number) => ((a % n) + n) % n;
const wrapDelta = (d: number, n: number) => {
  let x = mod(d, n);
  if (x > n / 2) x -= n;
  return x;
};

function CarouselItem({
  item,
  index,
  n,
  radius,
  live,
  drag,
  quality,
  reducedMotion,
  onSelect,
  onOpen,
}: {
  item: Category;
  index: number;
  n: number;
  radius: number;
  live: MutableRefObject<number>;
  drag: MutableRefObject<DragState>;
  quality: "high" | "low";
  reducedMotion: boolean;
  onSelect: (i: number) => void;
  onOpen: (i: number) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const mats = useRef<THREE.Material[]>([]);
  const Model = modelFor[item.id];
  const baseOpacity = useRef<Map<THREE.Material, number>>(new Map());

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const d = wrapDelta(index - live.current, n);
    const theta = (d / n) * Math.PI * 2;
    const closeness = Math.max(0, 1 - Math.abs(d)); // 1 = centred
    const t = state.clock.elapsedTime;

    g.position.set(
      Math.sin(theta) * radius,
      (reducedMotion ? 0 : Math.sin(t * 0.8 + index) * 0.06) + closeness * 0.12,
      Math.cos(theta) * radius - radius,
    );
    const s = 0.82 + closeness * 0.43; // active 1.25
    g.scale.setScalar(s);

    if (spin.current) {
      if (closeness > 0.5 && !reducedMotion) spin.current.rotation.y += dt * 0.32;
      else easing.dampAngle(spin.current.rotation, "y", -theta * 0.6, 0.6, dt);
      // subtle pointer parallax on the hero object
      easing.dampAngle(spin.current.rotation, "x", closeness * -state.pointer.y * 0.12, 0.4, dt);
    }

    // inactive objects fade to 0.8, distant ones a little more for depth
    const opacity = THREE.MathUtils.clamp(0.8 + 0.2 * closeness - Math.max(0, Math.abs(d) - 1.5) * 0.12, 0.55, 1);
    for (const m of mats.current) {
      const base = baseOpacity.current.get(m) ?? 1;
      m.opacity = base * opacity;
      m.transparent = base < 1 || opacity < 0.999;
      m.depthWrite = true;
    }
  });

  return (
    <group
      ref={group}
      onClick={(e) => {
        e.stopPropagation();
        if (drag.current.moved > 6) return;
        const d = wrapDelta(index - live.current, n);
        if (Math.abs(d) < 0.5) onOpen(index);
        else onSelect(index);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      <group ref={spin}>
        <Model
          quality={quality}
          onMaterials={(list) => {
            mats.current = list;
            list.forEach((m) => baseOpacity.current.set(m, m.opacity));
          }}
        />
      </group>
    </group>
  );
}

function Rig({
  target,
  live,
  drag,
  focusing,
  reducedMotion,
  n,
}: {
  target: number;
  live: MutableRefObject<number>;
  drag: MutableRefObject<DragState>;
  focusing: boolean;
  reducedMotion: boolean;
  n: number;
}) {
  const { camera, size } = useThree();
  const pulse = useRef(0);
  const last = useRef(target);
  const lookAt = useMemo(() => new THREE.Vector3(), []);
  const lookX = useRef(0);

  useEffect(() => {
    if (last.current !== target) pulse.current = 1;
    last.current = target;
  }, [target]);

  useFrame((state, dt) => {
    // carousel position
    if (drag.current.active) live.current = drag.current.offset;
    else easing.damp(live, "current", target, reducedMotion ? 0.12 : 0.42, dt);

    // camera: responsive distance, cinematic zoom pulse on selection, push-in on open.
    // On wide screens the view is offset so the ring sits right of the headline.
    const aspect = size.width / size.height;
    const base = aspect < 0.8 ? 11.8 : aspect < 1.2 ? 8.6 : 7.9;
    const shift = aspect > 1.25 ? Math.min(1.9, 0.9 + (aspect - 1.25) * 2) : 0;
    pulse.current = Math.max(0, pulse.current - dt * 1.1);
    const p = reducedMotion ? 0 : Math.sin(pulse.current * Math.PI) * 0.5;
    const z = focusing ? base - 3.2 : base - p;
    const px = reducedMotion ? 0 : state.pointer.x * 0.35;
    const py = reducedMotion ? 0 : state.pointer.y * 0.15;
    const cx = focusing ? 0 : -shift;
    easing.damp3(camera.position, [px + cx, 0.75 + py, z], focusing ? 0.5 : 0.35, dt);
    easing.damp(lookX, "current", cx, 0.35, dt);
    lookAt.set(lookX.current, aspect < 0.8 ? 0.5 : aspect < 1.2 ? 0.3 : 0, -0.6);
    camera.lookAt(lookAt);
  });
  void n;
  return null;
}

function Pedestal({ target }: { target: number }) {
  const rim = useRef<THREE.MeshStandardMaterial>(null);
  const flash = useRef(0);
  useEffect(() => {
    flash.current = 1;
  }, [target]);
  useFrame((_, dt) => {
    flash.current = Math.max(0, flash.current - dt * 0.8);
    if (rim.current) rim.current.emissiveIntensity = 1.2 + flash.current * 3;
  });
  return (
    <group position={[0, -1.32, 0]}>
      <mesh receiveShadow>
        <cylinderGeometry args={[1.15, 1.2, 0.08, 96]} />
        <meshPhysicalMaterial color="#0c0d11" metalness={0.6} roughness={0.18} clearcoat={1} envMapIntensity={1.2} />
      </mesh>
      <mesh position={[0, 0.042, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.11, 1.14, 128]} />
        <meshStandardMaterial ref={rim} color="#F3D58A" emissive="#F3D58A" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      {/* baked soft shadow (the hero object always sits on the pedestal) */}
      <ShadowBlob y={0.045} size={2.6} />
    </group>
  );
}

function FrontLight({ target, quality }: { target: number; quality: "high" | "low" }) {
  const light = useRef<THREE.SpotLight>(null);
  const flash = useRef(0);
  const targetObj = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, -1, 0);
    return o;
  }, []);
  useEffect(() => {
    flash.current = 1;
  }, [target]);
  useFrame((_, dt) => {
    flash.current = Math.max(0, flash.current - dt * 0.9);
    if (light.current) light.current.intensity = 40 + flash.current * 50;
  });
  return (
    <>
      <primitive object={targetObj} />
      <SpotLight
        ref={light}
        target={targetObj}
        position={[0, 4.5, 1.2]}
        angle={0.42}
        penumbra={0.8}
        distance={9}
        attenuation={quality === "high" ? 6 : 4}
        anglePower={4}
        opacity={quality === "high" ? 0.35 : 0.2}
        color="#ffe9bd"
        volumetric
      />
    </>
  );
}

export default function CarouselScene(props: CarouselSceneProps) {
  const { items, quality, reducedMotion, active, onReady } = props;
  const n = items.length;
  const radius = 3.4;
  const perf = useRef(quality);

  return (
    <Canvas
      dpr={quality === "high" ? [1, 1.75] : [1, 1.25]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0.55, 6.1], fov: 34, near: 0.1, far: 40 }}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        onReady?.();
      }}
      style={{ touchAction: "pan-y" }}
    >
      <PerformanceMonitor onDecline={() => (perf.current = "low")} />
      <color attach="background" args={["#08090C"]} />
      <fog attach="fog" args={["#08090C", 7, 15]} />
      <Studio />
      <FrontLight target={props.target} quality={quality} />
      <Suspense fallback={null}>
        {items.map((item, i) => (
          <CarouselItem
            key={item.id}
            item={item}
            index={i}
            n={n}
            radius={radius}
            live={props.live}
            drag={props.drag}
            quality={quality}
            reducedMotion={reducedMotion}
            onSelect={props.onSelect}
            onOpen={props.onOpen}
          />
        ))}
      </Suspense>
      <Pedestal target={props.target} />
      {!reducedMotion && (
        <Sparkles count={quality === "high" ? 90 : 40} scale={[12, 5, 8]} position={[0, 0.5, -2]} size={2.2} speed={0.25} opacity={0.55} color="#F3D58A" />
      )}
      <Rig target={props.target} live={props.live} drag={props.drag} focusing={props.focusing} reducedMotion={reducedMotion} n={n} />
    </Canvas>
  );
}
