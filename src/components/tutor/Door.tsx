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
      {/* Door frame - bigger */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.5, 5, 0.2]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      
      {/* Door - bigger */}
      <mesh position={[0, 0, 0.11]}>
        <boxGeometry args={[3, 4.5, 0.1]} />
        <meshStandardMaterial 
          color={isClassInSession ? "#1a4d1a" : "#4d1a1a"}
          metalness={0.6}
          roughness={0.3}
          emissive={isNear ? "#ffaa00" : "#000000"}
          emissiveIntensity={isNear ? 0.3 : 0}
        />
      </mesh>

      {/* Door handle - adjusted for bigger door */}
      <mesh position={[1.2, 0, 0.2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.6, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Label above door - adjusted for bigger door */}
      <Text
        position={[0, 3, 0.15]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>

      {/* Status indicator - adjusted for bigger door */}
      <mesh position={[0, -2, 0.15]}>
        <circleGeometry args={[0.2, 32]} />
        <meshStandardMaterial
          color={isClassInSession ? "#00ff00" : "#ff0000"}
          emissive={isClassInSession ? "#00ff00" : "#ff0000"}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Status text - adjusted for bigger door */}
      <Text
        position={[0, -2.6, 0.15]}
        fontSize={0.25}
        color={isClassInSession ? "#00ff00" : "#ff0000"}
        anchorX="center"
        anchorY="middle"
      >
        {isClassInSession ? "In Session" : "Available"}
      </Text>

      {/* "Press E" indicator when near - adjusted for bigger door */}
      {isNear && (
        <Text
          position={[0, -3.2, 0.15]}
          fontSize={0.35}
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
