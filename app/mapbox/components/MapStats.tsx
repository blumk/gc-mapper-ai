"use client";
import { useState } from "react";
import { useFlightDataContext, useSelectedAirport } from "../flightContext";

export const MapStats = () => {
  const context = useFlightDataContext();
  const { selectedAirport } = useSelectedAirport();
  const { loading, airports, allFlights } = context.flightData;
  const [isExpanded, setIsExpanded] = useState(false);

  // Hide stats when an airport is selected or when loading
  if (loading || selectedAirport) {
    return null;
  }

  const totalAirports = airports.size;
  const totalFlights = allFlights.length;
  const uniqueRoutes = new Set(
    allFlights.map((flight) => `${flight[0]}-${flight[1]}`)
  ).size;

  return (
    <div className="absolute top-4 left-[calc(50%+20px)] -translate-x-1/2 z-10 bg-gray-900/60 backdrop-blur-md rounded-lg shadow-sm border border-gray-800/50 w-fit sm:w-auto sm:left-1/2">
      {/* Mobile: Collapsible button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="sm:hidden px-3 py-2 flex items-center justify-between text-xs whitespace-nowrap"
        aria-label={isExpanded ? "Collapse stats" : "Expand stats"}
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600/70"></div>
          <span className="text-gray-300 font-medium">
            {totalFlights.toLocaleString()} flights
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Mobile: Expanded content */}
      <div
        className={`sm:hidden overflow-hidden transition-all duration-200 ${
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-3 pb-2 flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600/70"></div>
              <span className="text-gray-500 font-normal">Total Flights</span>
            </div>
            <span className="text-gray-300 font-medium">
              {totalFlights.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600/70"></div>
              <span className="text-gray-500 font-normal">Unique Routes</span>
            </div>
            <span className="text-gray-300 font-medium">
              {uniqueRoutes.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500/70"></div>
              <span className="text-gray-500 font-normal">Airports</span>
            </div>
            <span className="text-gray-300 font-medium">
              {totalAirports.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop: Always visible horizontal layout */}
      <div className="hidden sm:flex items-center gap-5 px-5 py-2.5 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600/70"></div>
          <span className="text-gray-500 font-normal">Total Flights</span>
          <span className="text-gray-300 font-medium ml-1">
            {totalFlights.toLocaleString()}
          </span>
        </div>
        <div className="w-px h-5 bg-gray-800/50"></div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600/70"></div>
          <span className="text-gray-500 font-normal">Unique Routes</span>
          <span className="text-gray-300 font-medium ml-1">
            {uniqueRoutes.toLocaleString()}
          </span>
        </div>
        <div className="w-px h-5 bg-gray-800/50"></div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500/70"></div>
          <span className="text-gray-500 font-normal">Airports</span>
          <span className="text-gray-300 font-medium ml-1">
            {totalAirports.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
