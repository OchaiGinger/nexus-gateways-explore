import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
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
  cameraRef,
}: {
  seats: { position: [number, number, number] }[];
  onSeatProximity: (index: number | null) => void;
  isSitting: boolean;
  sittingPosition: THREE.Vector3 | null;
  onSitRequest: () => void;
  onStandRequest: () => void;
  onPositionChange?: (position: THREE.Vector3) => void;
  onRotationChange?: (rotation: number) => void;
  cameraRef: React.RefObject<any>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const characterRef = useRef<THREE.Group>(null);
  const velocity = useRef(new THREE.Vector3());
  
  const keys = useRef<Record<string, boolean>>({});

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
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      
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
      keys.current[e.code] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isSitting, onSitRequest, onStandRequest]);

  const [nearSeatIndex, setNearSeatIndex] = useState<number | null>(null);
  const tmpVec = new THREE.Vector3();

  // Classroom boundaries
  const CLASSROOM_BOUNDS = {
    minX: -8, maxX: 8,
    minZ: -9, maxZ: 2,
    minY: 0, maxY: 10
  };

  const SEAT_DISTANCE_THRESHOLD = 1.5;

  useFrame((state, delta) => {
    if (!characterRef.current) return;

    if (isSitting && sittingPosition) {
      // Lock position when sitting
      characterRef.current.position.copy(sittingPosition);
      characterRef.current.rotation.y = Math.PI;
    } else {
      // Get keyboard input
      const forward = keys.current["KeyW"] || keys.current["ArrowUp"];
      const backward = keys.current["KeyS"] || keys.current["ArrowDown"];
      const left = keys.current["KeyA"] || keys.current["ArrowLeft"];
      const right = keys.current["KeyD"] || keys.current["ArrowRight"];

      const inputX = (right ? 1 : 0) - (left ? 1 : 0);
      const inputZ = (forward ? 1 : 0) - (backward ? 1 : 0);

      // Camera-relative movement like Scene3D
      const camera = state.camera;
      const forwardVec = new THREE.Vector3();
      camera.getWorldDirection(forwardVec);
      forwardVec.y = 0;
      forwardVec.normalize();
      const rightVec = new THREE.Vector3();
      rightVec.crossVectors(forwardVec, camera.up).normalize();
      const moveDir = new THREE.Vector3();
      moveDir.copy(forwardVec).multiplyScalar(inputZ).addScaledVector(rightVec, inputX);

      const speed = 6;
      if (moveDir.lengthSq() > 0.0001) {
        moveDir.normalize();
        const targetVel = moveDir.multiplyScalar(speed);
        velocity.current.lerp(targetVel, 0.15);
      } else {
        velocity.current.lerp(new THREE.Vector3(), 0.12);
      }

      const predictedX = characterRef.current.position.x + velocity.current.x * delta;
      const predictedZ = characterRef.current.position.z + velocity.current.z * delta;

      // Boundary checks
      if (predictedX >= CLASSROOM_BOUNDS.minX && predictedX <= CLASSROOM_BOUNDS.maxX &&
          predictedZ >= CLASSROOM_BOUNDS.minZ && predictedZ <= CLASSROOM_BOUNDS.maxZ) {
        characterRef.current.position.x = predictedX;
        characterRef.current.position.z = predictedZ;
      } else {
        velocity.current.set(0, velocity.current.y, 0);
      }

      // Rotate character to face movement direction
      if (velocity.current.lengthSq() > 0.0001) {
        const yaw = Math.atan2(velocity.current.x, velocity.current.z);
        characterRef.current.rotation.y = THREE.MathUtils.damp(
          characterRef.current.rotation.y,
          yaw,
          6,
          delta
        );
      }
    }

    // Notify parent components
    if (onPositionChange) {
      onPositionChange(characterRef.current.position);
    }
    if (onRotationChange) {
      onRotationChange(characterRef.current.rotation.y);
    }

    // Check seat proximity
    let closestIndex: number | null = null;
    let closestDist = Infinity;

    seats.forEach((seat, i) => {
      tmpVec.set(seat.position[0], seat.position[1], seat.position[2]);
      const dist = tmpVec.distanceTo(characterRef.current!.position);
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
      } else if (keys.current["KeyW"] || keys.current["KeyS"] || 
                 keys.current["KeyA"] || keys.current["KeyD"] ||
                 keys.current["ArrowUp"] || keys.current["ArrowDown"] ||
                 keys.current["ArrowLeft"] || keys.current["ArrowRight"]) {
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
      <group ref={characterRef} position={[0, 0, 5]}>
        <primitive 
          object={characterModel} 
          scale={0.8}
          rotation={[0, Math.PI, 0]}
        />
      </group>
    </group>
  );
}

export default ClassroomPlayer;
