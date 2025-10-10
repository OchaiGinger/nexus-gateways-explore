import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, Stars, OrbitControls } from "@react-three/drei";

/**
 * Enhanced HallwayScene with better styling and properly positioned doors
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

// door appearance - lowered height
const DOOR_THICKNESS = 0.15;
const DOOR_WIDTH = 1.8;
const DOOR_HEIGHT = 2.4;
const DOOR_FRAME_WIDTH = 0.1;

// -----------------------------
// Enhanced Door component
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
      {/* Door frame */}
      <mesh position={[0, DOOR_HEIGHT / 2 + 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[DOOR_THICKNESS + 0.05, DOOR_HEIGHT + 0.2, DOOR_WIDTH + 0.1]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.3} roughness={0.7} />
      </mesh>

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
          color={info.isInSession ? "#4a4a8a" : "#2a4a5a"}
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>

      {/* Door handle */}
      <mesh position={[0, DOOR_HEIGHT / 2 - 0.3, DOOR_WIDTH / 2 - 0.05]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
        <meshStandardMaterial color="#cccccc" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Session status indicator */}
      <mesh position={[0, DOOR_HEIGHT + 0.15, 0]} castShadow>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial 
          color={info.isInSession ? "#00ff88" : "#ff4444"}
          emissive={info.isInSession ? "#00ff88" : "#ff4444"}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Door label with background */}
      <group position={[0, DOOR_HEIGHT + 0.5, 0]}>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[1.8, 0.3]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.7} />
        </mesh>
        <Text
          fontSize={0.15}
          anchorX="center"
          anchorY="middle"
          color="#ffffff"
          font="/fonts/helvetiker_regular.typeface.json"
        >
          {info.label}
        </Text>
      </group>

      {/* Hover glow effect */}
      {hovered && (
        <mesh position={[0, DOOR_HEIGHT / 2, 0]}>
          <boxGeometry args={[DOOR_THICKNESS + 0.1, DOOR_HEIGHT + 0.1, DOOR_WIDTH + 0.1]} />
          <meshBasicMaterial 
            color="#ff4dff" 
            transparent 
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
}

// -----------------------------
// Enhanced Hallway with better styling
// -----------------------------

function Hallway({ onDoorClick, doorWorldInfos, nearDoorIndex }: { 
  onDoorClick: (i: number) => void; 
  doorWorldInfos: (DoorInfo & { worldPosition: [number, number, number]; rotationY: number })[]; 
  nearDoorIndex: number | null; 
}) {
  return (
    <group>
      {/* Enhanced Main floor with texture pattern */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 60, 20, 60]} />
        <meshStandardMaterial 
          color="#0a0a2a"
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>

      {/* Floor pattern overlay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[20, 60, 20, 60]} />
        <meshBasicMaterial 
          color="#1a1a4a" 
          wireframe 
          transparent 
          opacity={0.1}
        />
      </mesh>

      {/* L-branch floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[19.75, 0, -8]} receiveShadow>
        <planeGeometry args={[22, 24, 22, 24]} />
        <meshStandardMaterial color="#071038" metalness={0.1} roughness={0.8} />
      </mesh>

      {/* L-branch floor pattern */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[19.75, 0.01, -8]}>
        <planeGeometry args={[22, 24, 22, 24]} />
        <meshBasicMaterial color="#1a1a4a" wireframe transparent opacity={0.1} />
      </mesh>

      {/* Baseboards/Trim */}
      <mesh position={[-9.75, 0.1, 0]} receiveShadow>
        <boxGeometry args={[0.1, 0.2, 60]} />
        <meshStandardMaterial color="#3a3a5a" metalness={0.2} roughness={0.6} />
      </mesh>
      <mesh position={[9.75, 0.1, 0]} receiveShadow>
        <boxGeometry args={[0.1, 0.2, 60]} />
        <meshStandardMaterial color="#3a3a5a" metalness={0.2} roughness={0.6} />
      </mesh>

      {/* Enhanced Main corridor walls with texture */}
      <mesh position={[-10, 5, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.5, 10, 60]} />
        <meshStandardMaterial 
          color="#1a1a3a" 
          metalness={0.1}
          roughness={0.7}
        />
      </mesh>
      <mesh position={[10, 5, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.5, 10, 60]} />
        <meshStandardMaterial 
          color="#1a1a3a"
          metalness={0.1}
          roughness={0.7}
        />
      </mesh>

      {/* Enhanced Branch walls */}
      <mesh position={[19.75, 5, -20]} receiveShadow castShadow>
        <boxGeometry args={[22, 10, 0.5]} />
        <meshStandardMaterial color="#1a1a3a" metalness={0.1} roughness={0.7} />
      </mesh>
      <mesh position={[30.5, 5, -8]} receiveShadow castShadow>
        <boxGeometry args={[0.5, 10, 24]} />
        <meshStandardMaterial color="#1a1a3a" metalness={0.1} roughness={0.7} />
      </mesh>
      <mesh position={[10, 5, -8]} receiveShadow castShadow>
        <boxGeometry args={[0.5, 10, 24]} />
        <meshStandardMaterial color="#16214a" metalness={0.1} roughness={0.7} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10, 0]} receiveShadow>
        <planeGeometry args={[20, 60]} />
        <meshStandardMaterial color="#050520" metalness={0.05} roughness={0.9} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[19.75, 10, -8]} receiveShadow>
        <planeGeometry args={[22, 24]} />
        <meshStandardMaterial color="#050520" metalness={0.05} roughness={0.9} />
      </mesh>

      {/* Ceiling grid pattern */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 9.99, 0]}>
        <planeGeometry args={[20, 60, 20, 60]} />
        <meshBasicMaterial color="#3a3a8a" wireframe transparent opacity={0.05} />
      </mesh>

      {/* Enhanced Lighting - Ceiling light fixtures */}
      {Array.from({ length: 12 }).map((_, i) => {
        const zPos = -28 + i * 5;
        if (zPos <= 30) {
          return (
            <group key={`main-${i}`} position={[0, 9.5, zPos]}>
              <pointLight intensity={0.8} distance={15} color="#4a4aff" />
              <mesh castShadow>
                <cylinderGeometry args={[0.3, 0.4, 0.1, 16]} />
                <meshStandardMaterial 
                  color="#ffffff" 
                  emissive="#4a4aff" 
                  emissiveIntensity={0.3}
                  metalness={0.8}
                  roughness={0.2}
                />
              </mesh>
              {/* Light cone */}
              <mesh rotation={[Math.PI, 0, 0]} position={[0, -0.3, 0]}>
                <cylinderGeometry args={[0.5, 1.5, 1, 16]} />
                <meshBasicMaterial 
                  color="#4a4aff" 
                  transparent 
                  opacity={0.1}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          );
        }
        return null;
      })}

      {/* Branch lighting */}
      {Array.from({ length: 6 }).map((_, i) => {
        const xPos = 11 + i * 4;
        return (
          <group key={`branch-${i}`} position={[xPos, 9.5, -8]}>
            <pointLight intensity={0.6} distance={12} color="#4a4aff" />
            <mesh castShadow>
              <cylinderGeometry args={[0.25, 0.35, 0.1, 16]} />
              <meshStandardMaterial 
                color="#ffffff" 
                emissive="#4a4aff" 
                emissiveIntensity={0.3}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          </group>
        );
      })}

      {/* Emergency exit signs */}
      <group position={[0, 8, -29]}>
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[1, 0.3, 0.05]} />
          <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.5} />
        </mesh>
        <Text position={[0, 0, 0.12]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle">
          EXIT
        </Text>
      </group>

      {/* Direction signs */}
      <group position={[0, 7, 0]}>
        <Text fontSize={0.4} color="#00ffff" anchorX="center" anchorY="middle">
          ACADEMIC WING
        </Text>
        <Text position={[0, -0.5, 0]} fontSize={0.2} color="#ff4dff" anchorX="center" anchorY="middle">
          Departments A-L
        </Text>
      </group>

      {/* Doors */}
      {doorWorldInfos.map((d) => (
        <Door key={d.index} info={d} onClick={onDoorClick} hovered={nearDoorIndex === d.index} />
      ))}

      {/* Additional ambient lighting */}
      <ambientLight intensity={0.4} color="#1a1a4a" />
      <directionalLight 
        position={[20, 30, 20]} 
        intensity={0.6} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      <hemisphereLight 
        skyColor="#1a1a4a" 
        groundColor="#050515" 
        intensity={0.3} 
      />
    </group>
  );
}

