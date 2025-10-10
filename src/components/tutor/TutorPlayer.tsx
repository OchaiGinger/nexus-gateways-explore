import { useRef, useEffect, useState } from "react";
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
  const characterRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const velocity = useRef(new THREE.Vector3());
  const isMoving = useRef(false);
  const nearDoor = useRef<number | null>(null);

  // Load the character model
  const { scene } = useGLTF("/models/character.glb");
  
  useEffect(() => {
    if (scene) {
      const modelClone = scene.clone();
      // Scale and position the character appropriately for FPS view
      modelClone.scale.set(1, 1, 1);
      modelClone.position.set(0, 0, 0);
      
      // Enable shadows for all meshes
      modelClone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          // Make materials more visible in FPS
          if (child.material) {
            child.material.emissive = new THREE.Color(0x222222);
            child.material.emissiveIntensity = 0.1;
          }
        }
      });
      
      setModel(modelClone);
    }
  }, [scene]);

  const [sub] = useKeyboardControls();
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false
  });

  // Update movement state
  useEffect(() => {
    return sub(
      (state) => {
        moveState.current = {
          forward: state.forward,
          backward: state.backward,
          left: state.left,
          right: state.right
        };
      }
    );
  }, [sub]);

  useFrame((state, delta) => {
    if (!groupRef.current || !characterRef.current) return;

    const move = moveState.current;
    
    // Calculate movement direction relative to camera
    const moveX = (move.right ? 1 : 0) - (move.left ? 1 : 0);
    const moveZ = (move.forward ? 1 : 0) - (move.backward ? 1 : 0);

    // Check if player is moving
    isMoving.current = moveX !== 0 || moveZ !== 0;

    if (isMoving.current) {
      const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
      const normalizedX = moveX / length;
      const normalizedZ = moveZ / length;
      
      // Use camera rotation for movement direction (FPS style)
      const sin = Math.sin(cameraRotation);
      const cos = Math.cos(cameraRotation);
      
      // Calculate world-space direction
      const worldX = normalizedX * cos - normalizedZ * sin;
      const worldZ = normalizedX * sin + normalizedZ * cos;
      
      // Set velocity based on movement direction
      velocity.current.x = worldX * 8;
      velocity.current.z = worldZ * 8;

      // Rotate character to face movement direction in FPS
      if (velocity.current.length() > 0.1) {
        const targetAngle = Math.atan2(velocity.current.x, velocity.current.z);
        characterRef.current.rotation.y = THREE.MathUtils.lerp(
          characterRef.current.rotation.y,
          targetAngle,
          0.2
        );
      }
    } else {
      // Smooth stop
      velocity.current.x *= 0.8;
      velocity.current.z *= 0.8;
      
      if (Math.abs(velocity.current.x) < 0.1) velocity.current.x = 0;
      if (Math.abs(velocity.current.z) < 0.1) velocity.current.z = 0;
    }

    // Apply movement with delta time for consistent speed
    groupRef.current.position.x += velocity.current.x * delta;
    groupRef.current.position.z += velocity.current.z * delta;

    // Boundary limits for hallway
    groupRef.current.position.x = Math.max(-8, Math.min(8, groupRef.current.position.x));
    groupRef.current.position.z = Math.max(-28, Math.min(28, groupRef.current.position.z));

    // FPS Character animation (subtle movements)
    if (model && isFPS) {
      if (isMoving.current) {
        // Subtle bobbing animation for FPS
        model.position.y = Math.sin(state.clock.elapsedTime * 10) * 0.05;
        // Slight tilt when moving sideways
        model.rotation.z = Math.sin(state.clock.elapsedTime * 8) * 0.02 * moveX;
      } else {
        // Return to normal position
        model.position.y = 0;
        model.rotation.z = 0;
      }
    }

    // Check door proximity
    let closestDoor: number | null = null;
    let minDistance = Infinity;

    doors.forEach((door, index) => {
      const doorPosition = new THREE.Vector3(door.position[0], door.position[1], door.position[2]);
      const distance = groupRef.current!.position.distanceTo(doorPosition);
      
      if (distance < 2.5 && distance < minDistance) {
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
      onPositionChange(groupRef.current.position.clone());
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -20]}>
      {/* FPS Character View - Character is visible in first person */}
      <group ref={characterRef} position={[0, -1.6, 0]}>
        {model && (
          <primitive 
            object={model}
            scale={1.2} // Slightly larger for better FPS visibility
          />
        )}
        
        {/* Fallback character if model fails to load */}
        {!model && (
          <group>
            {/* Simple FPS body */}
            <mesh position={[0, 0.5, 0]}>
              <capsuleGeometry args={[0.3, 1, 8, 16]} />
              <meshStandardMaterial
                color="#4a4a8a"
                metalness={0.3}
                roughness={0.7}
              />
            </mesh>
            {/* Arms */}
            <mesh position={[0.4, 0.3, 0]} rotation={[0, 0, 0.2]}>
              <boxGeometry args={[0.15, 0.6, 0.15]} />
              <meshStandardMaterial color="#4a4a8a" />
            </mesh>
            <mesh position={[-0.4, 0.3, 0]} rotation={[0, 0, -0.2]}>
              <boxGeometry args={[0.15, 0.6, 0.15]} />
              <meshStandardMaterial color="#4a4a8a" />
            </mesh>
          </group>
        )}
      </group>

      {/* FPS Weapon/Hands overlay */}
      {isFPS && (
        <group position={[0.3, -0.8, -0.3]}>
          {/* Weapon base */}
          <mesh position={[0, 0.2, 0]} rotation={[0.1, 0, 0.05]}>
            <boxGeometry args={[0.08, 0.25, 1]} />
            <meshStandardMaterial
              color="#333333"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          
          {/* Weapon barrel */}
          <mesh position={[0, 0.2, -0.6]} rotation={[0.1, 0, 0.05]}>
            <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
            <meshStandardMaterial
              color="#222222"
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          
          {/* Weapon handle */}
          <mesh position={[0, 0, -0.1]} rotation={[0.1, 0, 0.05]}>
            <boxGeometry args={[0.12, 0.08, 0.3]} />
            <meshStandardMaterial
              color="#444444"
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>
          
          {/* Slight weapon bob when moving */}
          <group position={[
            isMoving.current ? Math.sin(Date.now() * 0.01) * 0.02 : 0,
            isMoving.current ? Math.sin(Date.now() * 0.008) * 0.02 : 0,
            0
          ]}>
            {/* Reticle dot (always visible in center) */}
            <mesh position={[0, 0.5, 0.8]} visible={false}>
              <sphereGeometry args={[0.005, 8, 8]} />
              <meshBasicMaterial color="#ff4dff" />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
}

// Preload the model
useGLTF.preload("/models/character.glb");

