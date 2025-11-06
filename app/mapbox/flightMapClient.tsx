"use client";
import dynamic from "next/dynamic";

const FlightMap = dynamic(() => import("./flightMap"), {
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-[3px] border-gray-200 dark:border-gray-700 border-t-gray-600 dark:border-t-gray-400 rounded-full animate-spin"></div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-light tracking-wide">Loading map...</p>
      </div>
    </div>
  ),
  ssr: false, // Disable SSR for map components to prevent hydration mismatches
});

export default FlightMap;
