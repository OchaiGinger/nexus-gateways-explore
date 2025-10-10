"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls, Environment, Stars, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { TutorPlayer } from "./TutorPlayer";
import { Door } from "./Door";

const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
];

const classrooms = [
  { name: "Class 1A", position: [-9.85, 1.5, -20], rotationY: Math.PI / 2 },
  { name: "Class 1B", position: [9.85, 1.5, -15], rotationY: -Math.PI / 2 },
  { name: "Class 2A", position: [-9.85, 1.5, -10], rotationY: Math.PI / 2 },
  { name: "Class 2B", position: [9.85, 1.5, -5], rotationY: -Math.PI / 2 },
  { name: "Class 3A", position: [-9.85, 1.5, 0], rotationY: Math.PI / 2 },
  { name: "Class 3B", position: [9.85, 1.5, 5], rotationY: -Math.PI / 2 },
  { name: "Class 4A", position: [-9.85, 1.5, 10], rotationY: Math.PI / 2 },
  { name: "Class 4B", position: [9.85, 1.5, 15], rotationY: -Math.PI / 2 },
];

function SchoolHallway() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 60]} />
        <meshStandardMaterial color="#d8d8d8" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 8, 0]}>
        <planeGeometry args={[20, 60]} />
        <meshStandardMaterial color="#fafafa" roughness={1} />
      </mesh>

      {/* Side walls */}
      <mesh position={[-10, 4, 0]}>
        <boxGeometry args={[0.3, 8, 60]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      <mesh position={[10, 4, 0]}>
        <boxGeometry args={[0.3, 8, 60]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      {/* Doors on both sides */}
      {classrooms.map((room, i) => (
        <Door
          key={i}
          position={room.position as [number, number, number]}
          rotation={[0, room.rotationY, 0]}
          label={room.name}
          isClassInSession={Math.random() > 0.5}
        />
      ))}

      {/* Lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
      <Environment preset="city" />
    </group>
  );
}

export function HallwayScene() {
  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 1, 20));

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        backgroundColor: "black",
      }}
    >
      <KeyboardControls map={keyboardMap}>
        <Canvas shadows camera={{ position: [0, 2, 5], fov: 75 }}>
          <Stars radius={80} depth={20} count={2000} factor={4} fade speed={1} />
          <OrbitControls enablePan={false} enableZoom={false} />
          <SchoolHallway />
          <TutorPlayer
            modelUrl="/models/character.glb"
            onPositionChange={setPlayerPosition}
            doors={classrooms}
          />
        </Canvas>
      </KeyboardControls>
    </div>
  );
}


