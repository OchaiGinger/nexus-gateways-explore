import { useState, useRef, useEffect } from "react";
import React from "react";
import { Canvas } from "@react-three/fiber";
import { Stars, Text } from "@react-three/drei";
import * as THREE from "three";
import { Player } from "@/components/Player";
import { Camera } from "@/components/Camera";
import { Door } from "./Door";
import { RemotePlayer } from "@/components/RemotePlayer";
import { useWebSocket, RemotePlayerData, WebSocketService } from "@/services/WebSocketService";
import { getRandomHallwaySpawn, getPlayerColor } from "@/utils/spawnPositions";
import { ProximityChatPopup } from "@/components/ProximityChatPopup";
import { SidePanel } from "@/components/SidePanel";
import { ChatService } from "@/services/ChatService";

interface HallwaySceneProps {
  onEnterClassroom: (index: number) => void;
}

type DoorInfo = {
  index: number;
  label: string;
  position: [number, number, number];
  rotation: number;
  isInSession: boolean;
};

const doors: DoorInfo[] = [
  { index: 0, label: "Mathematics", position: [-6, 1.3, -20], rotation: Math.PI / 2, isInSession: true },
  { index: 1, label: "Physics", position: [6, 1.3, -20], rotation: -Math.PI / 2, isInSession: false },
  { index: 2, label: "Computer Science", position: [-6, 1.3, -10], rotation: Math.PI / 2, isInSession: true },
  { index: 3, label: "Chemistry", position: [6, 1.3, -10], rotation: -Math.PI / 2, isInSession: false },
  { index: 4, label: "Biology", position: [-6, 1.3, 0], rotation: Math.PI / 2, isInSession: true },
  { index: 5, label: "Literature", position: [6, 1.3, 5], rotation: -Math.PI / 2, isInSession: false },
  { index: 6, label: "History", position: [-6, 1.3, 10], rotation: Math.PI / 2, isInSession: false },
  { index: 7, label: "Art & Design", position: [6, 1.3, 15], rotation: -Math.PI / 2, isInSession: true },
  { index: 8, label: "Robotics Lab", position: [20, 1.3, -8], rotation: Math.PI, isInSession: true },
  { index: 9, label: "Media Room", position: [26, 1.3, -8], rotation: Math.PI, isInSession: false },
];

// Wall collision boxes for the hallway
const hallwayWalls = [
  // Main corridor walls
  { position: [-9.5, 0, 0] as [number, number, number], width: 1, depth: 60 },
  { position: [9.5, 0, 0] as [number, number, number], width: 1, depth: 60 },
  // End walls
  { position: [0, 0, -30] as [number, number, number], width: 19, depth: 1 },
  { position: [0, 0, 30] as [number, number, number], width: 19, depth: 1 },
  // Branch corridor walls
  { position: [9.5, 0, -12] as [number, number, number], width: 1, depth: 16 },
  { position: [30.5, 0, -12] as [number, number, number], width: 1, depth: 16 },
  { position: [20, 0, -20] as [number, number, number], width: 21, depth: 1 },
  { position: [20, 0, -4] as [number, number, number], width: 21, depth: 1 },
  // Door collision boxes - make doors solid
  ...doors.map(door => ({
    position: door.position as [number, number, number],
    width: 3.5,
    depth: 0.5
  }))
];

