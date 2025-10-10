import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, Stars, OrbitControls } from "@react-three/drei";

/**
 * Bright HallwayScene - Enhanced lighting for better visibility
 */

// -----------------------------
// Helper types & data
// -----------------------------

type DoorInfo = {
  index: number;
  label: string;
  originalPosition: [number, number, number];
  isInSession: boolean;
};

const classroomsInput: DoorInfo[] = [
  { index: 0, label: "Mathematics", originalPosition: [-6, 0, -20], isInSession: true },
  { index: 1, label: "Physics", originalPosition: [6, 0, -20], isInSession: false },
  { index: 2, label: "Computer Science", originalPosition: [-6, 0, -10], isInSession: true },
  { index: 3, label: "Chemistry", originalPosition: [6, 0, -10], isInSession: false },
  { index: 4, label: "Biology", originalPosition: [-6, 0, 0], isInSession: true },
  { index: 5, label: "Literature", originalPosition: [6, 0, 0], isInSession: false },
  { index: 6, label: "History", originalPosition: [-6, 0, 10], isInSession: false },
  { index: 7, label: "Art & Design", originalPosition: [6, 0, 10], isInSession: true },
  { index: 8, label: "Robotics Lab", originalPosition: [20, 0, -8], isInSession: true },
  { index: 9, label: "Media Room", originalPosition: [26, 0, -8], isInSession: false },
];

// Corridor / geometry config
const MAIN_AREA = { minX: -9.5, maxX: 9.5, minZ: -30, maxZ: 30, minY: 0, maxY: 10 };
const BRANCH_AREA = { minX: 9.5, maxX: 30.5, minZ: -20, maxZ: 4, minY: 0, maxY: 10 };

// door appearance
const DOOR_THICKNESS = 0.15;
const DOOR_WIDTH = 1.8;
const DOOR_HEIGHT = 2.4;

// -----------------------------
// Bright Door component
// -----------------------------

function Door({
  info,
  onClick,
  hovered,
}: {
  info: DoorInfo & { worldPosition: [number, number, number]; rotationY: number };
  onClick: (index: number) => void;
  hovered: boolean;
}) {
  const { worldPosition, rotationY } = info;

  return (
    <group position={worldPosition} rotation={[0, rotationY, 0]}>
      {/* Door slab */}
      <mesh
        position={[0, DOOR_HEIGHT / 2, 0]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onClick(info.index);
        }}
      >
        <boxGeometry args={[DOOR_THICKNESS, DOOR_HEIGHT, DOOR_WIDTH]} />
        <meshStandardMaterial
          color={info.isInSession ? "#6a6aaa" : "#4a6a7a"}
          metalness={0.2}
          roughness={0.5}
        />
      </mesh>

      {/* Door handle */}
      <mesh position={[0, DOOR_HEIGHT / 2 - 0.3, DOOR_WIDTH / 2 - 0.05]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
        <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Door label with bright background */}
      <group position={[0, DOOR_HEIGHT + 0.5, 0]}>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[1.8, 0.3]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
        <Text
          fontSize={0.15}
          anchorX="center"
          anchorY="middle"
          color="#000000"
          fontWeight="bold"
        >
          {info.label}
        </Text>
      </group>

      {/* Bright hover indicator */}
      {hovered && (
        <mesh position={[0, DOOR_HEIGHT / 2, DOOR_WIDTH / 2 + 0.1]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial 
            color="#ffff00"
            emissive="#ffff00"
            emissiveIntensity={1.0}
          />
        </mesh>
      )}
    </group>
  );
}

// -----------------------------
// Bright Hallway with enhanced lighting
// -----------------------------

