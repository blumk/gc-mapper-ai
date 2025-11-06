import { useEffect, useMemo, useState } from "react";
import { Marker, Popup } from "react-map-gl";
import { AirportIcon } from "./airportIcon";
import { AirportPopup } from "./components/AirportPopup";
import { useFlightDataContext, useSelectedAirport } from "./flightContext";
import { useConnectedAirports } from "./hooks/useConnectedAirports";

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

  // Get connected airports (destinations) for the selected airport
  const connectedAirports = useConnectedAirports();

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
          closeButton={false}
          closeOnClick={true}
          className="airport-popup"
          offset={popupOffset}
          maxWidth="none"
        >
          <AirportPopup airportData={selectedAirportData} />
        </Popup>
      )}
    </>
  );
};
