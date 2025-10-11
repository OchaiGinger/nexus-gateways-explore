import { useParams, useNavigate } from "react-router-dom";
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
  const { classroomId } = useParams<{ classroomId?: string }>();
  const navigate = useNavigate();

  const handleEnterClassroom = (index: number) => {
    navigate(`/ai-tutor/classroom/${index}`);
  };

  const handleExitClassroom = () => {
    navigate("/ai-tutor");
  };

  // Show classroom if classroomId param exists
  if (classroomId !== undefined) {
    const classroomIndex = parseInt(classroomId, 10);
    if (!isNaN(classroomIndex) && classroomIndex >= 0 && classroomIndex < classroomNames.length) {
      return (
        <Classroom
          roomName={classroomNames[classroomIndex]}
          onExit={handleExitClassroom}
        />
      );
    }
  }

  return <HallwaySceneFPS onEnterClassroom={handleEnterClassroom} />;
};

export default AITutor;

