import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Store = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold" style={{ color: "#ff9500" }}>🛍️ 3D Store Portal</h1>
        <p className="text-xl text-muted-foreground">
          Immersive shopping in virtual reality
        </p>
        <div className="p-8 border-2 rounded-xl" style={{ borderColor: "#ff9500", backgroundColor: "rgba(255, 149, 0, 0.05)" }}>
          <p className="text-lg text-foreground">
            Browse and purchase educational materials, merchandise, and digital assets
            in a fully immersive 3D shopping experience.
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

export default Store;
