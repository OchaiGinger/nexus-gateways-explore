import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface SceneProps {
  doors: { position: [number, number, number]; side?: string }[];
}

export function Scene({ doors }: SceneProps) {
  const hallway = useRef<THREE.Group>(null);

  useFrame(() => {
    if (hallway.current) hallway.current.rotation.y = 0;
  });

  return (
    <group ref={hallway}>
      {/* Floor */}
      <mesh receiveShadow position={[0, -0.5, 0]}>
        <boxGeometry args={[20, 1, 60]} />
        <meshStandardMaterial color="#999" />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 4, -30]}>
        <boxGeometry args={[20, 8, 1]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[0, 4, 30]}>
        <boxGeometry args={[20, 8, 1]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[10, 4, 0]}>
        <boxGeometry args={[1, 8, 60]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      <mesh position={[-10, 4, 0]}>
        <boxGeometry args={[1, 8, 60]} />
        <meshStandardMaterial color="#555" />
      </mesh>

      {/* Doors */}
      {doors.map((door, i) => (
        <mesh key={i} position={door.position}>
          <boxGeometry args={[2, 4, 0.2]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      ))}
    </group>
  );
}
