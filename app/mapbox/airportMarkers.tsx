import { useEffect, useMemo, useState } from "react";
import { Marker, Popup } from "react-map-gl";
import { AirportIcon } from "./airportIcon";
import { useFlightDataContext, useSelectedAirport } from "./flightContext";
import { useMap } from "./mapboxMap";

// Helper to check if a code is valid (not empty or \N)
const isValidCode = (code: string | undefined): boolean => {
  return !!(code && code !== "\\N" && code.trim() !== "");
};

export const AirportMarkers = () => {
  const [mounted, setMounted] = useState(false);
  const { selectedAirport, setSelectedAirport } = useSelectedAirport();
  const map = useMap();

  const context = useFlightDataContext();
  const airports = context.flightData.airports;

  // Ensure component only renders after client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Note: Map zooming is handled in FlightPaths component to fit all highlighted routes

  // Get connected airports (destinations) for the selected airport
  const connectedAirports = useMemo(() => {
    if (!selectedAirport || !context.flightData.flights) {
      return new Set<string>();
    }
    const connected = new Set<string>();
    context.flightData.flights.forEach((flight) => {
      if (flight[0] === selectedAirport) {
        connected.add(flight[1]);
      } else if (flight[1] === selectedAirport) {
        connected.add(flight[0]);
      }
    });
    return connected;
  }, [selectedAirport, context.flightData.flights]);

  // Use airport code as key instead of index for better React reconciliation
  // Depend on airports.size instead of entire Map object
  // Handle loading state inside useMemo to avoid conditional hook calls
  const pins = useMemo(() => {
    if (!mounted || context.flightData.loading || airports.size === 0) {
      return [];
    }
    return [...airports.entries()].map(([code, airportData]) => {
      const isSelected = code === selectedAirport;
      const isConnected = connectedAirports.has(code);
      const isUnselected =
        selectedAirport !== null && !isSelected && !isConnected;

      return (
        <Marker
          key={`marker-${code}`}
          longitude={Number(airportData[4])}
          latitude={Number(airportData[3])}
          anchor="center"
          onClick={(e) => {
            // If we let the click event propagates to the map, it will immediately close the popup
            // with `closeOnClick: true`
            e.originalEvent.stopPropagation();
            setSelectedAirport(code);
          }}
        >
          <AirportIcon
            isSelected={isSelected}
            isConnected={isConnected}
            isUnselected={isUnselected}
          />
        </Marker>
      );
    });
  }, [
    mounted,
    context.flightData.loading,
    airports.size,
    airports,
    selectedAirport,
    connectedAirports,
    setSelectedAirport,
  ]);

  const selectedAirportData = selectedAirport
    ? airports.get(selectedAirport)
    : null;

  // Note: Map centering is handled in FlightPaths component to coordinate with route fitting

  // Calculate flight statistics for the selected airport
  // Use allFlights (both directions) for accurate statistics
  const flightStats = useMemo(() => {
    if (!selectedAirport || !context.flightData.allFlights) {
      return { departing: 0, arriving: 0, total: 0 };
    }

    // Count flights for display (departing and arriving) from all flights
    const departing = context.flightData.allFlights.filter(
      (flight) => flight[0] === selectedAirport
    ).length;
    const arriving = context.flightData.allFlights.filter(
      (flight) => flight[1] === selectedAirport
    ).length;

    // Total is the sum of all flights (departing + arriving)
    return {
      departing,
      arriving,
      total: departing + arriving,
    };
  }, [selectedAirport, context.flightData.allFlights]);

  // Get top 3 connected airports with flight counts
  const topAirports = useMemo(() => {
    if (!selectedAirport || !context.flightData.allFlights || !airports) {
      return [];
    }

    // Count flights to/from each connected airport
    const airportCounts = new Map<string, number>();

    context.flightData.allFlights.forEach((flight) => {
      if (flight[0] === selectedAirport) {
        const count = airportCounts.get(flight[1]) || 0;
        airportCounts.set(flight[1], count + 1);
      } else if (flight[1] === selectedAirport) {
        const count = airportCounts.get(flight[0]) || 0;
        airportCounts.set(flight[0], count + 1);
      }
    });

    // Convert to array and sort by flight count (descending)
    const sorted = Array.from(airportCounts.entries())
      .map(([code, count]) => {
        const airportData = airports.get(code);
        return {
          code,
          count,
          name: airportData?.[1] || code,
          iata: airportData?.[0],
          icao: airportData?.[2],
        };
      })
      .filter((airport) => airport.name) // Filter out invalid airports
      .sort((a, b) => b.count - a.count)
      .slice(0, 3); // Top 3

    return sorted;
  }, [selectedAirport, context.flightData.allFlights, airports]);

  // Return null during SSR and initial render to prevent hydration mismatch
  if (!mounted || context.flightData.loading) return null;

  const popupOffset: [number, number] = [0, -20];

  return (
    <>
      {pins}
      {selectedAirport && selectedAirportData && (
        <Popup
          anchor="bottom"
          longitude={Number(selectedAirportData[4])}
          latitude={Number(selectedAirportData[3])}
          onClose={() => setSelectedAirport(null)}
          closeButton={true}
          closeOnClick={true}
          className="airport-popup"
          offset={popupOffset}
          maxWidth="none"
        >
          <div className="w-fit max-w-[120px] p-1.5">
            {/* Header */}
            <div className="mb-1 pb-1 border-b border-gray-200">
              <h2 className="text-xs font-bold text-gray-900 mb-0.5 break-words leading-tight">
                {selectedAirportData[1]}
              </h2>
              <div className="flex items-baseline gap-1">
                {isValidCode(selectedAirportData[0]) && (
                  <p className="text-[10px] font-semibold text-sky-600 uppercase tracking-wide">
                    {selectedAirportData[0]}
                  </p>
                )}
                {isValidCode(selectedAirportData[2]) && (
                  <p className="text-[9px] text-gray-500 uppercase tracking-wide">
                    {selectedAirportData[2]}
                  </p>
                )}
              </div>
            </div>

            {/* Flight Statistics */}
            <div className="mb-1 pb-1 border-b border-gray-200">
              <h3 className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                Flights
              </h3>
              <div className="grid grid-cols-3 gap-0.5">
                <div className="text-center">
                  <div className="text-xs font-bold text-gray-900">
                    {flightStats.departing}
                  </div>
                  <div className="text-[9px] text-gray-600">Out</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-gray-900">
                    {flightStats.arriving}
                  </div>
                  <div className="text-[9px] text-gray-600">In</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-sky-600">
                    {flightStats.total}
                  </div>
                  <div className="text-[9px] text-gray-600">Tot</div>
                </div>
              </div>
            </div>

            {/* Top Connected Airports */}
            {topAirports.length > 0 && (
              <div className="mb-1 pb-1 border-b border-gray-200">
                <h3 className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                  Top Routes
                </h3>
                <div className="space-y-0.5">
                  {topAirports.map((airport, index) => (
                    <button
                      key={airport.code}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAirport(airport.code);
                      }}
                      className="flex items-center justify-between text-[8px] w-full text-left hover:bg-gray-50 rounded px-0.5 py-0.5 transition-colors duration-150 cursor-pointer"
                    >
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <span className="text-gray-400 font-mono">
                          {index + 1}.
                        </span>
                        {isValidCode(airport.iata) ? (
                          <span className="font-semibold text-sky-600 uppercase truncate hover:text-sky-700">
                            {airport.iata}
                          </span>
                        ) : isValidCode(airport.icao) ? (
                          <span className="font-semibold text-sky-600 uppercase truncate hover:text-sky-700">
                            {airport.icao}
                          </span>
                        ) : (
                          <span className="font-semibold text-sky-600 uppercase truncate hover:text-sky-700">
                            {airport.code}
                          </span>
                        )}
                      </div>
                      <span className="text-gray-500 font-medium ml-1">
                        {airport.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Coordinates */}
            <div className="mb-1 text-[8px] text-gray-500">
              {Number(selectedAirportData[3]).toFixed(1)}°
              {Number(selectedAirportData[3]) >= 0 ? "N" : "S"}{" "}
              {Math.abs(Number(selectedAirportData[4])).toFixed(1)}°
              {Number(selectedAirportData[4]) >= 0 ? "E" : "W"}
            </div>

            {/* Links */}
            <div className="flex gap-1">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://en.wikipedia.org/w/index.php?title=Special:Search&search=${encodeURIComponent(
                  selectedAirportData[1]
                )} airport`}
                className="flex-1 px-1.5 py-0.5 text-[9px] font-medium text-white bg-sky-600 hover:bg-sky-700 rounded transition-colors duration-200 text-center"
              >
                Wiki
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://www.google.com/maps/search/?api=1&query=${Number(
                  selectedAirportData[3]
                )},${Number(selectedAirportData[4])}`}
                className="flex-1 px-1.5 py-0.5 text-[9px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors duration-200 text-center"
              >
                Map
              </a>
            </div>
          </div>
        </Popup>
      )}
    </>
  );
};
