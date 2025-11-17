import { useEffect, useState } from "react";
import "./Preloader.css";

interface PreloaderProps {
    isLoading: boolean;
    message?: string;
}

export function Preloader({ isLoading, message = "Loading..." }: PreloaderProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isLoading) {
            setShow(true);
        } else {
            // Delay hiding to allow fade-out animation
            const timer = setTimeout(() => setShow(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    if (!show) return null;

    return (
        <div className={`preloader-overlay ${isLoading ? "visible" : "hidden"}`}>
            <div className="preloader-content">
                {/* Animated portal ring */}
                <div className="portal-ring-container">
                    <div className="portal-ring portal-ring-1"></div>
                    <div className="portal-ring portal-ring-2"></div>
                    <div className="portal-ring portal-ring-3"></div>
                </div>

                {/* Center glow */}
                <div className="preloader-glow"></div>

                {/* Loading text with typing effect */}
                <div className="preloader-text">
                    <p className="loading-message">{message}</p>
                    <div className="dots-loader">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>

                {/* Progress indicator */}
                <div className="progress-bar">
                    <div className="progress-fill"></div>
                </div>
            </div>

            {/* Background particles effect */}
            <div className="particles">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="particle" style={{ "--delay": `${i * 0.1}s` } as React.CSSProperties}></div>
                ))}
            </div>
        </div>
    );
}