function Hallway({ onDoorClick, doorWorldInfos, nearDoorIndex }: { 
  onDoorClick: (i: number) => void; 
  doorWorldInfos: (DoorInfo & { worldPosition: [number, number, number]; rotationY: number })[]; 
  nearDoorIndex: number | null; 
}) {
  return (
    <group>
      {/* Bright Main floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 60]} />
        <meshStandardMaterial 
          color="#2a2a5a"
          metalness={0.1}
          roughness={0.7}
        />
      </mesh>

      {/* Bright L-branch floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[19.75, 0, -8]} receiveShadow>
        <planeGeometry args={[22, 24]} />
        <meshStandardMaterial color="#27305a" metalness={0.1} roughness={0.7} />
      </mesh>

      {/* Bright corridor walls */}
      <mesh position={[-10, 5, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.5, 10, 60]} />
        <meshStandardMaterial color="#3a3a6a" metalness={0.1} roughness={0.6} />
      </mesh>
      <mesh position={[10, 5, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.5, 10, 60]} />
        <meshStandardMaterial color="#3a3a6a" metalness={0.1} roughness={0.6} />
      </mesh>

      {/* Bright branch walls */}
      <mesh position={[19.75, 5, -20]} receiveShadow castShadow>
        <boxGeometry args={[22, 10, 0.5]} />
        <meshStandardMaterial color="#3a3a6a" metalness={0.1} roughness={0.6} />
      </mesh>
      <mesh position={[30.5, 5, -8]} receiveShadow castShadow>
        <boxGeometry args={[0.5, 10, 24]} />
        <meshStandardMaterial color="#3a3a6a" metalness={0.1} roughness={0.6} />
      </mesh>
      <mesh position={[10, 5, -8]} receiveShadow castShadow>
        <boxGeometry args={[0.5, 10, 24]} />
        <meshStandardMaterial color="#2a3a7a" metalness={0.1} roughness={0.6} />
      </mesh>

      {/* Bright ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10, 0]} receiveShadow>
        <planeGeometry args={[20, 60]} />
        <meshStandardMaterial color="#4a4a7a" metalness={0.05} roughness={0.8} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[19.75, 10, -8]} receiveShadow>
        <planeGeometry args={[22, 24]} />
        <meshStandardMaterial color="#4a4a7a" metalness={0.05} roughness={0.8} />
      </mesh>

      {/* Bright ceiling lights - Main corridor */}
      {Array.from({ length: 12 }).map((_, i) => {
        const zPos = -28 + i * 5;
        if (zPos <= 30) {
          return (
            <group key={`main-light-${i}`} position={[0, 9.8, zPos]}>
              {/* Bright point light */}
              <pointLight 
                intensity={2.0} 
                distance={20} 
                color="#ffffff"
                decay={1}
              />
              {/* Light fixture */}
              <mesh castShadow position={[0, -0.1, 0]}>
                <cylinderGeometry args={[0.4, 0.5, 0.2, 16]} />
                <meshStandardMaterial 
                  color="#ffffff" 
                  emissive="#ffffff" 
                  emissiveIntensity={0.8}
                  metalness={0.2}
                  roughness={0.3}
                />
              </mesh>
              {/* Light glow effect */}
              <mesh position={[0, -0.5, 0]} rotation={[Math.PI, 0, 0]}>
                <cylinderGeometry args={[0.8, 2.0, 2, 16]} />
                <meshBasicMaterial 
                  color="#ffffff" 
                  transparent 
                  opacity={0.2}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          );
        }
        return null;
      })}

      {/* Bright ceiling lights - Branch corridor */}
      {Array.from({ length: 6 }).map((_, i) => {
        const xPos = 11 + i * 4;
        return (
          <group key={`branch-light-${i}`} position={[xPos, 9.8, -8]}>
            <pointLight intensity={1.5} distance={15} color="#ffffff" />
            <mesh castShadow position={[0, -0.1, 0]}>
              <cylinderGeometry args={[0.3, 0.4, 0.2, 16]} />
              <meshStandardMaterial 
                color="#ffffff" 
                emissive="#ffffff" 
                emissiveIntensity={0.8}
                metalness={0.2}
                roughness={0.3}
              />
            </mesh>
          </group>
        );
      })}

      {/* Additional wall lighting */}
      {Array.from({ length: 10 }).map((_, i) => {
        const zPos = -25 + i * 5;
        return (
          <group key={`wall-light-${i}`}>
            {/* Left wall lights */}
            <pointLight position={[-9.8, 3, zPos]} intensity={0.3} distance={8} color="#4a4aff" />
            {/* Right wall lights */}
            <pointLight position={[9.8, 3, zPos]} intensity={0.3} distance={8} color="#4a4aff" />
          </group>
        );
      })}

      {/* Emergency exit signs with bright emission */}
      <group position={[0, 8, -29]}>
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[1.5, 0.4, 0.1]} />
          <meshStandardMaterial 
            color="#ff0000" 
            emissive="#ff0000" 
            emissiveIntensity={1.0}
          />
        </mesh>
        <Text 
          position={[0, 0, 0.15]} 
          fontSize={0.2} 
          color="#ffffff" 
          anchorX="center" 
          anchorY="middle"
          fontWeight="bold"
        >
          EXIT
        </Text>
      </group>

      {/* Bright direction signs */}
      <group position={[0, 7, 0]}>
        <Text 
          fontSize={0.5} 
          color="#00ffff" 
          anchorX="center" 
          anchorY="middle"
          fontWeight="bold"
        >
          ACADEMIC WING
        </Text>
      </group>

      {/* Doors */}
      {doorWorldInfos.map((d) => (
        <Door key={d.index} info={d} onClick={onDoorClick} hovered={nearDoorIndex === d.index} />
      ))}

      {/* Enhanced lighting setup */}
      <ambientLight intensity={1.0} color="#ffffff" />
      
      <directionalLight 
        position={[0, 20, 0]} 
        intensity={1.5} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        color="#ffffff"
      />
      
      <hemisphereLight 
        skyColor="#a0a0ff" 
        groundColor="#404080" 
        intensity={0.8} 
      />

      {/* Additional fill lights */}
      <pointLight position={[0, 15, 0]} intensity={0.5} distance={40} color="#ffffff" />
      <pointLight position={[20, 15, -8]} intensity={0.3} distance={30} color="#ffffff" />
    </group>
  );
}

