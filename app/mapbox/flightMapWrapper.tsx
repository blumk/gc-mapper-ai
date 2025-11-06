"use client";
import { useEffect, useState } from "react";
import { FlightContextProvider } from "./flightContext";
import FlightMapClient from "./flightMapClient";
import LoadingSpinner from "./LoadingSpinner";

export default function FlightMapWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until after mount
  if (!mounted) {
    return <LoadingSpinner />;
  }

  return (
    <FlightContextProvider>
      <FlightMapClient />
    </FlightContextProvider>
  );
}