// -----------------------------
// TutorPlayer (FPS) - Same as before but kept for completeness
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
// Main Enhanced Scene
// -----------------------------

export function HallwaySceneFPS({ onEnterClassroom }: { onEnterClassroom?: (index: number) => void }) {
  // Compute door positions with proper rotation and lowered height
  const doorWorldInfos = classroomsInput.map((c) => {
    const [xRaw, yRaw, zRaw] = c.originalPosition;

    const side = Math.abs(xRaw) >= Math.abs(zRaw) ? (xRaw < 0 ? "left" : "right") : (zRaw < 0 ? "back" : "front");

    let worldPos: [number, number, number] = [xRaw, DOOR_HEIGHT / 2, zRaw]; // Centered on door height
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
      inset: 0,
      background: "linear-gradient(135deg, #0a0a2a 0%, #1a1a4a 50%, #0a0a1a 100%)"
    }}>
      <Canvas shadows camera={{ position: [0, 1.6, 20], fov: 75 }}>
        <fog attach="fog" args={["#0a0a2a", 5, 50]} />
        <Stars radius={100} depth={50} count={3000} factor={6} saturation={0.2} fade speed={2} />

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

      {/* Enhanced HUD overlay */}
      {nearDoorIndex !== null && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,74,0.9) 100%)",
            color: "#ffffff",
            padding: "20px 30px",
            borderRadius: "15px",
            border: "2px solid #ff4dff",
            zIndex: 50,
            textAlign: "center",
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 30px rgba(255, 77, 255, 0.3)",
            minWidth: "250px"
          }}
        >
          <div style={{ 
            fontSize: "1.4rem", 
            fontWeight: 700,
            background: "linear-gradient(45deg, #ff4dff, #00ffff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "8px"
          }}>
            {classroomsInput[nearDoorIndex].label}
          </div>
          <div style={{ 
            marginTop: 6, 
            opacity: 0.9,
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}>
            <div style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: classroomsInput[nearDoorIndex].isInSession ? "#00ff88" : "#ff4444",
              boxShadow: `0 0 10px ${classroomsInput[nearDoorIndex].isInSession ? "#00ff88" : "#ff4444"}`
            }}></div>
            {classroomsInput[nearDoorIndex].isInSession ? "Class in Session" : "Available"}
          </div>
          <div style={{ marginTop: 15 }}>
            <button
              onClick={() => handleDoorClick(nearDoorIndex)}
              style={{ 
                padding: "10px 20px", 
                borderRadius: "10px", 
                border: "none", 
                background: "linear-gradient(45deg, #ff4dff, #00ffff)",
                color: "#000", 
                fontWeight: 700,
                fontSize: "1rem",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 0 15px rgba(255, 77, 255, 0.5)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 77, 255, 0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 0 15px rgba(255, 77, 255, 0.5)";
              }}
            >
              Enter Classroom
            </button>
          </div>
        </div>
      )}

      {/* Enhanced controls hint */}
      <div
        style={{
          position: "absolute",
          bottom: "25px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(26,26,74,0.8) 100%)",
          padding: "12px 25px",
          color: "#00ffff",
          borderRadius: "12px",
          border: "1px solid #00ffff",
          zIndex: 40,
          fontFamily: "monospace",
          fontSize: "14px",
          backdropFilter: "blur(5px)",
          boxShadow: "0 0 20px rgba(0, 255, 255, 0.2)"
        }}
      >
        <div>🖱️ Click + Drag to look • 🎮 WASD to move • 🚪 Look at doors to interact</div>
      </div>

      {/* Location indicator */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          background: "linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(26,26,74,0.8) 100%)",
          border: "1px solid #ff4dff",
          borderRadius: "10px",
          padding: "12px 18px",
          color: "#ff4dff",
          fontSize: "14px",
          fontFamily: "monospace",
          zIndex: 10,
          backdropFilter: "blur(5px)"
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>ACADEMIC WING</div>
        <div>📍 10 Classrooms</div>
        <div>🎯 L-Shaped Layout</div>
      </div>
    </div>
  );
}

export default HallwaySceneFPS;
