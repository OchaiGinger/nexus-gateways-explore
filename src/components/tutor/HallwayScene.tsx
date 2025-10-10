"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls, Environment, Stars } from "@react-three/drei";
import * as THREE from "three";
import { TutorPlayer } from "./TutorPlayer";
import { Door } from "./Door";

const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
];

const rooms = [
  { name: "Ward A", position: [-6, 2, -20], inSession: true },
  { name: "Ward B", position: [6, 2, -20], inSession: false },
  { name: "Pharmacy", position: [-6, 2, -10], inSession: true },
  { name: "Lab", position: [6, 2, -10], inSession: false },
  { name: "Reception", position: [-6, 2, 0], inSession: true },
  { name: "Radiology", position: [6, 2, 0], inSession: false },
  { name: "ICU", position: [-6, 2, 10], inSession: false },
  { name: "Doctor's Office", position: [6, 2, 10], inSession: true },
];

function HospitalHallway() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 60]} />
        <meshStandardMaterial color="#d9e0e8" metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10, 0]}>
        <planeGeometry args={[20, 60]} />
        <meshStandardMaterial color="#f5f5f5" roughness={1} />
      </mesh>

      {/* Left & Right Walls */}
      <mesh position={[-10, 5, 0]}>
        <boxGeometry args={[0.3, 10, 60]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      <mesh position={[10, 5, 0]}>
        <boxGeometry args={[0.3, 10, 60]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      {/* Doors */}
      {rooms.map((room, i) => (
        <Door
          key={i}
          position={room.position as [number, number, number]}
          label={room.name}
          isClassInSession={room.inSession}
        />
      ))}

      {/* Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
      <Environment preset="city" />
    </group>
  );
}

export function HallwayScene() {
  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 1, 20));

  return (
    <div style={{ width: "100vw", height: "100vh", position: "fixed", top: 0, left: 0 }}>
      <KeyboardControls map={keyboardMap}>
        <Canvas shadows camera={{ fov: 75, position: [0, 2, 5] }}>
          <Stars radius={80} depth={20} count={3000} factor={4} fade speed={1} />
          <HospitalHallway />
          <TutorPlayer
            modelUrl="/models/character.glb"
            onPositionChange={setPlayerPosition}
            doors={rooms}
          />
        </Canvas>
      </KeyboardControls>
    </div>
  );
}

