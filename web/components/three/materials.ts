import * as THREE from "three";

/**
 * Material library. Every model instance builds its own materials so the
 * carousel can fade individual objects without affecting the others.
 */
export function createMaterials(quality: "high" | "low" = "high") {
  const metal = (color: string, roughness: number, extra: Partial<THREE.MeshPhysicalMaterialParameters> = {}) =>
    new THREE.MeshPhysicalMaterial({ color, metalness: 1, roughness, envMapIntensity: 1.35, ...extra });

  return {
    gold: metal("#E2BC6A", 0.16, { clearcoat: 0.4, clearcoatRoughness: 0.1 }),
    goldSatin: metal("#D6B56D", 0.34),
    roseGold: metal("#E3A98C", 0.2),
    platinum: metal("#D9DDE3", 0.12, { clearcoat: 0.6, clearcoatRoughness: 0.08 }),
    titanium: metal("#9DA1A8", 0.32),
    titaniumDark: metal("#4A4C52", 0.3),
    aluminum: metal("#B9BDC4", 0.4),
    spaceGray: metal("#5A5D63", 0.42),
    blackChrome: metal("#1B1C21", 0.14, { clearcoat: 1, clearcoatRoughness: 0.05 }),
    matteBlack: new THREE.MeshPhysicalMaterial({ color: "#121316", metalness: 0.35, roughness: 0.62, envMapIntensity: 0.9 }),
    rubber: new THREE.MeshStandardMaterial({ color: "#0D0E10", metalness: 0, roughness: 0.85 }),
    glassBlack: new THREE.MeshPhysicalMaterial({
      color: "#050608",
      metalness: 0.2,
      roughness: 0.04,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 1.6,
    }),
    lensGlass: new THREE.MeshPhysicalMaterial({
      color: "#0B1020",
      metalness: 0.5,
      roughness: 0.02,
      clearcoat: 1,
      iridescence: 0.8,
      iridescenceIOR: 1.6,
      envMapIntensity: 2,
    }),
    diamond:
      quality === "high"
        ? new THREE.MeshPhysicalMaterial({
            color: "#ffffff",
            metalness: 0,
            roughness: 0,
            transmission: 1,
            thickness: 0.4,
            ior: 2.42,
            dispersion: 5,
            envMapIntensity: 3,
            specularIntensity: 1,
          })
        : new THREE.MeshPhysicalMaterial({ color: "#f4f6ff", metalness: 0.9, roughness: 0, envMapIntensity: 3 }),
    sapphire: new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      metalness: 0,
      roughness: 0,
      transparent: true,
      opacity: 0.12,
      clearcoat: 1,
      envMapIntensity: 2.4,
    }),
    goldGlow: new THREE.MeshStandardMaterial({ color: "#F3D58A", emissive: "#F3D58A", emissiveIntensity: 2.2, toneMapped: false }),
  };
}

export type Materials = ReturnType<typeof createMaterials>;

type ScreenKind = "phone" | "tablet" | "laptop" | "dial" | "bar";

/** Procedural canvas textures (screens, watch dial, ingot stamp) — no image downloads. */
export function createScreenTexture(kind: ScreenKind): THREE.CanvasTexture {
  const w = kind === "laptop" ? 1024 : kind === "dial" || kind === "bar" ? 512 : 512;
  const h = kind === "laptop" ? 640 : kind === "dial" ? 512 : kind === "bar" ? 256 : kind === "tablet" ? 700 : 1040;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;

  if (kind === "dial") {
    const r = w / 2;
    const bg = g.createRadialGradient(r * 0.8, r * 0.7, 10, r, r, r);
    bg.addColorStop(0, "#26304a");
    bg.addColorStop(0.6, "#0f1424");
    bg.addColorStop(1, "#05070d");
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    // sunburst
    g.globalAlpha = 0.08;
    for (let a = 0; a < 360; a += 2) {
      g.strokeStyle = a % 4 ? "#ffffff" : "#8899cc";
      g.beginPath();
      g.moveTo(r, r);
      g.lineTo(r + Math.cos((a * Math.PI) / 180) * r, r + Math.sin((a * Math.PI) / 180) * r);
      g.stroke();
    }
    g.globalAlpha = 1;
    // indices
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2;
      const major = i % 5 === 0;
      g.save();
      g.translate(r, r);
      g.rotate(a);
      g.fillStyle = major ? "#F3D58A" : "#C9CED6";
      if (major) g.fillRect(-7, -r * 0.9, 14, r * 0.15);
      else g.fillRect(-1.5, -r * 0.9, 3, r * 0.05);
      g.restore();
    }
    g.fillStyle = "#D6B56D";
    g.font = "600 26px Georgia, serif";
    g.textAlign = "center";
    g.fillText("CHRONOMETER", r, r * 0.62);
    g.font = "500 16px Georgia, serif";
    g.fillStyle = "#C9CED6";
    g.fillText("AUTOMATIC · 300M", r, r * 1.45);
  } else if (kind === "bar") {
    g.fillStyle = "#000";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#fff";
    g.lineWidth = 6;
    g.strokeRect(18, 18, w - 36, h - 36);
    g.fillStyle = "#fff";
    g.textAlign = "center";
    g.font = "700 56px Georgia, serif";
    g.fillText("FINE GOLD", w / 2, h * 0.44);
    g.font = "600 40px Georgia, serif";
    g.fillText("999.9", w / 2, h * 0.68);
    g.font = "500 24px Georgia, serif";
    g.fillText("1000 g", w / 2, h * 0.86);
  } else {
    // device wallpaper: obsidian with liquid-gold waves
    const bg = g.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#0b0c10");
    bg.addColorStop(0.55, "#16130c");
    bg.addColorStop(1, "#08090c");
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    for (let k = 0; k < 7; k++) {
      const grad = g.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "rgba(243,213,138,0)");
      grad.addColorStop(0.5, `rgba(243,213,138,${0.55 - k * 0.06})`);
      grad.addColorStop(1, "rgba(214,181,109,0)");
      g.strokeStyle = grad;
      g.lineWidth = 10 - k;
      g.beginPath();
      for (let x = 0; x <= w; x += 8) {
        const y = h * 0.62 + Math.sin(x / (w / 3) + k * 0.6) * h * 0.08 + k * h * 0.025;
        if (x === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
    }
    const glow = g.createRadialGradient(w * 0.7, h * 0.3, 0, w * 0.7, h * 0.3, w * 0.8);
    glow.addColorStop(0, "rgba(243,213,138,0.25)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = glow;
    g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(255,255,255,0.92)";
    g.textAlign = "center";
    if (kind === "phone") {
      g.font = "200 150px Helvetica, Arial, sans-serif";
      g.fillText("10:24", w / 2, h * 0.28);
      g.font = "400 30px Helvetica, Arial, sans-serif";
      g.fillStyle = "rgba(243,213,138,0.9)";
      g.fillText("Пятница, 27 ноября", w / 2, h * 0.14);
    } else if (kind === "tablet") {
      g.font = "200 110px Helvetica, Arial, sans-serif";
      g.fillText("10:24", w / 2, h * 0.32);
    } else {
      // laptop: minimal dock + window
      g.fillStyle = "rgba(255,255,255,0.06)";
      g.fillRect(w * 0.12, h * 0.12, w * 0.5, h * 0.5);
      g.strokeStyle = "rgba(243,213,138,0.4)";
      g.strokeRect(w * 0.12, h * 0.12, w * 0.5, h * 0.5);
      g.fillStyle = "rgba(255,255,255,0.12)";
      g.fillRect(w * 0.3, h * 0.9, w * 0.4, h * 0.06);
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
