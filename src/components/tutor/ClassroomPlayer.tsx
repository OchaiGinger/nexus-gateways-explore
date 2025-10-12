import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";

function ClassroomPlayer({
  seats,
  onSeatProximity,
  isSitting,
  sittingPosition,
  onSitRequest,
  onStandRequest,
  onPositionChange,
  onRotationChange,
}: {
  seats: { position: [number, number, number] }[];
  onSeatProximity: (index: number | null) => void;
  isSitting: boolean;
  sittingPosition: THREE.Vector3 | null;
  onSitRequest: () => void;
  onStandRequest: () => void;
  onPositionChange?: (position: THREE.Vector3) => void;
  onRotationChange?: (rotation: number) => void;
}) {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const characterRef = useRef<THREE.Group>(null);
  
  const [cameraRotation, setCameraRotation] = useState({ y: Math.PI, x: 0 });
  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 0, 5));
  const [playerRotation, setPlayerRotation] = useState(Math.PI);

  const keyState = useRef({ 
    forward: false, 
    backward: false, 
    left: false, 
    right: false 
  });

  // Load character model
  const { scene, animations } = useGLTF("/models/character.glb");
  const { actions } = useAnimations(animations, characterRef);

  // Clone the scene for proper instancing
  const characterModel = React.useMemo(() => {
    const model = scene.clone();
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return model;
  }, [scene]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const movementX = e.movementX || 0;
      const movementY = e.movementY || 0;

      const newRotation = {
        y: cameraRotation.y - movementX * 0.002,
        x: Math.max(-Math.PI / 3, Math.min(Math.PI / 3, cameraRotation.x - movementY * 0.002))
      };

      setCameraRotation(newRotation);
      setPlayerRotation(newRotation.y);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyW" || e.code === "ArrowUp") keyState.current.forward = true;
      if (e.code === "KeyS" || e.code === "ArrowDown") keyState.current.backward = true;
      if (e.code === "KeyA" || e.code === "ArrowLeft") keyState.current.left = true;
      if (e.code === "KeyD" || e.code === "ArrowRight") keyState.current.right = true;
      
      // Sit/Stand with E key
      if (e.code === "KeyE") {
        if (isSitting) {
          onStandRequest();
        } else if (nearSeatIndex !== null) {
          onSitRequest();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyW" || e.code === "ArrowUp") keyState.current.forward = false;
      if (e.code === "KeyS" || e.code === "ArrowDown") keyState.current.backward = false;
      if (e.code === "KeyA" || e.code === "ArrowLeft") keyState.current.left = false;
      if (e.code === "KeyD" || e.code === "ArrowRight") keyState.current.right = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [cameraRotation, isSitting, onSitRequest, onStandRequest]);

  const [nearSeatIndex, setNearSeatIndex] = useState<number | null>(null);
  const frontVector = new THREE.Vector3();
  const sideVector = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const tmpVec = new THREE.Vector3();

  // Classroom boundaries - prevent reaching front
  const CLASSROOM_BOUNDS = {
    minX: -8, maxX: 8,
    minZ: -9, maxZ: 2, // Prevent going to front (whiteboard area)
    minY: 0, maxY: 10
  };

  const SEAT_DISTANCE_THRESHOLD = 1.5;

  useFrame((state, delta) => {
    // Update camera rotation
    camera.rotation.order = 'YXZ';
    camera.rotation.y = cameraRotation.y;
    camera.rotation.x = cameraRotation.x;

    if (isSitting && sittingPosition) {
      // Lock position when sitting
      camera.position.set(
        sittingPosition.x,
        sittingPosition.y + 1.2, // Eye level when sitting
        sittingPosition.z
      );
      
      if (characterRef.current) {
        characterRef.current.position.copy(sittingPosition);
        characterRef.current.rotation.y = Math.PI; // Face forward when sitting
      }
      
      // Focus camera on whiteboard when sitting
      camera.lookAt(0, 2, -10);
    } else {
      // Normal movement
      const prevPos = playerPosition.clone();
      
      // Get camera forward and right vectors
      camera.getWorldDirection(frontVector);
      const rightVector = new THREE.Vector3().crossVectors(frontVector, camera.up).normalize();
      
      // Reset direction
      direction.set(0, 0, 0);
      
      // Apply movement relative to camera direction
      if (keyState.current.forward) direction.add(frontVector);
      if (keyState.current.backward) direction.sub(frontVector);
      if (keyState.current.right) direction.add(rightVector);
      if (keyState.current.left) direction.sub(rightVector);
      
      // Remove Y component to keep movement horizontal
      direction.y = 0;
      
      if (direction.lengthSq() > 0) {
        direction.normalize();
        
        // Apply movement
        const newPos = playerPosition.clone();
        newPos.x += direction.x * 3 * delta;
        newPos.z += direction.z * 3 * delta;

        // Boundary checks
        if (newPos.x >= CLASSROOM_BOUNDS.minX && newPos.x <= CLASSROOM_BOUNDS.maxX &&
            newPos.z >= CLASSROOM_BOUNDS.minZ && newPos.z <= CLASSROOM_BOUNDS.maxZ) {
          setPlayerPosition(newPos);
        }
      }

      // TPS camera - position behind and above character
      const cameraDistance = 3;
      const cameraHeight = 1.5;
      const cameraOffset = new THREE.Vector3(
        Math.sin(cameraRotation.y) * cameraDistance,
        cameraHeight,
        Math.cos(cameraRotation.y) * cameraDistance
      );
      camera.position.copy(playerPosition).add(cameraOffset);
      
      // Look at character
      const lookAtPos = playerPosition.clone();
      lookAtPos.y += 1;
      camera.lookAt(lookAtPos);

      // Update character position and rotation
      if (characterRef.current) {
        characterRef.current.position.copy(playerPosition);
        characterRef.current.rotation.y = playerRotation;
      }
    }

    // Notify parent components of position and rotation changes
    if (onPositionChange) {
      onPositionChange(playerPosition);
    }
    if (onRotationChange) {
      onRotationChange(playerRotation);
    }

    // Check seat proximity
    let closestIndex: number | null = null;
    let closestDist = Infinity;

    seats.forEach((seat, i) => {
      tmpVec.set(seat.position[0], seat.position[1], seat.position[2]);
      const dist = tmpVec.distanceTo(playerPosition);
      if (dist <= SEAT_DISTANCE_THRESHOLD && dist < closestDist) {
        closestDist = dist;
        closestIndex = i;
      }
    });

    setNearSeatIndex(closestIndex);
    onSeatProximity(closestIndex);

    // Update animations
    if (actions) {
      if (isSitting) {
        if (actions.Sit) {
          actions.Sit.play();
          if (actions.Walk) actions.Walk.stop();
          if (actions.Idle) actions.Idle.stop();
        }
      } else if (keyState.current.forward || keyState.current.backward || 
                 keyState.current.left || keyState.current.right) {
        if (actions.Walk) {
          actions.Walk.play();
          if (actions.Idle) actions.Idle.stop();
          if (actions.Sit) actions.Sit.stop();
        }
      } else {
        if (actions.Idle) {
          actions.Idle.play();
          if (actions.Walk) actions.Walk.stop();
          if (actions.Sit) actions.Sit.stop();
        }
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* 3D Character */}
      <group ref={characterRef} position={playerPosition} rotation={[0, playerRotation, 0]}>
        <primitive 
          object={characterModel} 
          scale={0.8}
          rotation={[0, Math.PI, 0]} // Face forward initially
        />
      </group>
    </group>
  );
}

export default ClassroomPlayer;
