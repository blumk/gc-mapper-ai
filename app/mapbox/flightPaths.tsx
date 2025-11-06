import { useEffect, useState, useMemo } from "react";
import { Source, Layer } from "react-map-gl";
import { useFlightDataContext, useSelectedAirport } from "./flightContext";
import { useMapZoom } from "./hooks/useMapZoom";
import { plotFlightPaths } from "./utils/flightPathUtils";

export const FlightPaths = () => {
  const [mounted, setMounted] = useState(false);
  const [flightPaths, setFlightPaths] = useState();
  const context = useFlightDataContext();
  const { selectedAirport } = useSelectedAirport();

  // Ensure component only renders after client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || context.flightData.loading) {
      return;
    }

    const start = performance.now();
    const flightPaths = plotFlightPaths(
      context.flightData.flights,
      context.flightData.airports
    );
    setFlightPaths(flightPaths);
    const end = performance.now();
    console.log(`GCM Execution time: ${end - start} ms`);
  }, [
    mounted,
    context.flightData.loading,
    context.flightData.flights,
    context.flightData.airports,
  ]);

  // Filter flights connected to selected airport
  const highlightedFlights = useMemo(() => {
    if (!selectedAirport || !context.flightData.flights || !flightPaths) {
      return null;
    }

    const highlighted = context.flightData.flights.filter(
      (flight) => flight[0] === selectedAirport || flight[1] === selectedAirport
    );

    if (highlighted.length === 0) return null;

    return plotFlightPaths(highlighted, context.flightData.airports);
  }, [
    selectedAirport,
    context.flightData.flights,
    context.flightData.airports,
    flightPaths,
  ]);

  // Handle map zooming when airport is selected
  useMapZoom(highlightedFlights, mounted);

  // Return null during SSR and initial render to prevent hydration mismatch
  if (!mounted || context.flightData.loading || !flightPaths) return null;

  return (
    <>
      {/* All flight paths (dimmed when airport is selected) */}
      <Source id="polylineLayer" type="geojson" data={flightPaths}>
        <Layer
          id="lineLayer"
          type="line"
          source="polylineLayer"
          layout={{
            "line-join": "round",
            "line-cap": "round",
          }}
          paint={{
            "line-color": selectedAirport
              ? "rgba(3, 170, 238, 0.2)"
              : "rgba(3, 170, 238, 0.7)",
            "line-width": 1.5,
          }}
        />
      </Source>

      {/* Highlighted routes for selected airport */}
      {highlightedFlights && (
        <Source id="highlightedLayer" type="geojson" data={highlightedFlights}>
          <Layer
            id="highlightedLineLayer"
            type="line"
            source="highlightedLayer"
            layout={{
              "line-join": "round",
              "line-cap": "round",
            }}
            paint={{
              "line-color": "rgba(59, 130, 246, 1)",
              "line-width": 3,
            }}
          />
        </Source>
      )}
    </>
  );
};
