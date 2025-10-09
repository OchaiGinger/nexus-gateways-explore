import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-4xl text-center text-primary">Contact Portal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-lg text-muted-foreground">
            Ready to explore the portal universe? Get in touch with us.
          </p>
          
          <div className="space-y-4">
            <div className="p-4 border border-primary/30 rounded-lg">
              <h3 className="font-semibold text-primary mb-2">📧 Email</h3>
              <p className="text-muted-foreground">portal@universe.edu</p>
            </div>
            
            <div className="p-4 border border-secondary/30 rounded-lg">
              <h3 className="font-semibold text-secondary mb-2">🌐 Location</h3>
              <p className="text-muted-foreground">The Portal Universe - Sector 7G</p>
            </div>
            
            <div className="p-4 border border-accent/30 rounded-lg">
              <h3 className="font-semibold text-accent mb-2">⏰ Hours</h3>
              <p className="text-muted-foreground">24/7 in the Virtual Realm</p>
            </div>
          </div>

          <div className="text-center pt-4">
            <Link to="/">
              <Button variant="default" size="lg">
                Return to Portal World
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Contact;
