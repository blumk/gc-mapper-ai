import { useEffect, useMemo, useState } from "react";
import { Marker, Popup } from "react-map-gl";
import { AirportIcon } from "./airportIcon";
import { useFlightDataContext } from "./flightContext";

export const AirportMarkers = () => {
  const [mounted, setMounted] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState<null | string>(null);

  const context = useFlightDataContext();
  const airports = context.flightData.airports;

  // Ensure component only renders after client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

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
  const flightStats = useMemo(() => {
    if (!selectedAirport || !context.flightData.flights) {
      return { departing: 0, arriving: 0, total: 0 };
    }
    const departing = context.flightData.flights.filter(
      (flight) => flight[0] === selectedAirport
    ).length;
    const arriving = context.flightData.flights.filter(
      (flight) => flight[1] === selectedAirport
    ).length;
    return { departing, arriving, total: departing + arriving };
  }, [selectedAirport, context.flightData.flights]);

  // Return null during SSR and initial render to prevent hydration mismatch
  if (!mounted || context.flightData.loading) return null;

  return (
    <>
      {pins}
      {selectedAirport && selectedAirportData && (
        <Popup
          anchor="top"
          longitude={Number(selectedAirportData[4])}
          latitude={Number(selectedAirportData[3])}
          onClose={() => setSelectedAirport(null)}
          closeButton={true}
          closeOnClick={false}
          className="airport-popup"
        >
          <div className="w-fit max-w-xs">
            {/* Header */}
            <div className="mb-3 pb-3 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-1 break-words">
                {selectedAirportData[1]}
              </h2>
              <div className="flex items-baseline gap-2">
                <p className="text-sm font-semibold text-sky-600 uppercase tracking-wide">
                  {selectedAirport}
                </p>
                {selectedAirportData[2] && (
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {selectedAirportData[2]}
                  </p>
                )}
              </div>
            </div>

            {/* Flight Statistics */}
            <div className="mb-3 pb-3 border-b border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Flight Connections
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {flightStats.departing}
                  </div>
                  <div className="text-xs text-gray-600">Departing</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {flightStats.arriving}
                  </div>
                  <div className="text-xs text-gray-600">Arriving</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-sky-600">
                    {flightStats.total}
                  </div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
              </div>
            </div>

            {/* Coordinates */}
            <div className="mb-3 pb-3 border-b border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Location
              </h3>
              <div className="space-y-1 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-600">Latitude:</span>
                  <span className="font-mono font-medium">
                    {Number(selectedAirportData[3]).toFixed(4)}°
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Longitude:</span>
                  <span className="font-mono font-medium">
                    {Number(selectedAirportData[4]).toFixed(4)}°
                  </span>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="flex gap-2">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://en.wikipedia.org/w/index.php?title=Special:Search&search=${encodeURIComponent(
                  selectedAirportData[1]
                )} airport`}
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors duration-200 text-center"
              >
                Wikipedia
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://www.google.com/maps/search/?api=1&query=${Number(
                  selectedAirportData[3]
                )},${Number(selectedAirportData[4])}`}
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 text-center"
              >
                Maps
              </a>
            </div>
          </div>
        </Popup>
      )}
    </>
  );
};
