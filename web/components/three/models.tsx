"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { CategoryId } from "@/lib/categories";
import { createMaterials, createScreenTexture, type Materials } from "./materials";

export interface ModelProps {
  quality?: "high" | "low";
  /** Receives every material of the model (used by the carousel for fades). */
  onMaterials?: (mats: THREE.Material[]) => void;
}

function useModelMaterials(quality: "high" | "low", onMaterials?: (m: THREE.Material[]) => void, extra: THREE.Material[] = []) {
  const mats = useMemo(() => createMaterials(quality), [quality]);
  useEffect(() => {
    onMaterials?.([...Object.values(mats), ...extra]);
    return () => {
      Object.values(mats).forEach((m) => m.dispose());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mats]);
  return mats;
}

function useScreen(kind: Parameters<typeof createScreenTexture>[0], emissive = 1.15) {
  return useMemo(() => {
    const map = createScreenTexture(kind);
    return new THREE.MeshStandardMaterial({
      map,
      emissiveMap: map,
      emissive: new THREE.Color("#ffffff"),
      emissiveIntensity: emissive,
      roughness: 0.15,
      metalness: 0,
      toneMapped: false,
    });
  }, [kind, emissive]);
}

/* ------------------------------------------------------------------ GOLD */

function Chain({ m }: { m: Materials }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = 58;
  useEffect(() => {
    const mesh = ref.current!;
    const o = new THREE.Object3D();
    // a draped loop behind the bar
    const curve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-0.95, 0.15, -0.25),
        new THREE.Vector3(-0.7, 0.85, -0.45),
        new THREE.Vector3(0, 1.12, -0.55),
        new THREE.Vector3(0.7, 0.85, -0.45),
        new THREE.Vector3(0.95, 0.15, -0.25),
        new THREE.Vector3(0.55, -0.12, 0.05),
        new THREE.Vector3(-0.55, -0.12, 0.05),
      ],
      true,
    );
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      o.position.copy(p);
      o.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), tan);
      o.rotateX(i % 2 ? Math.PI / 2 : 0);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} material={m.gold}>
      <torusGeometry args={[0.055, 0.016, 10, 20]} />
    </instancedMesh>
  );
}

