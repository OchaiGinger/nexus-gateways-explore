import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const StudyRoom = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold" style={{ color: "#8a4dff" }}>📖 Study Room Portal</h1>
        <p className="text-xl text-muted-foreground">
          Your virtual study sanctuary
        </p>
        <div className="p-8 border-2 rounded-xl" style={{ borderColor: "#8a4dff", backgroundColor: "rgba(138, 77, 255, 0.05)" }}>
          <p className="text-lg text-foreground">
            Immersive study environment with focus tools, ambient sounds, pomodoro timers,
            and collaborative study sessions with fellow students.
          </p>
        </div>
        <Link to="/">
          <Button variant="default" size="lg">
            Return to Portal World
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default StudyRoom;
