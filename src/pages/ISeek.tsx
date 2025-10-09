import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ISeek = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold" style={{ color: "#00d4ff" }}>🔍 I Seek Portal</h1>
        <p className="text-xl text-muted-foreground">
          Discover and find what you're looking for
        </p>
        <div className="p-8 border-2 rounded-xl" style={{ borderColor: "#00d4ff", backgroundColor: "rgba(0, 212, 255, 0.05)" }}>
          <p className="text-lg text-foreground">
            Advanced search and discovery portal with AI-powered recommendations,
            personalized content curation, and intelligent resource matching.
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

export default ISeek;
