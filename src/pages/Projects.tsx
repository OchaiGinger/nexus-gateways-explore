import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Projects = () => {
  const projects = [
    { name: "Exams Portal", description: "Interactive examination system", color: "#00d4ff" },
    { name: "Library Portal", description: "Digital knowledge repository", color: "#b84dff" },
    { name: "Campus Map", description: "Virtual campus navigation", color: "#00ff88" },
    { name: "3D Store", description: "Immersive shopping experience", color: "#ff9500" },
    { name: "AI Tutor", description: "Personalized learning assistant", color: "#ff4dff" },
    { name: "Project Writer", description: "Collaborative writing tool", color: "#ffff00" },
    { name: "Study Room", description: "Virtual study environment", color: "#8a4dff" },
    { name: "I Seek", description: "Search and discovery portal", color: "#00d4ff" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-primary">Portal Projects</h1>
          <p className="text-xl text-muted-foreground">
            Explore the eight portals that make up our educational universe
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <Card key={index} className="border-2 hover:scale-105 transition-transform" style={{ borderColor: project.color }}>
              <CardHeader>
                <CardTitle style={{ color: project.color }}>{project.name}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-2 rounded-full" style={{ backgroundColor: project.color, opacity: 0.3 }} />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center pt-4">
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

export default Projects;
