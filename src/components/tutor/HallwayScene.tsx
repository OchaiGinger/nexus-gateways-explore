// In TutorPlayer.tsx - Movement should be based on camera rotation
const movePlayer = (delta: number, move: { forward: boolean; backward: boolean; left: boolean; right: boolean }) => {
  const speed = 5 * delta;
  const direction = new THREE.Vector3();
  
  // Get forward direction from camera rotation
  const forward = new THREE.Vector3(0, 0, -1);
  forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraRotation);
  
  // Get right direction
  const right = new THREE.Vector3(1, 0, 0);
  right.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraRotation);
  
  if (move.forward) direction.add(forward);
  if (move.backward) direction.sub(forward);
  if (move.left) direction.sub(right);
  if (move.right) direction.add(right);
  
  direction.normalize();
  direction.multiplyScalar(speed);
  
  // Update position
  const newPosition = playerPosition.clone().add(direction);
  setPlayerPosition(newPosition);
};
