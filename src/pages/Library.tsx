import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Library = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold" style={{ color: "#b84dff" }}>📚 Library Portal</h1>
        <p className="text-xl text-muted-foreground">
          Access the vast digital knowledge repository
        </p>
        <div className="p-8 border-2 rounded-xl" style={{ borderColor: "#b84dff", backgroundColor: "rgba(184, 77, 255, 0.05)" }}>
          <p className="text-lg text-foreground">
            Explore millions of books, journals, and research papers. Your personal library
            in the virtual realm with AI-powered search and recommendations.
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

export default Library;
