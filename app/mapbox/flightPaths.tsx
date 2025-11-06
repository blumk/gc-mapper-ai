import { useEffect, useState, useMemo } from "react";
import { Source, Layer } from "react-map-gl";
import type { Feature, Point } from "geojson";
//@ts-ignore see https://github.com/Turfjs/turf/issues/2559
import { greatCircle, point, featureCollection, bbox } from "@turf/turf";
import { useFlightDataContext, useSelectedAirport } from "./flightContext";
import { useMap } from "./mapboxMap";

export const FlightPaths = () => {
  const [mounted, setMounted] = useState(false);
  const [flightPaths, setFlightPaths] = useState();
  const context = useFlightDataContext();
  const { selectedAirport } = useSelectedAirport();
  const map = useMap();

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

  // Zoom to fit highlighted routes when airport is selected
  useEffect(() => {
    if (!mounted || !selectedAirport || !highlightedFlights || !map) return;

    try {
      // Calculate bounding box of highlighted routes
      const bounds = bbox(highlightedFlights);

      // Fit map to bounds with padding
      map.fitBounds(
        [
          [bounds[0], bounds[1]], // Southwest corner [lng, lat]
          [bounds[2], bounds[3]], // Northeast corner [lng, lat]
        ],
        {
          padding: { top: 100, bottom: 100, left: 100, right: 100 },
          duration: 1000, // Smooth 1 second transition
          maxZoom: 8, // Don't zoom in too close
        }
      );
    } catch (error) {
      console.error("Error fitting bounds:", error);
    }
  }, [selectedAirport, highlightedFlights, map, mounted]);

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

const plotFlightPaths = (
  flights: string[][],
  airports: Map<string, string[]>
) => {
  // Combine all operations in one pass - avoid creating intermediate arrays
  // Mapbox does not use shortest path by default, see https://github.com/mapbox/mapbox-gl-js/issues/11813#issuecomment-1872461121
  const greatCircleFeatures: Array<Feature<Point>> = [];

  flights.forEach((flight) => {
    const from = airports.get(flight[0]);
    const to = airports.get(flight[1]);

    // Flights should already be filtered, but double-check for safety
    if (!from || !to) {
      return;
    }

    // Create great circle directly without intermediate lineString
    // Data structure: [IATA, Name, ICAO, Latitude, Longitude]
    const start = point([Number(from[4]), Number(from[3])]); // [longitude, latitude]
    const end = point([Number(to[4]), Number(to[3])]);
    greatCircleFeatures.push(greatCircle(start, end));
  });

  return featureCollection(greatCircleFeatures);
};
