"use client";

import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { PointerLockControls, Text } from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import { TutorPlayer } from "./TutorPlayer";
import { Door } from "./Door";

export function HallwayScene() {
  const [enteredRoom, setEnteredRoom] = useState<string | null>(null);
  const playerRef = useRef<THREE.Group>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  // Define doors
  const doors = [
    { id: "A", position: [0, 1.5, -10], label: "Class A", isClassInSession: false },
    { id: "B", position: [4, 1.5, -20], label: "Class B", isClassInSession: true },
  ];

  const handleDoorClick = (doorId: string) => {
    setEnteredRoom(doorId);
  };

  return (
    <Canvas
      shadows
      camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 1.6, 5] }}
    >
      <color attach="background" args={["#111"]} />

      {/* ======= LIGHTING SETUP ======= */}
      <hemisphereLight intensity={0.7} skyColor={"#ffffff"} groundColor={"#666666"} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <spotLight
        position={[0, 10, 0]}
        angle={0.5}
        penumbra={0.3}
        intensity={2.5}
        color={"#ffdca8"}
        castShadow
      />
      <pointLight position={[0, 3, -10]} intensity={1.5} color="#99ccff" />
      <ambientLight intensity={0.4} />

      <PointerLockControls />

      <Suspense fallback={null}>
        {/* ======= SCENE FLOOR & WALLS ======= */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#2e2e2e" />
        </mesh>

        {/* Walls */}
        <mesh position={[0, 2, -25]}>
          <boxGeometry args={[20, 4, 0.5]} />
          <meshStandardMaterial color="#444" />
        </mesh>

        {/* Side walls */}
        <mesh position={[-10, 2, -10]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[30, 4, 0.5]} />
          <meshStandardMaterial color="#3a3a3a" />
        </mesh>
        <mesh position={[10, 2, -10]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[30, 4, 0.5]} />
          <meshStandardMaterial color="#3a3a3a" />
        </mesh>

        {/* Ceiling */}
        <mesh position={[0, 4, -10]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 30]} />
          <meshStandardMaterial color="#222" />
        </mesh>

        {/* ======= DOORS ======= */}
        {doors.map((door) => (
          <Door
            key={door.id}
            position={door.position as [number, number, number]}
            label={door.label}
            isClassInSession={door.isClassInSession}
            onClick={() => handleDoorClick(door.id)}
          />
        ))}

        {/* ======= PLAYER ======= */}
        <TutorPlayer
          ref={playerRef}
          cameraRef={cameraRef}
          doors={doors}
          isFPS={true}
          onDoorProximity={(id) => console.log("Near door:", id)}
          onEnterRoom={(id) => setEnteredRoom(id)}
          onPositionChange={(pos) => console.log("Player at:", pos)}
        />

        {/* ======= TEXT LABEL WHEN ENTERED ======= */}
        {enteredRoom && (
          <Text position={[0, 2, -5]} fontSize={1} color="white">
            You Entered {enteredRoom}
          </Text>
        )}
      </Suspense>
    </Canvas>
  );
}



