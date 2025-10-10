"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useState } from "react";
import TutorPlayer from "./TutorPlayer";
import { Door } from "./Door";

function Ground() {
  return (
    <>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 12]} />
        <meshStandardMaterial color="#808080" roughness={0.8} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 6, 0]}>
        <planeGeometry args={[120, 12]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 3, -6]}>
        <boxGeometry args={[120, 6, 0.5]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>
      <mesh position={[0, 3, 6]}>
        <boxGeometry args={[120, 6, 0.5]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>
    </>
  );
}

export function HallwayScene() {
  const [doorStates, setDoorStates] = useState<{ [key: string]: boolean }>({});

  const toggleDoorState = (label: string) => {
    setDoorStates((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const doors = Array.from({ length: 6 }, (_, i) => {
    const x = -25 + i * 10;
    return [
      {
        position: [x, 1.2, -5.75] as [number, number, number], // lowered door
        label: `Room ${i * 2 + 1}`,
        rotationY: Math.PI / 2,
      },
      {
        position: [x, 1.2, 5.75] as [number, number, number],
        label: `Room ${i * 2 + 2}`,
        rotationY: -Math.PI / 2,
      },
    ];
  }).flat();

  return (
    <div className="w-full h-screen">
      <Canvas shadows camera={{ position: [0, 2, 10], fov: 70 }}>
        {/* Lights */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />
        <pointLight position={[0, 5, 0]} intensity={0.3} />

        <fog attach="fog" args={["#111111", 10, 150]} />

        <Stars radius={80} depth={40} count={3000} factor={3} saturation={0} fade speed={1} />
        <Environment preset="warehouse" />

        <Ground />

        {/* Doors */}
        {doors.map((door, i) => (
          <group key={i} rotation={[0, door.rotationY, 0]}>
            <Door
              position={door.position}
              label={door.label}
              isClassInSession={doorStates[door.label] ?? false}
              onClick={() => toggleDoorState(door.label)}
            />
          </group>
        ))}

        {/* TutorPlayer */}
        <TutorPlayer
          portals={[]} // no portals in hallway
          onPositionChange={() => {}}
          onPortalProximity={() => {}}
          onPortalEnter={() => {}}
        />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={4}
          maxDistance={10}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
    </div>
  );
}





