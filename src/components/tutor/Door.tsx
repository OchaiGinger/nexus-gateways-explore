import { Text } from "@react-three/drei";

interface DoorProps {
  position: [number, number, number];
  label: string;
  isClassInSession: boolean;
  onClick?: () => void;
}

export function Door({ position, label, isClassInSession, onClick }: DoorProps) {
  const doorColor = isClassInSession ? "#1f7a1f" : "#8b0000";
  const glassColor = isClassInSession ? "#aaf0d1" : "#ffe4e1";

  return (
    <group position={position} onClick={onClick}>
      {/* Frame */}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[2.4, 3.6, 0.2]} />
        <meshStandardMaterial color="#cccccc" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Door panel */}
      <mesh position={[0, 1.8, 0.11]}>
        <boxGeometry args={[2, 3.4, 0.1]} />
        <meshStandardMaterial color={doorColor} metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Glass window */}
      <mesh position={[0, 2.4, 0.12]}>
        <planeGeometry args={[1, 0.8]} />
        <meshPhysicalMaterial
          color={glassColor}
          transmission={0.7}
          transparent
          roughness={0.2}
          metalness={0.1}
          reflectivity={1}
          ior={1.45}
        />
      </mesh>

      {/* Handle */}
      <mesh position={[0.8, 1.8, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.4, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Label */}
      <Text position={[0, 3.8, 0.1]} fontSize={0.25} color="#222" anchorX="center" anchorY="middle">
        {label}
      </Text>

      {/* Light indicator */}
      <mesh position={[0, 0.15, 0.15]}>
        <circleGeometry args={[0.15, 32]} />
        <meshStandardMaterial
          color={isClassInSession ? "#00ff00" : "#ff0000"}
          emissive={isClassInSession ? "#00ff00" : "#ff0000"}
          emissiveIntensity={1.5}
        />
      </mesh>
    </group>
  );
}


