"use client";
import { useEffect, useState, useRef } from "react";

const loadingMessages = [
  "Loading map...",
  "Parsing flights...",
  "Plotting airports...",
  "Calculating routes...",
  "Rendering connections...",
  "Optimizing display...",
  "Preparing visualization...",
  "Loading flight data...",
  "Building map layers...",
  "Finalizing view...",
];

export default function LoadingSpinner() {
  // Start with index 0 to prevent hydration mismatch (Math.random() differs on server/client)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const currentIndexRef = useRef(currentMessageIndex);
  const [mounted, setMounted] = useState(false);

  // Set mounted flag and initialize random message only on client
  useEffect(() => {
    setMounted(true);
    // Initialize with random message only after mount
    const initialIndex = Math.floor(Math.random() * loadingMessages.length);
    setCurrentMessageIndex(initialIndex);
    currentIndexRef.current = initialIndex;
  }, []);

  useEffect(() => {
    currentIndexRef.current = currentMessageIndex;
  }, [currentMessageIndex]);

  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        // Pick a random message, avoiding the current one
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * loadingMessages.length);
        } while (
          newIndex === currentIndexRef.current &&
          loadingMessages.length > 1
        );
        setCurrentMessageIndex(newIndex);
        setIsVisible(true);
      }, 300); // Half of transition duration
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(interval);
  }, [mounted]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-[3px] border-gray-200 dark:border-gray-700 border-t-gray-600 dark:border-t-gray-400 rounded-full animate-spin"></div>
        </div>
        <div className="h-6 flex items-center">
          <p
            className={`text-sm text-gray-600 dark:text-gray-300 font-light tracking-wide transition-all duration-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-1"
            }`}
          >
            {loadingMessages[currentMessageIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
