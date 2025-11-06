"use client";
import dynamic from "next/dynamic";
import LoadingSpinner from "./LoadingSpinner";

const FlightMap = dynamic(() => import("./flightMap"), {
  loading: () => <LoadingSpinner />,
  ssr: false, // Disable SSR for map components to prevent hydration mismatches
});

export default FlightMap;
