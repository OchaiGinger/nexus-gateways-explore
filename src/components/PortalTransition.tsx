import { useState, useEffect } from "react";

interface PortalTransitionProps {
  isTransitioning: boolean;
  portalName: string;
}

export function PortalTransition({ isTransitioning, portalName }: PortalTransitionProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isTransitioning) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [isTransitioning]);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "radial-gradient(circle, rgba(0,212,255,0.3) 0%, rgba(0,0,0,0.95) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        animation: "fadeIn 0.5s ease-in",
      }}
    >
      <div style={{ textAlign: "center", color: "#00ffff" }}>
        <h2 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "1rem", textShadow: "0 0 20px #00ffff" }}>
          Entering Portal
        </h2>
        <p style={{ fontSize: "1.5rem", opacity: 0.8 }}>{portalName}</p>
        <div style={{ marginTop: "2rem" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              border: "3px solid #00ffff",
              borderTop: "3px solid transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto",
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
