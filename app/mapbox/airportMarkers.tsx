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
        longitude={Number(airportData[3])}
        latitude={Number(airportData[2])}
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

  // Return null during SSR and initial render to prevent hydration mismatch
  if (!mounted || context.flightData.loading) return null;

  return (
    <>
      {pins}
      {selectedAirport && selectedAirportData && (
        <Popup
          anchor="top"
          longitude={Number(selectedAirportData[3])}
          latitude={Number(selectedAirportData[2])}
          onClose={() => setSelectedAirport(null)}
        >
          <div>
            <h1 className="text-black">{selectedAirport}</h1>
            <a
              target="_new"
              className="text-black"
              href={`http://en.wikipedia.org/w/index.php?title=Special:Search&search=${selectedAirport} airport`}
            >
              Wikipedia
            </a>
          </div>
        </Popup>
      )}
    </>
  );
};
