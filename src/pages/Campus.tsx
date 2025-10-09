import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Campus = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold" style={{ color: "#00ff88" }}>🗺️ Campus Map Portal</h1>
        <p className="text-xl text-muted-foreground">
          Navigate the virtual campus with ease
        </p>
        <div className="p-8 border-2 rounded-xl" style={{ borderColor: "#00ff88", backgroundColor: "rgba(0, 255, 136, 0.05)" }}>
          <p className="text-lg text-foreground">
            Interactive 3D campus navigation with real-time locations, building information,
            and AR wayfinding to help you never get lost.
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

export default Campus;
