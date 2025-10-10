import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About Us" },
    { to: "/industries", label: "Get Started" },
    { to: "/team", label: "Contact" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative w-9 h-9">
                <img
                  src="/quantum.png"
                  alt="QuantumSentinel logo"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="font-heading font-bold text-xl text-foreground">
                QuantumSentinel
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-muted-foreground hover:text-primary transition-colors font-medium relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </Link>
              ))}
              <Button className="bg-gradient-primary hover:shadow-hover transition-all">
                Secure Now
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-primary transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={toggleMenu}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-card border-l border-border shadow-xl">
            <div className="flex flex-col h-full p-6">
              <div className="flex items-center justify-between mb-8">
                <Link
                  to="/"
                  className="flex items-center space-x-2"
                  onClick={toggleMenu}
                >
                  <img
                    src="/quantum.png"
                    alt="QuantumSentinel logo"
                    className="w-7 h-7 object-contain"
                  />
                  <span className="font-heading font-bold text-lg">
                    QuantumSentinel
                  </span>
                </Link>
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-md text-muted-foreground hover:text-primary transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="flex flex-col space-y-4 flex-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={toggleMenu}
                    className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <Button className="w-full bg-gradient-primary hover:shadow-hover transition-all mt-6">
                Secure Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

