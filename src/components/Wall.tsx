import * as THREE from "three";

interface WallProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  width: number;
  height: number;
}

export function Wall({ position, rotation = [0, 0, 0], width, height }: WallProps) {
  return (
    <mesh position={position} rotation={rotation} receiveShadow castShadow>
      <boxGeometry args={[width, height, 0.5]} />
      <meshStandardMaterial
        color="#1a1a3e"
        emissive="#0a0a1f"
        emissiveIntensity={0.2}
        metalness={0.5}
        roughness={0.5}
      />
    </mesh>
  );
}