// -----------------------------
// TutorPlayer (FPS) - Same as before
// -----------------------------

function TutorPlayer({
  doors,
  onPositionChange,
  onDoorProximity,
  speed = 6,
}: {
  doors: { position: [number, number, number] }[];
  onPositionChange: (p: THREE.Vector3) => void;
  onDoorProximity: (index: number | null) => void;
  speed?: number;
}) {
  const { camera } = useThree();
  
  const [cameraRotation, setCameraRotation] = useState({ y: 0, x: 0 });
  const [isMouseDown, setIsMouseDown] = useState(false);

  const keyState = useRef({ forward: false, backward: false, left: false, right: false });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      
      const movementX = e.movementX || 0;
      const movementY = e.movementY || 0;

      setCameraRotation(prev => ({
        y: prev.y - movementX * 0.002,
        x: Math.max(-Math.PI / 3, Math.min(Math.PI / 3, prev.x - movementY * 0.002))
      }));
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        setIsMouseDown(true);
      }
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isMouseDown]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyW" || e.code === "ArrowUp") keyState.current.forward = true;
      if (e.code === "KeyS" || e.code === "ArrowDown") keyState.current.backward = true;
      if (e.code === "KeyA" || e.code === "ArrowLeft") keyState.current.left = true;
      if (e.code === "KeyD" || e.code === "ArrowRight") keyState.current.right = true;
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
  }, []);

  const [hoveredDoorIndex, setHoveredDoorIndex] = useState<number | null>(null);
  const frontVector = new THREE.Vector3();
  const sideVector = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const tmpVec = new THREE.Vector3();
  const cameraDir = new THREE.Vector3();

  const DIST_THRESHOLD = 2.2;
  const FACING_THRESHOLD = 0.6;

  useFrame((state, delta) => {
    camera.rotation.order = 'YXZ';
    camera.rotation.y = cameraRotation.y;
    camera.rotation.x = cameraRotation.x;

    const prevPos = camera.position.clone();
    frontVector.set(0, 0, Number(keyState.current.backward) - Number(keyState.current.forward));
    sideVector.set(Number(keyState.current.right) - Number(keyState.current.left), 0, 0);
    direction.copy(frontVector).add(sideVector);
    
    if (direction.lengthSq() > 0) {
      direction.normalize();
      
      const moveX = direction.x * Math.cos(cameraRotation.y) - direction.z * Math.sin(cameraRotation.y);
      const moveZ = direction.x * Math.sin(cameraRotation.y) + direction.z * Math.cos(cameraRotation.y);
      
      camera.position.x += moveX * speed * delta;
      camera.position.z += moveZ * speed * delta;

      if (camera.position.y < 1.6) {
        camera.position.y = 1.6;
      }

      const px = camera.position.x;
      const pz = camera.position.z;
      const py = camera.position.y;

      const inMain = px >= MAIN_AREA.minX && px <= MAIN_AREA.maxX && 
                     pz >= MAIN_AREA.minZ && pz <= MAIN_AREA.maxZ &&
                     py >= MAIN_AREA.minY && py <= MAIN_AREA.maxY;
                     
      const inBranch = px >= BRANCH_AREA.minX && px <= BRANCH_AREA.maxX && 
                      pz >= BRANCH_AREA.minZ && pz <= BRANCH_AREA.maxZ &&
                      py >= BRANCH_AREA.minY && py <= BRANCH_AREA.maxY;

      if (!inMain && !inBranch) {
        camera.position.copy(prevPos);
      }
    }

    onPositionChange(camera.position.clone());
    state.camera.getWorldDirection(cameraDir);

    let closestIndex: number | null = null;
    let closestDist = Infinity;

    doors.forEach((d, i) => {
      tmpVec.set(d.position[0], d.position[1], d.position[2]);
      const toDoor = tmpVec.clone().sub(camera.position);
      const dist = toDoor.length();
      if (dist <= DIST_THRESHOLD) {
        toDoor.normalize();
        const facing = cameraDir.dot(toDoor);
        if (facing >= FACING_THRESHOLD) {
          if (dist < closestDist) {
            closestDist = dist;
            closestIndex = i;
          }
        }
      }
    });

    onDoorProximity(closestIndex);
    setHoveredDoorIndex(closestIndex);
  });

  return null;
}

