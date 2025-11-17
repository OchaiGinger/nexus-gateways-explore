import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLoading } from "@/context/LoadingContext";

interface RouteLoaderProps {
    children: ReactNode;
}

export function RouteLoader({ children }: RouteLoaderProps) {
    const location = useLocation();
    const { startLoading, stopLoading } = useLoading();

    useEffect(() => {
        // Start loading when route changes
        startLoading("Entering Portal...");

        // Create a small delay to show the loader and then stop it
        // This ensures smooth transitions between pages
        const minLoadTime = 300; // Minimum loading time in milliseconds
        const timer = setTimeout(() => {
            stopLoading();
        }, minLoadTime);

        return () => clearTimeout(timer);
    }, [location.pathname, startLoading, stopLoading]);

    return <>{children}</>;
}
