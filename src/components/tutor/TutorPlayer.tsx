import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface TutorPlayerProps {
  onPositionChange?: (position: THREE.Vector3) => void;
  cameraRotation?: number;
  onDoorProximity?: (doorIndex: number | null) => void;
  doors: Array<{ position: [number, number, number]; side?: string }>;
  isFPS?: boolean;
}

export function TutorPlayer({ 
  onPositionChange, 
  cameraRotation = 0,
  onDoorProximity,
  doors,
  isFPS = true
}: TutorPlayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const nearDoor = useRef<number | null>(null);

  // Load the character model
  const { scene } = useGLTF("/models/character.glb");
  
  // Clone the scene for proper instancing
  const characterModel = useRef<THREE.Group>();
  useEffect(() => {
    if (scene) {
      characterModel.current = scene.clone();
      // Scale and position the character appropriately
      if (characterModel.current) {
        characterModel.current.scale.set(1, 1, 1);
        characterModel.current.position.set(0, -1, 0);
        characterModel.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
      }
    }
  }, [scene]);

  const forward = useKeyboardControls((state) => state.forward);
  const backward = useKeyboardControls((state) => state.backward);
  const left = useKeyboardControls((state) => state.left);
  const right = useKeyboardControls((state) => state.right);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Calculate movement direction relative to camera
    const moveX = (right ? 1 : 0) - (left ? 1 : 0);
    const moveZ = (forward ? 1 : 0) - (backward ? 1 : 0);

    if (moveX !== 0 || moveZ !== 0) {
      const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
      const normalizedX = moveX / length;
      const normalizedZ = moveZ / length;
      
      const sin = Math.sin(cameraRotation);
      const cos = Math.cos(cameraRotation);
      
      // Calculate direction relative to camera
      direction.current.set(
        normalizedX * cos - normalizedZ * sin,
        0,
        normalizedX * sin + normalizedZ * cos
      );
      
      velocity.current.lerp(direction.current.multiplyScalar(8), 0.2);

      // Rotate character to face movement direction
      if (velocity.current.length() > 0.1) {
        const targetAngle = Math.atan2(velocity.current.x, velocity.current.z);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          targetAngle,
          0.2
        );
      }
    } else {
      velocity.current.lerp(new THREE.Vector3(), 0.2);
    }

    // Apply movement
    groupRef.current.position.x += velocity.current.x * delta;
    groupRef.current.position.z += velocity.current.z * delta;

    // Boundary limits for hallway (adjust based on your hallway size)
    groupRef.current.position.x = Math.max(-8, Math.min(8, groupRef.current.position.x));
    groupRef.current.position.z = Math.max(-28, Math.min(28, groupRef.current.position.z));

    // Check door proximity
    let closestDoor: number | null = null;
    let minDistance = Infinity;

    doors.forEach((door, index) => {
      const doorPosition = new THREE.Vector3(door.position[0], door.position[1], door.position[2]);
      const distance = groupRef.current!.position.distanceTo(doorPosition);
      
      if (distance < 3 && distance < minDistance) {
        closestDoor = index;
        minDistance = distance;
      }
    });

    if (closestDoor !== nearDoor.current) {
      nearDoor.current = closestDoor;
      if (onDoorProximity) {
        onDoorProximity(closestDoor);
      }
    }

    if (onPositionChange) {
      onPositionChange(groupRef.current.position);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -20]}>
      {characterModel.current && (
        <primitive 
          object={characterModel.current} 
          scale={1}
          position={[0, 0, 0]}
        />
      )}
      
      {/* Fallback simple character if model fails to load */}
      {!characterModel.current && (
        <group>
          <mesh castShadow position={[0, 1, 0]}>
            <capsuleGeometry args={[0.3, 1.2, 8, 16]} />
            <meshStandardMaterial
              color="#ff4dff"
              emissive="#ff4dff"
              emissiveIntensity={0.3}
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>
          <mesh castShadow position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial
              color="#ff4dff"
              emissive="#ff4dff"
              emissiveIntensity={0.2}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

// Preload the model
useGLTF.preload("/models/character.glb");
