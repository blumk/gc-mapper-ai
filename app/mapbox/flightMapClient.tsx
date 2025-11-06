"use client";
import dynamic from "next/dynamic";

const FlightMap = dynamic(() => import("./flightMap"), {
  loading: () => <p>Loading...</p>,
  ssr: false, // Disable SSR for map components to prevent hydration mismatches
});

export default FlightMap;
