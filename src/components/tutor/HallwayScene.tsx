import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls, Stars, Environment } from "@react-three/drei";
import * as THREE from "three";
import { Camera } from "../Camera";
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

      {/* Left Wall */}
      <mesh position={[-10, 5, 0]}>
        <boxGeometry args={[0.3, 10, 60]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      {/* Right Wall */}
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

      {/* Lights */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 5]} intensity={0.6} castShadow />
      <Environment preset="apartment" />
    </group>
  );
}

export function HallwayScene() {
  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 1, 20));
  const [cameraRotation, setCameraRotation] = useState(0);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "fixed", top: 0, left: 0 }}>
      <KeyboardControls map={keyboardMap}>
        <Canvas shadows camera={{ position: [0, 2, 5], fov: 75 }}>
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
          <HospitalHallway />
          <TutorPlayer
            modelUrl="/models/character.glb" // <-- use your hospital staff/player model
            onPositionChange={setPlayerPosition}
          />
          <Camera target={playerPosition} onCameraRotation={setCameraRotation} />
        </Canvas>
      </KeyboardControls>
    </div>
  );
}
