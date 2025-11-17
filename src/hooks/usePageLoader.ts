import { useEffect, useRef } from "react";
import { useLoading } from "@/context/LoadingContext";

/**
 * Hook to manage loading state and preloading for pages
 * Automatically shows preloader when component mounts and hides after a minimum duration
 */
export function usePageLoader(minDuration: number = 300) {
    const { startLoading, stopLoading, setLoadingMessage } = useLoading();
    const loadingStartTimeRef = useRef<number>(0);

    useEffect(() => {
        startLoading("Loading...");
        loadingStartTimeRef.current = Date.now();

        let timer: NodeJS.Timeout;

        return () => {
            // Ensure minimum loading duration for smoother UX
            const elapsedTime = Date.now() - loadingStartTimeRef.current;
            const remainingTime = Math.max(minDuration - elapsedTime, 0);

            if (remainingTime > 0) {
                timer = setTimeout(() => stopLoading(), remainingTime);
            } else {
                stopLoading();
            }
        };
    }, [startLoading, stopLoading, minDuration]);

    return { setLoadingMessage };
}

/**
 * Preload images for better performance
 */
export async function preloadImages(urls: string[]): Promise<void> {
    const promises = urls.map(
        (url) =>
            new Promise<void>((resolve) => {
                const img = new Image();
                img.onload = () => resolve();
                img.onerror = () => resolve(); // Don't fail on image errors
                img.src = url;
            }),
    );

    await Promise.all(promises);
}

/**
 * Preload and cache data for a page
 */
export async function preloadPageData(loadFn: () => Promise<any>): Promise<void> {
    try {
        await loadFn();
    } catch (error) {
        // Log error but don't break the page loading
        console.warn("Error preloading page data:", error);
    }
}

/**
 * Simulate network delay for demonstration (optional)
 */
export function simulateNetworkDelay(ms: number = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
