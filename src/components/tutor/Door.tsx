import { Text } from "@react-three/drei";
import * as THREE from "three";

interface DoorProps {
  position: [number, number, number];
  label: string;
  isClassInSession: boolean;
  onClick?: () => void;
  rotation?: number;
  isNear?: boolean;
}

export function Door({ position, label, isClassInSession, onClick, rotation = 0, isNear = false }: DoorProps) {
  return (
    <group position={position} rotation={[0, rotation, 0]} onClick={onClick}>
      {/* Door frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.5, 4, 0.2]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      
      {/* Door */}
      <mesh position={[0, 0, 0.11]}>
        <boxGeometry args={[2, 3.5, 0.1]} />
        <meshStandardMaterial 
          color={isClassInSession ? "#1a4d1a" : "#4d1a1a"}
          metalness={0.6}
          roughness={0.3}
          emissive={isNear ? "#ffaa00" : "#000000"}
          emissiveIntensity={isNear ? 0.3 : 0}
        />
      </mesh>

      {/* Door handle */}
      <mesh position={[0.8, 0, 0.2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Label above door */}
      <Text
        position={[0, 2.5, 0.15]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>

      {/* Status indicator */}
      <mesh position={[0, -1.5, 0.15]}>
        <circleGeometry args={[0.15, 32]} />
        <meshStandardMaterial
          color={isClassInSession ? "#00ff00" : "#ff0000"}
          emissive={isClassInSession ? "#00ff00" : "#ff0000"}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Status text */}
      <Text
        position={[0, -2, 0.15]}
        fontSize={0.2}
        color={isClassInSession ? "#00ff00" : "#ff0000"}
        anchorX="center"
        anchorY="middle"
      >
        {isClassInSession ? "In Session" : "Available"}
      </Text>

      {/* "Press E" indicator when near */}
      {isNear && (
        <Text
          position={[0, -2.5, 0.15]}
          fontSize={0.3}
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
        >
          Press E to Enter
        </Text>
      )}
    </group>
  );
}
