// -----------------------------
// Enhanced Door component with FIXED label alignment
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

  // Different colors for different departments
  const getDoorColor = () => {
    const colors = [
      "#8B4513", "#2F4F4F", "#483D8B", "#556B2F", "#8B008B", 
      "#CD5C5C", "#20B2AA", "#DA70D6", "#F4A460", "#7B68EE"
    ];
    return colors[info.index % colors.length];
  };

  const doorColor = getDoorColor();

  return (
    <group position={worldPosition} rotation={[0, rotationY, 0]}>
      {/* Enhanced Door Frame */}
      <group position={[0, DOOR_HEIGHT / 2, 0]}>
        {/* Main frame */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[DOOR_THICKNESS + 0.1, DOOR_HEIGHT + 0.3, DOOR_WIDTH + 0.15]} />
          <meshStandardMaterial color="#5a4a3a" metalness={0.4} roughness={0.6} />
        </mesh>
        
        {/* Door slab - with proper color */}
        <mesh
          position={[0, 0, 0]}
          castShadow
          receiveShadow
          onClick={(e) => {
            e.stopPropagation();
            onClick(info.index);
          }}
        >
          <boxGeometry args={[DOOR_THICKNESS, DOOR_HEIGHT, DOOR_WIDTH]} />
          <meshStandardMaterial
            color={doorColor}
            metalness={0.3}
            roughness={0.5}
          />
        </mesh>

        {/* Door panels for realism */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[DOOR_THICKNESS - 0.02, 0.8, DOOR_WIDTH - 0.3]} />
          <meshStandardMaterial color="#6a5a4a" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.5, 0]} castShadow>
          <boxGeometry args={[DOOR_THICKNESS - 0.02, 0.8, DOOR_WIDTH - 0.3]} />
          <meshStandardMaterial color="#6a5a4a" metalness={0.5} roughness={0.4} />
        </mesh>

        {/* Enhanced Door handle */}
        <group position={[0, 0, DOOR_WIDTH / 2 - 0.08]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.12, 8]} />
            <meshStandardMaterial color="#dddddd" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.16, 8]} />
            <meshStandardMaterial color="#bbbbbb" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>

        {/* Door hinges */}
        <mesh position={[0, 0.7, -DOOR_WIDTH / 2 + 0.05]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.08, 8]} />
          <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.7, -DOOR_WIDTH / 2 + 0.05]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.08, 8]} />
          <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* Session status indicator */}
      <mesh position={[0.2, DOOR_HEIGHT + 0.2, 0]} castShadow>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial 
          color={info.isInSession ? "#00ff88" : "#ff4444"}
          emissive={info.isInSession ? "#00ff88" : "#ff4444"}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* FIXED Door label - Manual billboarding using useFrame */}
      <DoorLabel position={[0, DOOR_HEIGHT + 0.8, 0]} label={info.label} />

      {/* Enhanced hover indicator */}
      {hovered && (
        <group>
          <mesh position={[0.2, DOOR_HEIGHT / 2, DOOR_WIDTH / 2 + 0.15]}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial 
              color="#ffff00"
              emissive="#ffff00"
              emissiveIntensity={1.2}
            />
          </mesh>
          {/* Hover glow effect around door */}
          <mesh position={[0, DOOR_HEIGHT / 2, 0]}>
            <boxGeometry args={[DOOR_THICKNESS + 0.2, DOOR_HEIGHT + 0.2, DOOR_WIDTH + 0.2]} />
            <meshBasicMaterial 
              color="#ffff00" 
              transparent 
              opacity={0.15}
              side={THREE.BackSide}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

// -----------------------------
// New DoorLabel component with manual billboarding
// -----------------------------

function DoorLabel({ position, label }: { position: [number, number, number]; label: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (groupRef.current) {
      // Make the label face the camera while maintaining its upright position
      groupRef.current.lookAt(
        camera.position.x,
        groupRef.current.position.y, // Keep the same Y to prevent tilting
        camera.position.z
      );
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <group>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[2.2, 0.5]} />
          <meshStandardMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.95}
            metalness={0.1}
            roughness={0.2}
          />
        </mesh>
        <Text
          fontSize={0.16}
          anchorX="center"
          anchorY="middle"
          color="#000000"
          fontWeight="bold"
        >
          {label}
        </Text>
        {/* Label frame */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[2.25, 0.55]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      </group>
    </group>
  );
}
