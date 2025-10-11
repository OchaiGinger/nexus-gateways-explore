import { useState } from "react";
import { HallwaySceneFPS } from "@/components/tutor/HallwayScene";
import { Classroom } from "@/components/tutor/Classroom";

const classroomNames = [
  "Mathematics",
  "Physics", 
  "Computer Science",
  "Chemistry",
  "Biology",
  "Literature",
  "History",
  "Art & Design",
  "Robotics Lab",
  "Media Room"
];

const AITutor = () => {
  const [currentClassroom, setCurrentClassroom] = useState<number | null>(null);

  const handleEnterClassroom = (index: number) => {
    setCurrentClassroom(index);
  };

  const handleExitClassroom = () => {
    setCurrentClassroom(null);
  };

  // Show classroom if selected, otherwise show hallway
  if (currentClassroom !== null) {
    return (
      <Classroom
        roomName={classroomNames[currentClassroom]}
        onExit={handleExitClassroom}
      />
    );
  }

  return <HallwaySceneFPS onEnterClassroom={handleEnterClassroom} />;
};

export default AITutor;