function HallwayEnvironment({ doors, nearDoorIndex }: { doors: DoorInfo[], nearDoorIndex: number | null }) {
  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
      <hemisphereLight color="#ffffff" groundColor="#444444" intensity={0.7} />
      <pointLight position={[0, 8, 0]} intensity={1.5} distance={30} />
      <pointLight position={[20, 8, -12]} intensity={1.5} distance={30} />

      {/* Stars background - reduced for faster load */}
      <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Main corridor walls */}
      <mesh position={[-9.5, 5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 10, 60]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>
      <mesh position={[9.5, 5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 10, 60]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>

      {/* End walls */}
      <mesh position={[0, 5, -30]} castShadow receiveShadow>
        <boxGeometry args={[19, 10, 0.5]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>
      <mesh position={[0, 5, 30]} castShadow receiveShadow>
        <boxGeometry args={[19, 10, 0.5]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>

      {/* Branch corridor walls */}
      <mesh position={[9.5, 5, -12]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 10, 16]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>
      <mesh position={[30.5, 5, -12]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 10, 16]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>
      <mesh position={[20, 5, -20]} castShadow receiveShadow>
        <boxGeometry args={[21, 10, 0.5]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>
      <mesh position={[20, 5, -4]} castShadow receiveShadow>
        <boxGeometry args={[21, 10, 0.5]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#0f1419" />
      </mesh>

      {/* Ceiling lights - reduced for faster load */}
      {[-25, -10, 5, 20].map((z, i) => (
        <group key={i} position={[0, 9.5, z]}>
          <pointLight intensity={3} distance={25} color="#ffffff" />
          <mesh castShadow>
            <boxGeometry args={[2, 0.1, 2]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}

      {/* Branch corridor lights - reduced */}
      {[14, 20, 26].map((x, i) => (
        <group key={`branch-${i}`} position={[x, 9.5, -12]}>
          <pointLight intensity={3} distance={25} color="#ffffff" />
          <mesh castShadow>
            <boxGeometry args={[2, 0.1, 2]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}

      {/* Wall-mounted lights - reduced */}
      {[-20, 0, 20].map((z, i) => (
        <React.Fragment key={`wall-lights-${i}`}>
          {/* Left wall lights */}
          <group position={[-9, 6, z]}>
            <pointLight intensity={2} distance={15} color="#ffaa00" />
            <mesh castShadow>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={1} />
            </mesh>
          </group>
          {/* Right wall lights */}
          <group position={[9, 6, z]}>
            <pointLight intensity={2} distance={15} color="#ffaa00" />
            <mesh castShadow>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={1} />
            </mesh>
          </group>
        </React.Fragment>
      ))}

      {/* Decorations - Plants - reduced */}
      {[-12, 8].map((z, i) => (
        <React.Fragment key={`plants-${i}`}>
          {/* Left side plants */}
          <group position={[-7, 0, z]}>
            <mesh position={[0, 0.5, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.4, 1, 16]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            <mesh position={[0, 1.5, 0]} castShadow>
              <sphereGeometry args={[0.6, 16, 16]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
          </group>
          {/* Right side plants */}
          <group position={[7, 0, z]}>
            <mesh position={[0, 0.5, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.4, 1, 16]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            <mesh position={[0, 1.5, 0]} castShadow>
              <sphereGeometry args={[0.6, 16, 16]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
          </group>
        </React.Fragment>
      ))}

      {/* Decorations - Benches - reduced */}
      {[-6, 12].map((z, i) => (
        <React.Fragment key={`benches-${i}`}>
          <group position={[-7.5, 0.5, z]}>
            <mesh castShadow>
              <boxGeometry args={[1.5, 0.1, 0.6]} />
              <meshStandardMaterial color="#5a3a2a" />
            </mesh>
            <mesh position={[-0.5, -0.3, 0]} castShadow>
              <boxGeometry args={[0.1, 0.6, 0.5]} />
              <meshStandardMaterial color="#2a2a2a" />
            </mesh>
            <mesh position={[0.5, -0.3, 0]} castShadow>
              <boxGeometry args={[0.1, 0.6, 0.5]} />
              <meshStandardMaterial color="#2a2a2a" />
            </mesh>
          </group>
        </React.Fragment>
      ))}

      {/* Doors */}
      {doors.map((door) => (
        <Door
          key={door.index}
          position={door.position}
          rotation={door.rotation}
          label={door.label}
          isClassInSession={door.isInSession}
          isNear={nearDoorIndex === door.index}
        />
      ))}

      {/* Hallway title */}
      <Text
        position={[0, 8, -29]}
        fontSize={1}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
      >
        AI TUTOR HALLWAY
      </Text>
    </group>
  );
}

function Scene({ onEnterClassroom, onNearDoorChange, onNearbyPlayerChange }: { onEnterClassroom: (index: number) => void, onNearDoorChange: (index: number | null) => void, onNearbyPlayerChange?: (playerId: string | null, playerName: string | null) => void }) {
  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 0, 20));
  const keysRef = useRef<Record<string, boolean>>({});
  const nearDoorIndexRef = useRef<number | null>(null);

  // WebSocket multiplayer
  const { isConnected, remotePlayers, ws } = useWebSocket("Student", "ws://localhost:3000");
  const initialSpawnRef = useRef(false);

  // Set random spawn position on first load
  useEffect(() => {
    if (!initialSpawnRef.current) {
      const spawn = getRandomHallwaySpawn();
      setPlayerPosition(spawn.position);
      initialSpawnRef.current = true;
    }
  }, []);

  // Keyboard listener for E key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (e.code === "KeyE" && nearDoorIndexRef.current !== null) {
        onEnterClassroom(nearDoorIndexRef.current);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [onEnterClassroom]);

  const handlePositionChange = (position: THREE.Vector3) => {
    setPlayerPosition(position.clone());

    // Update WebSocket with new position
    if (ws && isConnected) {
      // Calculate rotation from camera direction
      const cameraDirection = new THREE.Vector3(0, 0, -1);
      const rotation = Math.atan2(cameraDirection.x, cameraDirection.z);

      ws.updatePosition(position, rotation, false);
    }

    // Check proximity to doors - player must be very close
    let closestDoor: number | null = null;
    let closestDistance = 2.0;

    doors.forEach((door) => {
      const doorPos = new THREE.Vector3(...door.position);
      const distance = position.distanceTo(doorPos);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestDoor = door.index;
      }
    });

    nearDoorIndexRef.current = closestDoor;
    onNearDoorChange(closestDoor);

    // Check proximity to other players (5 unit reach for chat)
    let closestPlayer: { id: string; name: string } | null = null;
    let closestPlayerDist = 5;

    remotePlayers.forEach((player) => {
      if (!player.isInClassroom) {
        const playerPos = new THREE.Vector3(
          player.position.x,
          player.position.y,
          player.position.z
        );
        const dist = position.distanceTo(playerPos);
        if (dist < closestPlayerDist && dist > 0) {
          closestPlayerDist = dist;
          closestPlayer = { id: player.id, name: player.username };
        }
      }
    });

    onNearbyPlayerChange?.(closestPlayer?.id || null, closestPlayer?.name || null);
  };

  return (
    <>
      <fog attach="fog" args={["#0a0015", 10, 80]} />
      <HallwayEnvironment doors={doors} nearDoorIndex={nearDoorIndexRef.current} />
      <Player
        onPositionChange={handlePositionChange}
        portals={[]}
        walls={hallwayWalls}
        remotePlayers={Array.from(remotePlayers.values())
          .filter(p => !p.isInClassroom)
          .map(p => ({ position: p.position }))}
      />
      <Camera target={playerPosition} />

      {/* Render remote players */}
      {Array.from(remotePlayers.values()).map((player: RemotePlayerData) => (
        <RemotePlayer
          key={player.id}
          playerData={player}
          isInSameScene={!player.isInClassroom}
          color={getPlayerColor(player.id)}
        />
      ))}
    </>
  );
}

export function HallwaySceneFPS({ onEnterClassroom }: HallwaySceneProps) {
  const [nearDoorIndex, setNearDoorIndex] = useState<number | null>(null);
  const { isConnected, remotePlayers, ws } = useWebSocket("Student", "ws://localhost:3000");
  const remotePlayerCount = remotePlayers.size;
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [chatPopupOpen, setChatPopupOpen] = useState(false);
  const [nearbyPlayerId, setNearbyPlayerId] = useState<string | null>(null);
  const [nearbyPlayerName, setNearbyPlayerName] = useState<string | null>(null);

  // Initialize chat service with current player info
  useEffect(() => {
    const chatService = ChatService.getInstance();
    if (ws) {
      chatService.setCurrentUser(ws.getPlayerId(), "Student", ws);
    }
  }, [ws]);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000" }}>
      <Canvas
        camera={{ position: [0, 3, 28], fov: 60 }}
        shadows
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <Scene onEnterClassroom={onEnterClassroom} onNearDoorChange={setNearDoorIndex} onNearbyPlayerChange={(playerId, playerName) => { setNearbyPlayerId(playerId); setNearbyPlayerName(playerName); }} />
      </Canvas>

      {/* Multiplayer status indicator */}
      <div
        style={{
          position: "absolute",
          top: "100px",
          right: "20px",
          background: "rgba(0, 0, 0, 0.8)",
          padding: "12px 16px",
          borderRadius: "8px",
          color: isConnected ? "#00ff00" : "#ff4444",
          fontFamily: "monospace",
          fontSize: "12px",
          border: `2px solid ${isConnected ? "#00ff00" : "#ff4444"}`,
          minWidth: "140px",
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
          {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
        </div>
        <div>Players online: {remotePlayerCount + 1}</div>
        {remotePlayerCount > 0 && (
          <div style={{ marginTop: "6px", fontSize: "11px", color: "#aaaaaa" }}>
            {remotePlayerCount} other {remotePlayerCount === 1 ? "student" : "students"}
          </div>
        )}
      </div>

      {/* Controls UI */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          background: "rgba(0, 0, 0, 0.7)",
          padding: "15px",
          borderRadius: "10px",
          color: "white",
          fontFamily: "monospace",
          fontSize: "14px",
        }}
      >
        <div>🎮 WASD or Arrow Keys - Move</div>
        <div>🖱️ Mouse - Look Around</div>
        <div>🔍 Scroll - Zoom</div>
        {nearDoorIndex !== null && (
          <div style={{ marginTop: "10px", color: "#00ff00", fontWeight: "bold" }}>
            ⌨️ Press E to Enter - {doors[nearDoorIndex].label}
          </div>
        )}
      </div>

      {/* Info overlay */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          background: "rgba(255, 255, 255, 0.9)",
          padding: "15px",
          borderRadius: "10px",
          border: "2px solid #00ffff",
          fontFamily: "monospace",
          fontSize: "14px",
          fontWeight: "bold",
        }}
      >
        <div style={{ marginBottom: "5px" }}>🏫 AI Tutor Hallway</div>
        <div>📚 {doors.length} Classrooms Available</div>
        <div>✨ Explore and Learn</div>
        {remotePlayerCount > 0 && (
          <div style={{ marginTop: "8px", color: "#0066ff", fontSize: "12px" }}>
            👥 Multiplayer Active
          </div>
        )}
      </div>

      {/* Side Panel Toggle Button */}
      <button
        onClick={() => setSidePanelOpen(true)}
        style={{
          position: "absolute",
          top: "100px",
          left: "20px",
          width: "50px",
          height: "50px",
          background: "linear-gradient(135deg, #00ffff, #0099ff)",
          color: "white",
          border: "none",
          borderRadius: "50%",
          fontSize: "24px",
          cursor: "pointer",
          zIndex: 95,
          boxShadow: "0 4px 15px rgba(0, 255, 255, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        title="Open Game Panel"
      >
        ≡
      </button>

      {/* Side Panel */}
      <SidePanel
        isOpen={sidePanelOpen}
        onOpenChange={setSidePanelOpen}
        playerCount={remotePlayerCount + 1}
        wsService={ws}
        onSelectConversation={(playerId) => {
          const player = remotePlayers.get(playerId);
          if (player) {
            setNearbyPlayerId(playerId);
            setNearbyPlayerName(player.username);
            setChatPopupOpen(true);
          }
        }}
      />

      {/* Proximity Chat Popup */}
      <ProximityChatPopup
        isOpen={chatPopupOpen}
        nearbyPlayerId={nearbyPlayerId}
        nearbyPlayerName={nearbyPlayerName}
        onClose={() => setChatPopupOpen(false)}
        currentUserId={ws?.getPlayerId() || ""}
        currentUsername="Student"
        wsService={ws}
      />

      {/* Proximity indicator (shows when near player) */}
      {nearbyPlayerId && !chatPopupOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            background: "rgba(0, 255, 150, 0.2)",
            border: "2px solid #00ff96",
            padding: "15px 20px",
            borderRadius: "10px",
            color: "#00ff96",
            fontFamily: "monospace",
            fontSize: "14px",
            cursor: "pointer",
            backdropFilter: "blur(5px)",
            zIndex: 90,
          }}
          onClick={() => setChatPopupOpen(true)}
        >
          <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
            🎤 {nearbyPlayerName} is nearby!
          </div>
          <div style={{ fontSize: "12px" }}>Click or press C to chat</div>
        </div>
      )}
    </div>
  );
}
