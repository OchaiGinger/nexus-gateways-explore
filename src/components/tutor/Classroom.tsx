import { Desk } from "./Desk";
import { Text } from "@react-three/drei";

interface ClassroomProps {
  roomName: string;
}

export function Classroom({ roomName }: ClassroomProps) {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Walls */}
      {/* Back wall */}
      <mesh position={[0, 5, -10]} receiveShadow>
        <boxGeometry args={[20, 10, 0.2]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>

      {/* Left wall */}
      <mesh position={[-10, 5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 10, 20]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>

      {/* Right wall */}
      <mesh position={[10, 5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 10, 20]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0f1419" />
      </mesh>

      {/* Whiteboard */}
      <mesh position={[0, 5, -9.9]} castShadow>
        <boxGeometry args={[8, 3, 0.1]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      {/* Whiteboard frame */}
      <mesh position={[0, 5, -9.85]} castShadow>
        <boxGeometry args={[8.2, 3.2, 0.05]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Room title above whiteboard */}
      <Text
        position={[0, 7.5, -9.8]}
        fontSize={0.5}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
      >
        {roomName}
      </Text>

      {/* Desks in rows */}
      {/* Row 1 */}
      <Desk position={[-3, 0, -5]} />
      <Desk position={[0, 0, -5]} />
      <Desk position={[3, 0, -5]} />

      {/* Row 2 */}
      <Desk position={[-3, 0, -2]} />
      <Desk position={[0, 0, -2]} isOccupied />
      <Desk position={[3, 0, -2]} />

      {/* Row 3 */}
      <Desk position={[-3, 0, 1]} />
      <Desk position={[0, 0, 1]} />
      <Desk position={[3, 0, 1]} isOccupied />

      {/* Row 4 */}
      <Desk position={[-3, 0, 4]} />
      <Desk position={[0, 0, 4]} />
      <Desk position={[3, 0, 4]} />

      {/* Teacher's desk */}
      <group position={[0, 0, -8]}>
        <mesh position={[0, 0.9, 0]} castShadow>
          <boxGeometry args={[2, 0.1, 1]} />
          <meshStandardMaterial color="#5a3a2a" />
        </mesh>
        <mesh position={[-0.8, 0.45, -0.35]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.9, 16]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <mesh position={[0.8, 0.45, -0.35]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.9, 16]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <mesh position={[-0.8, 0.45, 0.35]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.9, 16]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <mesh position={[0.8, 0.45, 0.35]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.9, 16]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      </group>

      {/* Ceiling lights */}
      {[-5, 0, 5].map((x, i) => (
        <group key={i} position={[x, 9.5, 0]}>
          <pointLight intensity={1} distance={15} color="#ffffff" />
          <mesh castShadow>
            <boxGeometry args={[1, 0.1, 1]} />
            <meshStandardMaterial 
              color="#ffffff" 
              emissive="#ffffff" 
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
