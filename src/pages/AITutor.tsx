import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AITutor = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold" style={{ color: "#ff4dff" }}>🤖 AI Tutor Portal</h1>
        <p className="text-xl text-muted-foreground">
          Your personalized learning companion
        </p>
        <div className="p-8 border-2 rounded-xl" style={{ borderColor: "#ff4dff", backgroundColor: "rgba(255, 77, 255, 0.05)" }}>
          <p className="text-lg text-foreground">
            Advanced AI-powered tutoring system that adapts to your learning style,
            provides instant feedback, and guides you through complex topics.
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

export default AITutor;
