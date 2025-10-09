import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";

interface PortalProps {
  position: [number, number, number];
  color: string;
  label: string;
}

export function Portal({ position, color, label }: PortalProps) {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (outerRingRef.current) {
      outerRingRef.current.rotation.y += 0.01;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.y -= 0.015;
      // Pulsing glow effect
      const intensity = 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      (innerRingRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
    }
  });

  return (
    <group position={position}>
      {/* Outer ring */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[2, 0.1, 16, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Inner ring */}
      <mesh ref={innerRingRef} position={[0, 0, 0]}>
        <torusGeometry args={[1.5, 0.15, 16, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Portal center glow */}
      <mesh position={[0, 0, 0]}>
        <circleGeometry args={[1.3, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, -2.5, 0]}
        fontSize={0.4}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {label}
      </Text>
    </group>
  );
}