export function GoldModel({ quality = "high", onMaterials }: ModelProps) {
  const stampMat = useMemo(() => {
    const t = createScreenTexture("bar");
    return new THREE.MeshPhysicalMaterial({
      color: "#E2BC6A",
      metalness: 1,
      roughness: 0.32,
      bumpMap: t,
      bumpScale: 1.2,
      roughnessMap: t,
      envMapIntensity: 1.3,
    });
  }, []);
  const m = useModelMaterials(quality, onMaterials, [stampMat]);
  return (
    <group position={[0, -0.2, 0]}>
      {/* ingot */}
      <group rotation={[0.18, -0.35, 0]} position={[0, -0.32, 0.1]}>
        <RoundedBox args={[1.5, 0.34, 0.74]} radius={0.07} smoothness={5} material={m.gold} />
        <mesh position={[0, 0.172, 0]} rotation={[-Math.PI / 2, 0, 0]} material={stampMat}>
          <planeGeometry args={[1.3, 0.6]} />
        </mesh>
      </group>
      <Chain m={m} />
      {/* ring with brilliant */}
      <group position={[0.38, 0.22, 0.42]} rotation={[0.1, 0.5, 0.15]}>
        <mesh material={m.gold}>
          <torusGeometry args={[0.3, 0.055, 32, 96]} />
        </mesh>
        <mesh position={[0, 0.36, 0]} material={m.gold}>
          <cylinderGeometry args={[0.085, 0.06, 0.07, 6]} />
        </mesh>
        <group position={[0, 0.44, 0]}>
          <mesh material={m.diamond}>
            <cylinderGeometry args={[0.07, 0.12, 0.06, 16]} />
          </mesh>
          <mesh position={[0, -0.075, 0]} rotation={[Math.PI, 0, 0]} material={m.diamond}>
            <coneGeometry args={[0.12, 0.1, 16]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* ---------------------------------------------------------------- WATCH */

export function WatchModel({ quality = "high", onMaterials }: ModelProps) {
  const dial = useScreen("dial", 0.35);
  const m = useModelMaterials(quality, onMaterials, [dial]);
  const hours = useRef<THREE.Group>(null);
  const minutes = useRef<THREE.Group>(null);
  const seconds = useRef<THREE.Group>(null);

  useFrame(() => {
    const d = new Date();
    const s = d.getSeconds() + d.getMilliseconds() / 1000;
    const mi = d.getMinutes() + s / 60;
    const h = (d.getHours() % 12) + mi / 60;
    if (seconds.current) seconds.current.rotation.z = -(s / 60) * Math.PI * 2;
    if (minutes.current) minutes.current.rotation.z = -(mi / 60) * Math.PI * 2;
    if (hours.current) hours.current.rotation.z = -(h / 12) * Math.PI * 2;
  });

  // bracelet links following a circle behind the case (wrist loop)
  const links = useMemo(() => {
    const R = 0.75;
    const c = 0.45;
    const n = 18;
    return Array.from({ length: n }, (_, i) => {
      const a = 1.02 + (i / (n - 1)) * 4.24;
      return { pos: [0, R * Math.sin(a), -c + R * Math.cos(a)] as [number, number, number], rot: -a };
    });
  }, []);

  return (
    <group scale={1.05}>
      <group rotation={[Math.PI / 2, 0, 0]}>
        {/* case */}
        <mesh material={m.platinum}>
          <cylinderGeometry args={[0.56, 0.56, 0.2, 96]} />
        </mesh>
        {/* bezel */}
        <mesh position={[0, 0.11, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.blackChrome}>
          <torusGeometry args={[0.53, 0.055, 24, 96]} />
        </mesh>
        <mesh position={[0, 0.125, 0]} rotation={[-Math.PI / 2, 0, 0]} material={m.goldSatin}>
          <ringGeometry args={[0.47, 0.5, 96]} />
        </mesh>
        {/* dial */}
        <mesh position={[0, 0.101, 0]} rotation={[-Math.PI / 2, 0, 0]} material={dial}>
          <circleGeometry args={[0.47, 96]} />
        </mesh>
        {/* crystal */}
        <mesh position={[0, 0.15, 0]} material={m.sapphire}>
          <cylinderGeometry args={[0.48, 0.48, 0.02, 96]} />
        </mesh>
        {/* crown */}
        <mesh position={[0.62, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={m.platinum}>
          <cylinderGeometry args={[0.07, 0.07, 0.1, 24]} />
        </mesh>
        {/* lugs */}
        {[-1, 1].map((sx) =>
          [-1, 1].map((sz) => (
            <mesh key={`${sx}${sz}`} position={[sx * 0.3, 0, sz * 0.56]} material={m.platinum}>
              <boxGeometry args={[0.12, 0.16, 0.22]} />
            </mesh>
          )),
        )}
      </group>
      {/* hands (in dial plane, facing +z) */}
      <group position={[0, 0, 0.115]}>
        <group ref={hours}>
          <mesh position={[0, 0.13, 0]} material={m.gold}>
            <boxGeometry args={[0.04, 0.26, 0.01]} />
          </mesh>
        </group>
        <group ref={minutes} position={[0, 0, 0.008]}>
          <mesh position={[0, 0.19, 0]} material={m.gold}>
            <boxGeometry args={[0.028, 0.38, 0.01]} />
          </mesh>
        </group>
        <group ref={seconds} position={[0, 0, 0.016]}>
          <mesh position={[0, 0.15, 0]} material={m.goldGlow}>
            <boxGeometry args={[0.008, 0.48, 0.006]} />
          </mesh>
        </group>
        <mesh position={[0, 0, 0.024]} rotation={[Math.PI / 2, 0, 0]} material={m.gold}>
          <cylinderGeometry args={[0.03, 0.03, 0.01, 20]} />
        </mesh>
      </group>
      {/* bracelet */}
      {links.map((l, i) => (
        <group key={i} position={l.pos} rotation={[l.rot, 0, 0]}>
          <RoundedBox args={[0.2, 0.17, 0.06]} radius={0.02} smoothness={2} material={m.platinum} />
          {[-1, 1].map((s) => (
            <RoundedBox key={s} args={[0.13, 0.17, 0.055]} radius={0.02} smoothness={2} position={[s * 0.17, 0, -0.004]} material={m.titanium} />
          ))}
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------ SMARTPHONE */

export function PhoneModel({ quality = "high", onMaterials }: ModelProps) {
  const screen = useScreen("phone");
  const m = useModelMaterials(quality, onMaterials, [screen]);
  const W = 0.8;
  const H = 1.66;
  const D = 0.09;
  return (
    <group rotation={[0, 0, 0.06]}>
      <RoundedBox args={[W, H, D]} radius={0.04} smoothness={6} material={m.titanium} />
      {/* front glass */}
      <RoundedBox args={[W - 0.02, H - 0.02, 0.006]} radius={0.003} position={[0, 0, D / 2 + 0.001]} material={m.glassBlack} />
      <mesh position={[0, 0, D / 2 + 0.0055]} material={screen}>
        <planeGeometry args={[W - 0.07, H - 0.07]} />
      </mesh>
      {/* dynamic island */}
      <RoundedBox args={[0.2, 0.055, 0.004]} radius={0.002} position={[0, H / 2 - 0.1, D / 2 + 0.007]} material={m.glassBlack} />
      {/* back glass + camera plateau */}
      <mesh position={[0, 0, -D / 2 - 0.001]} rotation={[0, Math.PI, 0]} material={m.titaniumDark}>
        <planeGeometry args={[W - 0.04, H - 0.04]} />
      </mesh>
      <group position={[-0.16, H / 2 - 0.25, -D / 2 - 0.01]}>
        <RoundedBox args={[0.36, 0.38, 0.03]} radius={0.06} smoothness={4} material={m.titanium} />
        {(
          [
            [-0.08, 0.085],
            [-0.08, -0.085],
            [0.09, 0],
          ] as const
        ).map(([x, y], i) => (
          <group key={i} position={[x, y, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh material={m.platinum}>
              <cylinderGeometry args={[0.068, 0.068, 0.03, 40]} />
            </mesh>
            <mesh position={[0, -0.0155, 0]} material={m.lensGlass}>
              <cylinderGeometry args={[0.05, 0.05, 0.002, 40]} />
            </mesh>
          </group>
        ))}
      </group>
      {/* side buttons */}
      <RoundedBox args={[0.012, 0.18, 0.03]} radius={0.005} position={[W / 2 + 0.004, 0.28, 0]} material={m.titanium} />
      <RoundedBox args={[0.012, 0.1, 0.03]} radius={0.005} position={[-W / 2 - 0.004, 0.36, 0]} material={m.titanium} />
      <RoundedBox args={[0.012, 0.1, 0.03]} radius={0.005} position={[-W / 2 - 0.004, 0.22, 0]} material={m.titanium} />
    </group>
  );
}

/* ---------------------------------------------------------------- LAPTOP */

function Keys({ m }: { m: Materials }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const cols = 14;
  const rows = 6;
  useEffect(() => {
    const o = new THREE.Object3D();
    let i = 0;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        o.position.set(-0.78 + c * 0.12, 0, -0.42 + r * 0.115);
        o.scale.set(r === rows - 1 && c > 3 && c < 10 ? (c === 4 ? 6 : 0.0001) : 1, 1, 1);
        if (r === rows - 1 && c === 4) o.position.x += 0.3;
        o.updateMatrix();
        ref.current!.setMatrixAt(i++, o.matrix);
      }
    ref.current!.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, cols * rows]} material={m.matteBlack}>
      <boxGeometry args={[0.1, 0.012, 0.095]} />
    </instancedMesh>
  );
}

export function LaptopModel({ quality = "high", onMaterials }: ModelProps) {
  const screen = useScreen("laptop", 1.05);
  const m = useModelMaterials(quality, onMaterials, [screen]);
  const W = 2.0;
  const Dp = 1.38;
  const LH = 1.3;
  return (
    <group scale={0.88} position={[0, -0.5, 0.1]} rotation={[0.28, 0, 0]}>
      {/* base */}
      <RoundedBox args={[W, 0.07, Dp]} radius={0.03} smoothness={4} material={m.aluminum} />
      <group position={[0, 0.036, -0.12]}>
        <Keys m={m} />
      </group>
      <RoundedBox args={[0.78, 0.004, 0.42]} radius={0.002} position={[0, 0.036, 0.42]} material={m.spaceGray} />
      {/* lid hinged at back edge, opened ~105° */}
      <group position={[0, 0.035, -Dp / 2 + 0.02]} rotation={[-0.27, 0, 0]}>
        <group position={[0, LH / 2, 0]}>
          <RoundedBox args={[W, LH, 0.045]} radius={0.022} smoothness={4} material={m.aluminum} />
          <mesh position={[0, 0, 0.0235]} material={m.glassBlack}>
            <planeGeometry args={[W - 0.03, LH - 0.03]} />
          </mesh>
          <mesh position={[0, 0.012, 0.0245]} material={screen}>
            <planeGeometry args={[W - 0.12, LH - 0.15]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* ---------------------------------------------------------------- TABLET */

export function TabletModel({ quality = "high", onMaterials }: ModelProps) {
  const screen = useScreen("tablet");
  const m = useModelMaterials(quality, onMaterials, [screen]);
  const W = 1.22;
  const H = 1.68;
  const D = 0.055;
  return (
    <group rotation={[0, 0, -0.08]}>
      <RoundedBox args={[W, H, D]} radius={0.025} smoothness={6} material={m.spaceGray} />
      <RoundedBox args={[W - 0.015, H - 0.015, 0.004]} radius={0.002} position={[0, 0, D / 2 + 0.001]} material={m.glassBlack} />
      <mesh position={[0, 0, D / 2 + 0.0035]} material={screen}>
        <planeGeometry args={[W - 0.1, H - 0.1]} />
      </mesh>
      <group position={[-W / 2 + 0.14, H / 2 - 0.14, -D / 2 - 0.006]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh material={m.blackChrome}>
          <cylinderGeometry args={[0.05, 0.05, 0.012, 32]} />
        </mesh>
      </group>
      {/* stylus */}
      <group position={[W / 2 + 0.12, -0.05, 0.12]} rotation={[0.25, 0.2, 0.2]}>
        <mesh material={m.platinum}>
          <capsuleGeometry args={[0.028, 1.2, 8, 24]} />
        </mesh>
        <mesh position={[0, -0.66, 0]} material={m.goldSatin}>
          <coneGeometry args={[0.026, 0.07, 24]} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------------------------------------------------- CAMERA + CONSOLE */

export function ElectronicsModel({ quality = "high", onMaterials }: ModelProps) {
  const m = useModelMaterials(quality, onMaterials);
  return (
    <group scale={0.95}>
      {/* console tower */}
      <group position={[0.55, 0.15, -0.55]} rotation={[0, -0.5, 0]}>
        <RoundedBox args={[0.32, 1.75, 1.0]} radius={0.06} smoothness={4} material={m.blackChrome} />
        <mesh position={[0.165, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={m.goldGlow}>
          <planeGeometry args={[0.012, 1.55]} />
        </mesh>
        <mesh position={[0, -0.9, 0]} material={m.matteBlack}>
          <boxGeometry args={[0.5, 0.06, 0.7]} />
        </mesh>
      </group>
      {/* camera */}
      <group position={[-0.25, -0.15, 0.35]} rotation={[0.08, 0.45, 0]}>
        <RoundedBox args={[1.15, 0.72, 0.42]} radius={0.06} smoothness={4} material={m.matteBlack} />
        {/* grip */}
        <RoundedBox args={[0.28, 0.68, 0.22]} radius={0.08} smoothness={4} position={[-0.45, -0.01, 0.22]} material={m.rubber} />
        {/* top plate */}
        <RoundedBox args={[1.12, 0.06, 0.4]} radius={0.02} position={[0, 0.37, 0]} material={m.titanium} />
        <RoundedBox args={[0.36, 0.22, 0.34]} radius={0.05} position={[0, 0.48, -0.02]} material={m.matteBlack} />
        {[-0.38, -0.2, 0.36].map((x, i) => (
          <mesh key={i} position={[x, 0.44, 0]} material={i === 2 ? m.gold : m.titanium}>
            <cylinderGeometry args={[0.07, 0.07, 0.07, 32]} />
          </mesh>
        ))}
        {/* lens */}
        <group position={[0.1, -0.02, 0.21]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh position={[0, 0.06, 0]} material={m.titanium}>
            <cylinderGeometry args={[0.3, 0.3, 0.12, 64]} />
          </mesh>
          <mesh position={[0, 0.22, 0]} material={m.matteBlack}>
            <cylinderGeometry args={[0.28, 0.3, 0.24, 64]} />
          </mesh>
          <mesh position={[0, 0.22, 0]} material={m.rubber}>
            <cylinderGeometry args={[0.292, 0.292, 0.1, 64]} />
          </mesh>
          <mesh position={[0, 0.345, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.goldSatin}>
            <torusGeometry args={[0.26, 0.012, 12, 64]} />
          </mesh>
          <mesh position={[0, 0.345, 0]} material={m.lensGlass}>
            <sphereGeometry args={[0.24, 48, 24, 0, Math.PI * 2, 0, 0.55]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export const modelFor: Record<CategoryId, (p: ModelProps) => React.ReactElement> = {
  gold: GoldModel,
  watches: WatchModel,
  smartphones: PhoneModel,
  laptops: LaptopModel,
  tablets: TabletModel,
  electronics: ElectronicsModel,
};