// -----------------------------
// Main Bright Scene
// -----------------------------

export function HallwaySceneFPS({ onEnterClassroom }: { onEnterClassroom?: (index: number) => void }) {
  // Compute door positions with proper rotation and lowered height
  const doorWorldInfos = classroomsInput.map((c) => {
    const [xRaw, yRaw, zRaw] = c.originalPosition;

    const side = Math.abs(xRaw) >= Math.abs(zRaw) ? (xRaw < 0 ? "left" : "right") : (zRaw < 0 ? "back" : "front");

    let worldPos: [number, number, number] = [xRaw, DOOR_HEIGHT / 2, zRaw];
    let rotationY = 0;

    if (side === "left") {
      worldPos = [-9.75, DOOR_HEIGHT / 2, zRaw];
      rotationY = -Math.PI / 2; // -90deg - back against left wall
    } else if (side === "right") {
      worldPos = [9.75, DOOR_HEIGHT / 2, zRaw];
      rotationY = Math.PI / 2; // 90deg - back against right wall
    } else if (side === "back") {
      worldPos = [xRaw, DOOR_HEIGHT / 2, -29.75];
      rotationY = Math.PI; // 180deg - back against back wall
    } else {
      // front
      worldPos = [xRaw, DOOR_HEIGHT / 2, 29.75];
      rotationY = 0; // 0deg - back against front wall
    }

    return { ...c, worldPosition: worldPos, rotationY };
  });

  const doorPositionsForPlayer = doorWorldInfos.map((d) => ({ position: d.worldPosition }));
  const [nearDoorIndex, setNearDoorIndex] = useState<number | null>(null);
  const [playerPos, setPlayerPos] = useState(new THREE.Vector3(0, 1.6, 20));

  const handleDoorClick = (index: number) => {
    if (onEnterClassroom) onEnterClassroom(index);
    else {
      console.log("Enter classroom", index);
    }
  };

  return (
    <div style={{ 
      width: "100vw", 
      height: "100vh", 
      position: "fixed", 
      top: 0, 
      left: 0,
      background: "#000000"
    }}>
      <Canvas 
        shadows 
        camera={{ position: [0, 1.6, 20], fov: 75 }}
        gl={{ antialias: true }}
      >
        {/* Reduced fog for better visibility */}
        <fog attach="fog" args={["#1a1a3a", 15, 60]} />
        <Stars radius={100} depth={50} count={1000} factor={2} saturation={0} fade speed={0.5} />

        <Hallway 
          onDoorClick={handleDoorClick} 
          doorWorldInfos={doorWorldInfos} 
          nearDoorIndex={nearDoorIndex} 
        />

        <TutorPlayer
          doors={doorPositionsForPlayer}
          onPositionChange={(p) => setPlayerPos(p)}
          onDoorProximity={(idx) => setNearDoorIndex(idx)}
          speed={6}
        />

        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          mouseButtons={{
            LEFT: null,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE
          }}
        />
      </Canvas>

      {/* Bright HUD overlay */}
      {nearDoorIndex !== null && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(255, 255, 255, 0.95)",
            color: "#000000",
            padding: "20px 30px",
            borderRadius: "15px",
            border: "3px solid #ff4dff",
            zIndex: 50,
            textAlign: "center",
            boxShadow: "0 0 30px rgba(255, 77, 255, 0.8)",
          }}
        >
          <div style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "10px" }}>
            {classroomsInput[nearDoorIndex].label}
          </div>
          <div style={{ 
            marginBottom: "15px", 
            fontSize: "1.1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}>
            <div style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: classroomsInput[nearDoorIndex].isInSession ? "#00aa00" : "#ff0000"
            }}></div>
            {classroomsInput[nearDoorIndex].isInSession ? "Class in Session" : "Available"}
          </div>
          <button
            onClick={() => handleDoorClick(nearDoorIndex)}
            style={{
              padding: "12px 24px",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(45deg, #ff4dff, #00ffff)",
              color: "#000",
              fontWeight: 700,
              fontSize: "1.1rem",
              cursor: "pointer",
              boxShadow: "0 0 15px rgba(255, 77, 255, 0.5)"
            }}
          >
            Enter Classroom
          </button>
        </div>
      )}

      {/* Bright controls hint */}
      <div
        style={{
          position: "absolute",
          bottom: "25px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(255, 255, 255, 0.9)",
          padding: "12px 25px",
          color: "#000000",
          borderRadius: "10px",
          border: "2px solid #00ffff",
          zIndex: 40,
          fontFamily: "monospace",
          fontSize: "14px",
          fontWeight: "bold",
          boxShadow: "0 0 20px rgba(0, 255, 255, 0.5)"
        }}
      >
        <div>🖱️ Click + Drag to look • 🎮 WASD to move • 🚪 Look at doors to interact</div>
      </div>

      {/* Bright location indicator */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          background: "rgba(255, 255, 255, 0.9)",
          border: "2px solid #ff4dff",
          borderRadius: "10px",
          padding: "12px 18px",
          color: "#000000",
          fontSize: "14px",
          fontFamily: "monospace",
          zIndex: 10,
          fontWeight: "bold"
        }}
      >
        <div style={{ marginBottom: "5px" }}>🏫 ACADEMIC WING</div>
        <div>📍 10 Classrooms</div>
        <div>🎯 L-Shaped Layout</div>
      </div>
    </div>
  );
}

export default HallwaySceneFPS;
