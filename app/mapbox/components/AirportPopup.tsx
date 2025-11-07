import { useState } from "react";
import { useSelectedAirport } from "../flightContext";
import { isValidCode } from "../utils";
import { useFlightStats } from "../hooks/useFlightStats";
import { useTopAirports } from "../hooks/useTopAirports";

interface AirportPopupProps {
  airportData: string[];
}

export const AirportPopup = ({ airportData }: AirportPopupProps) => {
  const { setSelectedAirport } = useSelectedAirport();
  const flightStats = useFlightStats();
  const topAirports = useTopAirports(10000); // Get all routes (no practical limit)
  const [expandedOutbound, setExpandedOutbound] = useState(false);
  const [expandedInbound, setExpandedInbound] = useState(false);

  const displayOutbound = expandedOutbound
    ? topAirports.outbound
    : topAirports.outbound.slice(0, 3);
  const displayInbound = expandedInbound
    ? topAirports.inbound
    : topAirports.inbound.slice(0, 3);
  const hasMoreOutbound = topAirports.outbound.length > 3;
  const hasMoreInbound = topAirports.inbound.length > 3;

  return (
    <div className="w-fit max-w-[180px] p-1.5 bg-gray-900/60 backdrop-blur-md rounded-lg">
      {/* Header */}
      <div className="mb-1 pb-1 border-b border-gray-800/50">
        <h2 className="text-xs font-bold text-gray-100 mb-0.5 break-words leading-tight">
          {airportData[1]}
        </h2>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          {isValidCode(airportData[0]) && (
            <a
              href={`https://en.wikipedia.org/w/index.php?title=Special:Search&search=${encodeURIComponent(
                airportData[1]
              )} airport`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide hover:text-blue-400 transition-colors duration-200 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              {airportData[0]}
            </a>
          )}
          {isValidCode(airportData[2]) && (
            <p className="text-[9px] text-gray-500 uppercase tracking-wide">
              {airportData[2]}
            </p>
          )}
          <span className="text-[8px] text-gray-600">
            {Number(airportData[3]).toFixed(1)}°
            {Number(airportData[3]) >= 0 ? "N" : "S"}{" "}
            {Math.abs(Number(airportData[4])).toFixed(1)}°
            {Number(airportData[4]) >= 0 ? "E" : "W"}
          </span>
        </div>
      </div>

      {/* Flight Statistics */}
      <div className="mb-1 pb-1 border-b border-gray-800/50">
        <h3 className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
          Flights
        </h3>
        <div className="grid grid-cols-3 gap-0.5">
          <div className="text-center">
            <div className="text-xs font-bold text-gray-200">
              {flightStats.departing}
            </div>
            <div className="text-[9px] text-gray-500">Out</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-bold text-gray-200">
              {flightStats.arriving}
            </div>
            <div className="text-[9px] text-gray-500">In</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-bold text-blue-500">
              {flightStats.total}
            </div>
            <div className="text-[9px] text-gray-500">Tot</div>
          </div>
        </div>
      </div>

      {/* Top Routes Table */}
      {(topAirports.outbound.length > 0 || topAirports.inbound.length > 0) && (
        <div className="mb-1 pb-1 border-b border-gray-800/50">
          <div className="grid grid-cols-2 gap-4">
            {/* Outbound Column */}
            <div className="flex-1">
              <div className="text-[8px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                Outbound
              </div>
              <div className="space-y-0.5 max-h-[200px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {displayOutbound.map((airport, index) => (
                  <button
                    key={airport.code}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAirport(airport.code);
                    }}
                    onFocus={(e) => {
                      // Prevent auto-focus on first render
                      e.target.blur();
                    }}
                    autoFocus={false}
                    className="flex items-center gap-1.5 text-[8px] w-full text-left hover:bg-gray-800/60 rounded px-0.5 py-0.5 transition-colors duration-150 cursor-pointer"
                  >
                    <span className="text-gray-600 font-mono">
                      {index + 1}.
                    </span>
                    {isValidCode(airport.iata) ? (
                      <span className="font-semibold text-blue-500 uppercase truncate hover:text-blue-400">
                        {airport.iata}
                      </span>
                    ) : isValidCode(airport.icao) ? (
                      <span className="font-semibold text-blue-500 uppercase truncate hover:text-blue-400">
                        {airport.icao}
                      </span>
                    ) : (
                      <span className="font-semibold text-blue-500 uppercase truncate hover:text-blue-400">
                        {airport.code}
                      </span>
                    )}
                    <span className="text-gray-400 font-medium">
                      {airport.count}
                    </span>
                  </button>
                ))}
                {/* Show more/less button */}
                {hasMoreOutbound && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedOutbound(!expandedOutbound);
                    }}
                    className="text-[7px] text-gray-500 hover:text-gray-400 w-full text-left px-0.5 py-0.5 transition-colors duration-150 cursor-pointer"
                  >
                    {expandedOutbound
                      ? `Show less (${topAirports.outbound.length - 3} hidden)`
                      : `+${topAirports.outbound.length - 3} more`}
                  </button>
                )}
                {/* Fill empty slots if outbound has fewer than 3 routes */}
                {!hasMoreOutbound &&
                  topAirports.outbound.length < 3 &&
                  Array.from({ length: 3 - topAirports.outbound.length }).map(
                    (_, index) => (
                      <div
                        key={`outbound-empty-${index}`}
                        className="h-[20px]"
                      />
                    )
                  )}
              </div>
            </div>

            {/* Inbound Column */}
            <div className="flex-1">
              <div className="text-[8px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                Inbound
              </div>
              <div className="space-y-0.5 max-h-[200px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {displayInbound.map((airport, index) => (
                  <button
                    key={airport.code}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAirport(airport.code);
                    }}
                    onFocus={(e) => {
                      // Prevent auto-focus on first render
                      e.target.blur();
                    }}
                    autoFocus={false}
                    className="flex items-center gap-1.5 text-[8px] w-full text-left hover:bg-gray-800/60 rounded px-0.5 py-0.5 transition-colors duration-150 cursor-pointer"
                  >
                    <span className="text-gray-600 font-mono">
                      {index + 1}.
                    </span>
                    {isValidCode(airport.iata) ? (
                      <span className="font-semibold text-blue-500 uppercase truncate hover:text-blue-400">
                        {airport.iata}
                      </span>
                    ) : isValidCode(airport.icao) ? (
                      <span className="font-semibold text-blue-500 uppercase truncate hover:text-blue-400">
                        {airport.icao}
                      </span>
                    ) : (
                      <span className="font-semibold text-blue-500 uppercase truncate hover:text-blue-400">
                        {airport.code}
                      </span>
                    )}
                    <span className="text-gray-400 font-medium">
                      {airport.count}
                    </span>
                  </button>
                ))}
                {/* Show more/less button */}
                {hasMoreInbound && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedInbound(!expandedInbound);
                    }}
                    className="text-[7px] text-gray-500 hover:text-gray-400 w-full text-left px-0.5 py-0.5 transition-colors duration-150 cursor-pointer"
                  >
                    {expandedInbound
                      ? `Show less (${topAirports.inbound.length - 3} hidden)`
                      : `+${topAirports.inbound.length - 3} more`}
                  </button>
                )}
                {/* Fill empty slots if inbound has fewer than 3 routes */}
                {!hasMoreInbound &&
                  topAirports.inbound.length < 3 &&
                  Array.from({ length: 3 - topAirports.inbound.length }).map(
                    (_, index) => (
                      <div
                        key={`inbound-empty-${index}`}
                        className="h-[20px]"
                      />
                    )
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
