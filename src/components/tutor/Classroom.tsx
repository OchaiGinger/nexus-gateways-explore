import { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { Player } from "@/components/Player";
import { Camera } from "@/components/Camera";
import { Desk } from "./Desk";
import { RemotePlayer } from "@/components/RemotePlayer";
import { useWebSocket, RemotePlayerData, WebSocketService } from "@/services/WebSocketService";
import { getRandomClassroomSpawnForRoom, getPlayerColor } from "@/utils/spawnPositions";
import { ProximityChatPopup } from "@/components/ProximityChatPopup";
import { SidePanel } from "@/components/SidePanel";
import { ChatService } from "@/services/ChatService";

interface ClassroomProps {
  roomName: string;
  onExit?: () => void;
}

// Wall collision boxes for classroom
const classroomWalls = [
  // Classroom walls (scaled 1.5x)
  { position: [-15, 1, 0] as [number, number, number], width: 0.5, depth: 30 },
  { position: [15, 1, 0] as [number, number, number], width: 0.5, depth: 30 },
  { position: [0, 1, -15] as [number, number, number], width: 30, depth: 0.5 },
  { position: [0, 1, 15] as [number, number, number], width: 30, depth: 0.5 },
  // Barrier in front of first row of desks to prevent access beyond
  { position: [0, 1, -6.5] as [number, number, number], width: 30, depth: 0.3 },
];

function ClassroomEnvironment({ roomName, seats }: { roomName: string; seats: Array<{ id: string; pos: [number, number, number]; occupied: boolean }> }) {
  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
      <hemisphereLight color="#ffffff" groundColor="#555555" intensity={0.8} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2a2a3a" />
      </mesh>

      {/* Floor tiles accent pattern */}
      {Array.from({ length: 4 }).map((_, i) =>
        Array.from({ length: 4 }).map((_, j) => (
          <mesh key={`floor-${i}-${j}`} position={[-8 + i * 5, 1.001, -8 + j * 5]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4.8, 4.8]} />
            <meshStandardMaterial color={((i + j) % 2 === 0 ? "#252535" : "#2f2f40")} />
          </mesh>
        ))
      )}

      {/* Back wall */}
      <mesh position={[0, 6, -10]} castShadow receiveShadow>
        <boxGeometry args={[20, 10, 0.5]} />
        <meshStandardMaterial color="#1f3a5c" />
      </mesh>

      {/* Left wall */}
      <mesh position={[-10, 6, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 10, 20]} />
        <meshStandardMaterial color="#2a4a6f" />
      </mesh>

      {/* Right wall */}
      <mesh position={[10, 6, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 10, 20]} />
        <meshStandardMaterial color="#2a4a6f" />
      </mesh>

      {/* Front wall with door - split to make room for door */}
      {/* Left section */}
      <mesh position={[-7, 6, 10]} castShadow receiveShadow>
        <boxGeometry args={[6, 10, 0.5]} />
        <meshStandardMaterial color="#1f3a5c" />
      </mesh>
      {/* Right section */}
      <mesh position={[7, 6, 10]} castShadow receiveShadow>
        <boxGeometry args={[6, 10, 0.5]} />
        <meshStandardMaterial color="#1f3a5c" />
      </mesh>

      {/* Ceiling - higher quality darker finish */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 11, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0d0d15" />
      </mesh>

      {/* Whiteboard - SINGLE UNIFIED BOARD TOUCHING GROUND */}
      <mesh position={[0, 4.5, -9.8]} castShadow>
        <boxGeometry args={[18, 9, 0.1]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>

      {/* Whiteboard frame */}
      <mesh position={[0, 4.5, -9.7]}>
        <boxGeometry args={[18.4, 9.4, 0.1]} />
        <meshStandardMaterial color="#3d3d3d" />
      </mesh>

      {/* Section labels */}
      <Text
        position={[-3, 8, -9.6]}
        fontSize={0.6}
        color="#333333"
        anchorX="center"
        anchorY="top"
        fontWeight="bold"
      >
        TRANSCRIPT
      </Text>

      <Text
        position={[6, 8, -9.6]}
        fontSize={0.5}
        color="#8b7500"
        anchorX="center"
        anchorY="top"
        fontWeight="bold"
      >
        NOTES
      </Text>

      {/* Sample transcript text on left side - LARGER */}
      <Text
        position={[-3, 5.5, -9.6]}
        fontSize={0.32}
        color="#333333"
        anchorX="center"
        maxWidth={11}
      >
        Today's Topics:{"\n"}
        • Physics Basics & Fundamentals{"\n"}
        • Motion & Forces Analysis{"\n"}
        • Newton's Laws of Motion{"\n"}
        • Real-world Applications{"\n"}
        • Problem Solving Methods{"\n"}
        • Lab Demonstrations
      </Text>

      {/* Sample notes text on right side - LARGER */}
      <Text
        position={[6, 5.5, -9.6]}
        fontSize={0.28}
        color="#555555"
        anchorX="center"
        maxWidth={5.5}
      >
        Key Points:{"\n"}
        ✓ Focus on equations{"\n"}
        ✓ Practice problems{"\n"}
        ✓ Group discussion{"\n"}
        📌 Quiz next week{"\n"}
        📝 Assignment due
      </Text>

      {/* Room title above whiteboard */}
      <Text
        position={[0, 8.5, -9.6]}
        fontSize={0.5}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
      >
        {roomName}
      </Text>

      {/* Desks in rows */}
      {seats.map((seat) => (
        <Desk
          key={seat.id}
          position={seat.pos}
          isOccupied={seat.occupied}
          id={seat.id}
        />
      ))}

      {/* Barrier wall in front of first row of desks */}
      <mesh position={[0, 1, -6.5]} castShadow receiveShadow>
        <boxGeometry args={[30, 1.5, 0.3]} />
        <meshStandardMaterial color="#2a4a6a" opacity={0.3} transparent />
      </mesh>

      {/* Exit sign at back of classroom */}
      <group position={[0, 5, -14.5]}>
        {/* Exit sign background */}
        <mesh castShadow>
          <boxGeometry args={[3, 1.5, 0.2]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Exit sign glow */}
        <pointLight intensity={2} distance={15} color="#ff0000" />
        {/* Exit text indicator */}
        <Text
          position={[0, 0, 0.15]}
          fontSize={0.6}
          color="#ff0000"
          anchorX="center"
          anchorY="middle"
        >
          EXIT
        </Text>
      </group>

      {/* Teacher's stage platform */}
      <mesh position={[0, 1.05, -8]} castShadow receiveShadow>
        <boxGeometry args={[5, 0.1, 2.5]} />
        <meshStandardMaterial color="#3d2817" />
      </mesh>

      {/* Decorative border around stage */}
      <mesh position={[0, 1.15, -8.2]}>
        <boxGeometry args={[5.3, 0.02, 0.1]} />
        <meshStandardMaterial color="#6b4423" />
      </mesh>

      {/* Decorative border front */}
      <mesh position={[0, 1.15, -7.8]}>
        <boxGeometry args={[5.3, 0.02, 0.1]} />
        <meshStandardMaterial color="#6b4423" />
      </mesh>

      {/* Teacher's desk */}
      <group position={[0, 1.15, -8]}>
        <mesh position={[0, 0.9, 0]} castShadow>
          <boxGeometry args={[2.5, 0.1, 1.2]} />
          <meshStandardMaterial color="#6b4423" />
        </mesh>
        <mesh position={[-1, 0.45, -0.4]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.9, 16]} />
          <meshStandardMaterial color="#3a3a3a" />
        </mesh>
        <mesh position={[1, 0.45, -0.4]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.9, 16]} />
          <meshStandardMaterial color="#3a3a3a" />
        </mesh>
        <mesh position={[-1, 0.45, 0.4]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.9, 16]} />
          <meshStandardMaterial color="#3a3a3a" />
        </mesh>
        <mesh position={[1, 0.45, 0.4]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.9, 16]} />
          <meshStandardMaterial color="#3a3a3a" />
        </mesh>
      </group>

      {/* Teacher character (professional avatar) */}
      <group position={[0, 2.15, -8]}>
        {/* Head */}
        <mesh position={[0, 1, 0]} castShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#d4a574" />
        </mesh>
        {/* Body - Professional shirt */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.4, 0.7, 0.25]} />
          <meshStandardMaterial color="#1a3a7a" />
        </mesh>
        {/* Left arm */}
        <mesh position={[-0.3, 0.4, 0]} castShadow>
          <boxGeometry args={[0.15, 0.5, 0.15]} />
          <meshStandardMaterial color="#d4a574" />
        </mesh>
        {/* Right arm */}
        <mesh position={[0.3, 0.4, 0]} castShadow>
          <boxGeometry args={[0.15, 0.5, 0.15]} />
          <meshStandardMaterial color="#d4a574" />
        </mesh>
        {/* Left leg - dark pants */}
        <mesh position={[-0.15, -0.2, 0]} castShadow>
          <boxGeometry args={[0.12, 0.4, 0.15]} />
          <meshStandardMaterial color="#1a1a2a" />
        </mesh>
        {/* Right leg - dark pants */}
        <mesh position={[0.15, -0.2, 0]} castShadow>
          <boxGeometry args={[0.12, 0.4, 0.15]} />
          <meshStandardMaterial color="#1a1a2a" />
        </mesh>
      </group>

      {/* Ceiling lights */}
      {[-5, 0, 5].map((x, i) => (
        <group key={i} position={[x, 10.5, 0]}>
          <pointLight intensity={4} distance={25} color="#ffffff" />
          <mesh castShadow>
            <boxGeometry args={[1.5, 0.1, 1.5]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={1}
            />
          </mesh>
        </group>
      ))}

      {/* Additional ceiling lights along Z axis */}
      {[-7, 7].map((z, i) => (
        <group key={`ceiling-z-${i}`} position={[0, 10.5, z]}>
          <pointLight intensity={3.5} distance={22} color="#ffffff" />
          <mesh castShadow>
            <boxGeometry args={[1.2, 0.1, 1.2]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={1}
            />
          </mesh>
        </group>
      ))}

      {/* Front ceiling lights for better board illumination - MOVED HIGHER */}
      {[-6, -3, 0, 3, 6].map((x, i) => (
        <group key={`front-ceiling-${i}`} position={[x, 11.5, -6]}>
          <pointLight intensity={3} distance={18} color="#ffff99" />
          <mesh castShadow>
            <boxGeometry args={[0.8, 0.1, 0.8]} />
            <meshStandardMaterial
              color="#ffff99"
              emissive="#ffff99"
              emissiveIntensity={0.9}
            />
          </mesh>
        </group>
      ))}

      {/* Wall lights */}
      {[-6, 0, 6].map((z, i) => (
        <group key={`wall-light-${i}`}>
          <group position={[-9.5, 7, z]}>
            <pointLight intensity={2.5} distance={14} color="#ffbb00" />
            <mesh castShadow>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial color="#ffbb00" emissive="#ffbb00" emissiveIntensity={1.2} />
            </mesh>
          </group>
          <group position={[9.5, 7, z]}>
            <pointLight intensity={2.5} distance={14} color="#ffbb00" />
            <mesh castShadow>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial color="#ffbb00" emissive="#ffbb00" emissiveIntensity={1.2} />
            </mesh>
          </group>
        </group>
      ))}

      {/* Whiteboard accent lights - MOVED HIGHER */}
      {[-6, -3, 0, 3, 6].map((x, i) => (
        <group key={`board-light-${i}`} position={[x, 9.5, -9.5]}>
          <pointLight intensity={2} distance={12} color="#ffff99" />
          <mesh castShadow>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial color="#ffff99" emissive="#ffff99" emissiveIntensity={1} />
          </mesh>
        </group>
      ))}

      {/* Back wall accent lights */}
      {[-8, -4, 0, 4, 8].map((x, i) => (
        <group key={`back-light-${i}`} position={[x, 3, -14.8]}>
          <pointLight intensity={2} distance={12} color="#00ccff" />
          <mesh castShadow>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={1.1} />
          </mesh>
        </group>
      ))}

      {/* Front wall accent lights */}
      {[-8, -4, 0, 4, 8].map((x, i) => (
        <group key={`front-light-${i}`} position={[x, 3, 14.8]}>
          <pointLight intensity={2} distance={12} color="#00ccff" />
          <mesh castShadow>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={1.1} />
          </mesh>
        </group>
      ))}

      {/* Corner accent lights for atmosphere */}
      {[
        [-12, 4, -10],
        [12, 4, -10],
        [-12, 4, 10],
        [12, 4, 10],
      ].map((pos, i) => (
        <group key={`corner-light-${i}`} position={pos as [number, number, number]}>
          <pointLight intensity={1.5} distance={15} color="#00ddff" />
          <mesh castShadow>
            <sphereGeometry args={[0.15, 10, 10]} />
            <meshStandardMaterial color="#00ddff" emissive="#00ddff" emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}

      {/* Clock on back wall */}
      <group position={[-8, 8, -9.9]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.2, 32]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <circleGeometry args={[0.45, 32]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>
        {/* Clock hands */}
        <mesh position={[0, 0.13, 0]} rotation={[0, 0, Math.PI / 6]}>
          <boxGeometry args={[0.02, 0.25, 0.01]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[0, 0.13, 0]} rotation={[0, 0, Math.PI / 3]}>
          <boxGeometry args={[0.015, 0.35, 0.01]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      </group>

      {/* Classroom calendar/board on left wall */}
      <mesh position={[-9.8, 7, 0]} castShadow>
        <boxGeometry args={[0.2, 2, 1.5]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      {/* Door frame outline */}
      <mesh position={[0, 6, 10.2]} castShadow>
        <boxGeometry args={[3, 6, 0.1]} />
        <meshStandardMaterial color="#5a4a3a" />
      </mesh>

      {/* Emergency exit light */}
      <group position={[8, 9, 9.8]}>
        <mesh castShadow>
          <boxGeometry args={[1, 0.5, 0.1]} />
          <meshStandardMaterial color="#220000" />
        </mesh>
        <pointLight intensity={1} distance={10} color="#ff0000" />
        <Text position={[0, 0, 0.08]} fontSize={0.25} color="#ff0000">EXIT</Text>
      </group>
    </group>
  );
}

function Scene({ roomName, onExit, onNearDoorChange, isSitting, onSittingChange, onNearestSeatChange, onNearbyPlayerChange, classroomIndex = 0 }: ClassroomProps & { onNearDoorChange: (isNear: boolean) => void; isSitting: boolean; onSittingChange: (sitting: boolean) => void; onNearestSeatChange: (seat: string | null) => void; onNearbyPlayerChange?: (playerId: string | null, playerName: string | null) => void; classroomIndex?: number }) {
  // WebSocket multiplayer
  const { isConnected, remotePlayers, ws } = useWebSocket("Student", "ws://localhost:3000");
  const initialSpawnRef = useRef(false);

  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 1, 8));

  // Set random spawn position on first load
  useEffect(() => {
    if (!initialSpawnRef.current) {
      const spawn = getRandomClassroomSpawnForRoom(classroomIndex, true);
      setPlayerPosition(spawn.position);
      initialSpawnRef.current = true;
    }
  }, [classroomIndex]);

  const [seatPositions] = useState<Array<{ id: string; pos: [number, number, number]; occupied: boolean }>>([
    { id: "desk-0", pos: [-3, 1, -5], occupied: false },
    { id: "desk-1", pos: [0, 1, -5], occupied: false },
    { id: "desk-2", pos: [3, 1, -5], occupied: false },
    { id: "desk-3", pos: [-3, 1, -2], occupied: true },
    { id: "desk-4", pos: [0, 1, -2], occupied: false },
    { id: "desk-5", pos: [3, 1, -2], occupied: false },
    { id: "desk-6", pos: [-3, 1, 1], occupied: false },
    { id: "desk-7", pos: [0, 1, 1], occupied: false },
    { id: "desk-8", pos: [3, 1, 1], occupied: true },
    { id: "desk-9", pos: [-3, 1, 4], occupied: false },
    { id: "desk-10", pos: [0, 1, 4], occupied: false },
    { id: "desk-11", pos: [3, 1, 4], occupied: false },
  ]);
  const keysRef = useRef<Record<string, boolean>>({});
  const nearDoorRef = useRef<boolean>(false);
  const sittingAtDeskRef = useRef<string | null>(null);
  const nearestSeatRef = useRef<string | null>(null);

  // Keyboard listener for E key to exit and F key to sit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (e.code === "KeyE" && nearDoorRef.current && onExit) {
        onExit();
      }
      // F key to sit at nearest available seat (only if near one)
      if (e.code === "KeyF" && !isSitting && nearestSeatRef.current) {
        onSittingChange(true);
        sittingAtDeskRef.current = nearestSeatRef.current;
      }
      // Q key to get up from seat
      if (e.code === "KeyQ" && isSitting) {
        onSittingChange(false);
        sittingAtDeskRef.current = null;
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
  }, [onExit, isSitting, onSittingChange]);

  const handlePositionChange = (position: THREE.Vector3) => {
    setPlayerPosition(position.clone());

    // Update WebSocket with new position
    if (ws && isConnected) {
      // Calculate rotation based on player movement
      const rotation = Math.atan2(position.x, position.z);
      ws.updatePosition(position, rotation, true, classroomIndex, isSitting, sittingAtDeskRef.current || undefined);
    }

    // Check proximity to exit door at z=10
    const doorPos = new THREE.Vector3(0, 0, 9);
    const distance = position.distanceTo(doorPos);
    const isNear = distance < 2.5;

    if (isNear !== nearDoorRef.current) {
      nearDoorRef.current = isNear;
      onNearDoorChange(isNear);
    }

    // Check proximity to seats (3 unit reach)
    let closestSeat: string | null = null;
    let closestDist = 3;
    for (const seat of seatPositions) {
      if (!seat.occupied) {
        const dist = Math.sqrt(
          Math.pow(position.x - seat.pos[0], 2) +
          Math.pow(position.z - seat.pos[2], 2)
        );
        if (dist < closestDist) {
          closestDist = dist;
          closestSeat = seat.id;
        }
      }
    }
    nearestSeatRef.current = closestSeat;
    onNearestSeatChange(closestSeat);

    // Check proximity to other players (5 unit reach for chat)
    let closestPlayer: { id: string; name: string } | null = null;
    let closestPlayerDist = 5;

    remotePlayers.forEach((player) => {
      if (player.isInClassroom && player.classroomIndex === classroomIndex) {
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
      <fog attach="fog" args={["#0a0015", 5, 30]} />
      <ClassroomEnvironment roomName={roomName} seats={seatPositions} />
      <Player
        onPositionChange={handlePositionChange}
        portals={[]}
        walls={classroomWalls}
        isSitting={isSitting}
        sittingPosition={sittingAtDeskRef.current ? seatPositions.find(s => s.id === sittingAtDeskRef.current)?.pos : undefined}
        remotePlayers={Array.from(remotePlayers.values())
          .filter(p => p.isInClassroom && p.classroomIndex === classroomIndex)
          .map(p => ({ position: p.position }))}
      />
      <Camera target={isSitting && sittingAtDeskRef.current ? new THREE.Vector3(...(seatPositions.find(s => s.id === sittingAtDeskRef.current)?.pos || [0, 0, 0])) : playerPosition} isSitting={isSitting} />

      {/* Render remote players in the same classroom */}
      {Array.from(remotePlayers.values()).map((player: RemotePlayerData) => (
        <RemotePlayer
          key={player.id}
          playerData={player}
          isInSameScene={player.isInClassroom && player.classroomIndex === classroomIndex}
          color={getPlayerColor(player.id)}
        />
      ))}
    </>
  );
}

export function Classroom({ roomName, onExit }: ClassroomProps) {
  const [nearDoor, setNearDoor] = useState(false);
  const [isSitting, setIsSitting] = useState(false);
  const [nearestSeat, setNearestSeat] = useState<string | null>(null);
  const { isConnected, remotePlayers, ws } = useWebSocket("Student", "ws://localhost:3000");
  const remotePlayerCount = Array.from(remotePlayers.values()).filter(
    p => p.isInClassroom
  ).length;
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [chatPopupOpen, setChatPopupOpen] = useState(false);
  const [nearbyPlayerId, setNearbyPlayerId] = useState<string | null>(null);
  const [nearbyPlayerName, setNearbyPlayerName] = useState<string | null>(null);
  const [playerPosition, setPlayerPosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 1, 8));

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
        camera={{ position: [0, 3, 12], fov: 60 }}
        shadows
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <Scene roomName={roomName} onExit={onExit} onNearDoorChange={setNearDoor} isSitting={isSitting} onSittingChange={setIsSitting} onNearestSeatChange={setNearestSeat} onNearbyPlayerChange={(playerId, playerName) => { setNearbyPlayerId(playerId); setNearbyPlayerName(playerName); }} />
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
        <div>Students: {remotePlayerCount + 1}</div>
        {remotePlayerCount > 0 && (
          <div style={{ marginTop: "6px", fontSize: "11px", color: "#aaaaaa" }}>
            {remotePlayerCount} in class
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
        {nearestSeat && !isSitting && (
          <div style={{ marginTop: "10px", color: "#ffff00", fontWeight: "bold" }}>
            💺 Press F to Sit
          </div>
        )}
        {isSitting && (
          <div style={{ marginTop: "10px", color: "#00ff00", fontWeight: "bold" }}>
            📍 Press Q to Stand Up
          </div>
        )}
        {nearDoor && (
          <div style={{ marginTop: "10px", color: "#00ff00", fontWeight: "bold" }}>
            ⌨️ Press E to Exit Classroom
          </div>
        )}
      </div>


      {/* Classroom info */}
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
        <div style={{ marginBottom: "5px" }}>🏫 {roomName}</div>
        <div>📍 Interactive Classroom</div>
        <div>👥 12 Student Desks + Teacher</div>
        <div>👨‍🏫 Teacher at Front</div>
        {remotePlayerCount > 0 && (
          <div style={{ marginTop: "8px", color: "#0066ff", fontSize: "12px" }}>
            👥 {remotePlayerCount} other students
          </div>
        )}
      </div>

      {/* Exit button overlay */}
      <button
        onClick={onExit}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          padding: "12px 24px",
          background: "linear-gradient(45deg, #ff4444, #ff6b6b)",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          zIndex: 100,
          boxShadow: "0 4px 15px rgba(255, 68, 68, 0.4)",
        }}
      >
        Exit Classroom
      </button>

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
