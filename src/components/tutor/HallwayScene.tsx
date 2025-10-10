"use client";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls, OrbitControls } from "@react-three/drei";
import { Suspense, useState } from "react";
import { Scene } from "./Scene";
import { TutorPlayer } from "./TutorPlayer";
import { Camera } from "./Camera";

export default function HallwayScene() {
  const [cameraRotation, setCameraRotation] = useState(0);
  const [nearDoorIndex, setNearDoorIndex] = useState<number | null>(null);

  const doors = [
    { position: [5, 0, -10], side: "left" },
    { position: [-5, 0, 10], side: "right" },
  ];

  return (
    <div className="w-full h-screen bg-black">
      <KeyboardControls
        map={[
          { name: "forward", keys: ["ArrowUp", "KeyW"] },
          { name: "backward", keys: ["ArrowDown", "KeyS"] },
          { name: "left", keys: ["ArrowLeft", "KeyA"] },
          { name: "right", keys: ["ArrowRight", "KeyD"] },
        ]}
      >
        <Canvas shadows camera={{ position: [0, 1.6, -20], fov: 75 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[0, 5, 0]} intensity={1.2} />

          <Suspense fallback={null}>
            <Scene doors={doors} />
            <Camera target={new THREE.Vector3(0, 1.6, -20)} onCameraRotation={setCameraRotation} />
            <TutorPlayer doors={doors} cameraRotation={cameraRotation} />
          </Suspense>
        </Canvas>
      </KeyboardControls>

      {nearDoorIndex !== null && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white text-lg bg-black/60 px-4 py-2 rounded-lg">
          Near Door {nearDoorIndex + 1}
        </div>
      )}
    </div>
  );
}

