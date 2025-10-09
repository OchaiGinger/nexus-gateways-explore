import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold text-primary">About This Portal</h1>
        <p className="text-xl text-muted-foreground">
          Welcome to the 3D Portal Universe - a vast interactive environment where education meets innovation.
        </p>
        <p className="text-lg text-foreground">
          Navigate through immersive portals, each leading to unique educational experiences. 
          Use WASD or arrow keys to explore, and click on portals to discover what lies beyond.
        </p>
        <div className="pt-4">
          <Link to="/">
            <Button variant="default" size="lg">
              Return to Portal World
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
