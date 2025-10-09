import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ProjectWriter = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold" style={{ color: "#ffff00" }}>✍️ Project Writer Portal</h1>
        <p className="text-xl text-muted-foreground">
          Collaborative writing and project management
        </p>
        <div className="p-8 border-2 rounded-xl" style={{ borderColor: "#ffff00", backgroundColor: "rgba(255, 255, 0, 0.05)" }}>
          <p className="text-lg text-foreground">
            Real-time collaborative writing environment with AI assistance, version control,
            and integrated research tools for academic projects.
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

export default ProjectWriter;
