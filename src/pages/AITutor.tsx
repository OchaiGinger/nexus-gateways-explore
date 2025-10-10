import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HallwayScene } from "@/components/tutor/HallwayScene";
import { useState } from "react";

const AITutor = () => {
  const [showHallway, setShowHallway] = useState(false);

  if (showHallway) {
    return <HallwayScene />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold" style={{ color: "#ff4dff" }}>🤖 AI Tutor Portal</h1>
        <p className="text-xl text-muted-foreground">
          Your personalized learning companion
        </p>
        <div className="p-8 border-2 rounded-xl" style={{ borderColor: "#ff4dff", backgroundColor: "rgba(255, 77, 255, 0.05)" }}>
          <p className="text-lg text-foreground mb-6">
            Welcome to the AI Tutor Academy! Explore our interactive classrooms,
            each equipped with cutting-edge technology and personalized AI assistance.
          </p>
          <Button 
            onClick={() => setShowHallway(true)}
            size="lg"
            style={{ 
              background: "#ff4dff",
              color: "#fff",
              marginRight: "10px"
            }}
          >
            Enter Academy Hallway
          </Button>
        </div>
        <Link to="/">
          <Button variant="outline" size="lg">
            Return to Portal World
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AITutor;
