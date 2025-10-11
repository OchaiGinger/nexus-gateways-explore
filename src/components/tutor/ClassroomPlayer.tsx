import { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface ClassroomPlayerProps {
  onPositionChange?: (position: THREE.Vector3) => void;
  onSeatProximity?: (seatIndex: number | null) => void;
  seats: Array<{ position: [number, number, number] }>;
  isSitting: boolean;
  sittingPosition: THREE.Vector3 | null;
  onSitRequest?: () => void;
  onStandRequest?: () => void;
}

export function ClassroomPlayer({ 
  onPositionChange, 
  onSeatProximity,
  seats,
  isSitting,
  sittingPosition,
  onSitRequest,
  onStandRequest
}: ClassroomPlayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const [characterScene, setCharacterScene] = useState<THREE.Object3D | null>(null);
  const [cameraRotation, setCameraRotation] = useState({ y: Math.PI, x: 0 });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const keyState = useRef({ forward: false, backward: false, left: false, right: false });

  // Load character model
  useEffect(() => {
    try {
      const gltf = useGLTF("/models/character.glb");
      if (gltf && gltf.scene) {
        gltf.scene.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        setCharacterScene(gltf.scene);
      }
    } catch (err) {
      console.error("❌ Failed to load character.glb:", err);
    }
  }, []);

  // Mouse controls for camera
  useEffect(() => {
    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown || isSitting) return;
      
      const movementX = e.movementX || 0;
      const movementY = e.movementY || 0;

      setCameraRotation(prev => ({
        y: prev.y - movementX * 0.002,
        x: Math.max(-Math.PI / 3, Math.min(Math.PI / 3, prev.x - movementY * 0.002))
      }));
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isMouseDown, isSitting]);

  // Keyboard controls including E for sit/stand
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyW" || e.code === "ArrowUp") keyState.current.forward = true;
      if (e.code === "KeyS" || e.code === "ArrowDown") keyState.current.backward = true;
      if (e.code === "KeyA" || e.code === "ArrowLeft") keyState.current.left = true;
      if (e.code === "KeyD" || e.code === "ArrowRight") keyState.current.right = true;
      if (e.code === "KeyE") {
        if (isSitting && onStandRequest) {
          onStandRequest();
        } else if (!isSitting && onSitRequest) {
          onSitRequest();
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyW" || e.code === "ArrowUp") keyState.current.forward = false;
      if (e.code === "KeyS" || e.code === "ArrowDown") keyState.current.backward = false;
      if (e.code === "KeyA" || e.code === "ArrowLeft") keyState.current.left = false;
      if (e.code === "KeyD" || e.code === "ArrowRight") keyState.current.right = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [isSitting, onSitRequest, onStandRequest]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Handle sitting state
    if (isSitting && sittingPosition) {
      // Smoothly move camera to sitting position
      camera.position.lerp(
        new THREE.Vector3(sittingPosition.x, sittingPosition.y + 1.5, sittingPosition.z),
        0.1
      );
      
      // Look at the whiteboard (position at z = -9.9, y = 5)
      const lookTarget = new THREE.Vector3(0, 5, -9.9);
      const currentLookAt = new THREE.Vector3();
      camera.getWorldDirection(currentLookAt);
      currentLookAt.multiplyScalar(10).add(camera.position);
      currentLookAt.lerp(lookTarget, 0.05);
      camera.lookAt(currentLookAt);
      
      // Position character at seat
      groupRef.current.position.copy(sittingPosition);
      groupRef.current.rotation.y = 0; // Face forward
      
      return;
    }

    // Normal FPS movement when not sitting
    camera.rotation.order = 'YXZ';
    camera.rotation.y = cameraRotation.y;
    camera.rotation.x = cameraRotation.x;

    const frontVector = new THREE.Vector3();
    camera.getWorldDirection(frontVector);
    const rightVector = new THREE.Vector3().crossVectors(frontVector, camera.up).normalize();
    
    const direction = new THREE.Vector3(0, 0, 0);
    
    if (keyState.current.forward) direction.add(frontVector);
    if (keyState.current.backward) direction.sub(frontVector);
    if (keyState.current.right) direction.add(rightVector);
    if (keyState.current.left) direction.sub(rightVector);
    
    direction.y = 0;
    
    const speed = 3;
    
    if (direction.lengthSq() > 0) {
      direction.normalize();
      
      const newPos = camera.position.clone();
      newPos.x += direction.x * speed * delta;
      newPos.z += direction.z * speed * delta;
      
      // Boundary checks for classroom (20x20 room)
      if (newPos.x > -9 && newPos.x < 9 && newPos.z > -9 && newPos.z < 9) {
        camera.position.x = newPos.x;
        camera.position.z = newPos.z;
      }
      
      // Keep camera at eye level
      camera.position.y = 1.6;
      
      // Update character position
      groupRef.current.position.set(camera.position.x, 0, camera.position.z);
      
      // Rotate character to face movement direction
      const angle = Math.atan2(direction.x, direction.z);
      groupRef.current.rotation.y = angle;
    }

    // Check seat proximity
    let closestSeat: number | null = null;
    let minDistance = Infinity;

    seats.forEach((seat, index) => {
      const distance = camera.position.distanceTo(
        new THREE.Vector3(seat.position[0], seat.position[1], seat.position[2])
      );
      
      if (distance < 1.5 && distance < minDistance) {
        closestSeat = index;
        minDistance = distance;
      }
    });

    if (onSeatProximity) {
      onSeatProximity(closestSeat);
    }

    if (onPositionChange) {
      onPositionChange(camera.position);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 8]}>
      {characterScene ? (
        <primitive object={characterScene} scale={[1.2, 1.2, 1.2]} />
      ) : (
        <mesh>
          <boxGeometry args={[0.5, 1.8, 0.5]} />
          <meshStandardMaterial color="#00ffff" />
        </mesh>
      )}
    </group>
  );
}
