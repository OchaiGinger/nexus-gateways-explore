import * as THREE from "three";

interface DeskProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  isOccupied?: boolean;
}

export function Desk({ position, rotation = [0, 0, 0], isOccupied = false }: DeskProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Desk top */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[1.2, 0.05, 0.8]} />
        <meshStandardMaterial 
          color="#8b7355"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Desk legs */}
      {[
        [-0.5, 0, -0.35],
        [0.5, 0, -0.35],
        [-0.5, 0, 0.35],
        [0.5, 0, 0.35],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.75, 16]} />
          <meshStandardMaterial color="#4a4a4a" />
        </mesh>
      ))}

      {/* Chair */}
      <group position={[0, 0, 0.6]}>
        {/* Seat */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[0.5, 0.05, 0.5]} />
          <meshStandardMaterial 
            color={isOccupied ? "#ff6b6b" : "#4a90e2"}
            roughness={0.6}
          />
        </mesh>

        {/* Backrest */}
        <mesh position={[0, 0.75, -0.2]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.05]} />
          <meshStandardMaterial 
            color={isOccupied ? "#ff6b6b" : "#4a90e2"}
            roughness={0.6}
          />
        </mesh>

        {/* Chair legs */}
        {[
          [-0.2, 0, -0.2],
          [0.2, 0, -0.2],
          [-0.2, 0, 0.2],
          [0.2, 0, 0.2],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.5, 16]} />
            <meshStandardMaterial color="#2a2a2a" />
          </mesh>
        ))}
      </group>

      {/* Laptop on desk */}
      {!isOccupied && (
        <group position={[0, 0.78, 0]}>
          <mesh rotation={[-Math.PI * 0.1, 0, 0]} castShadow>
            <boxGeometry args={[0.4, 0.3, 0.02]} />
            <meshStandardMaterial color="#1a1a1a" emissive="#00ffff" emissiveIntensity={0.1} />
          </mesh>
          <mesh position={[0, -0.15, 0.15]} castShadow>
            <boxGeometry args={[0.4, 0.02, 0.3]} />
            <meshStandardMaterial color="#2a2a2a" />
          </mesh>
        </group>
      )}
    </group>
  );
}
