"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { CategoryId } from "@/lib/categories";

const ModelViewer = dynamic(() => import("@/components/three/model-viewer"), { ssr: false });

export function RenderStage({ id }: { id: CategoryId }) {
  const [ready, setReady] = useState(false);
  return (
    <div style={{ position: "fixed", inset: 0, background: "transparent" }} data-ready={ready ? "1" : "0"} id="stage">
      <style>{"html,body{background:transparent!important}"}</style>
      <ModelViewer id={id} transparent interactive={false} reducedMotion onReady={() => setTimeout(() => setReady(true), 1200)} />
    </div>
  );
}
