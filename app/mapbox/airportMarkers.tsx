import { useEffect, useMemo, useState } from "react";
import { Marker, Popup } from "react-map-gl";
import { AirportIcon } from "./airportIcon";
import { useFlightDataContext, useSelectedAirport } from "./flightContext";

// Helper to check if a code is valid (not empty or \N)
const isValidCode = (code: string | undefined): boolean => {
  return !!(code && code !== "\\N" && code.trim() !== "");
};

export const AirportMarkers = () => {
  const [mounted, setMounted] = useState(false);
  const { selectedAirport, setSelectedAirport } = useSelectedAirport();

  const context = useFlightDataContext();
  const airports = context.flightData.airports;

  // Ensure component only renders after client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Note: Map zooming is handled in FlightPaths component to fit all highlighted routes

  // Use airport code as key instead of index for better React reconciliation
  // Depend on airports.size instead of entire Map object
  // Handle loading state inside useMemo to avoid conditional hook calls
  const pins = useMemo(() => {
    if (!mounted || context.flightData.loading || airports.size === 0) {
      return [];
    }
    return [...airports.entries()].map(([code, airportData]) => (
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
        <AirportIcon />
      </Marker>
    ));
  }, [mounted, context.flightData.loading, airports.size, airports]);

  const selectedAirportData = selectedAirport
    ? airports.get(selectedAirport)
    : null;

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

  // Return null during SSR and initial render to prevent hydration mismatch
  if (!mounted || context.flightData.loading) return null;

  const popupOffset: [number, number] = [0, -10];

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
