import { useEffect, useState } from "react";
import { Source, Layer } from "react-map-gl";
import type { Feature, Point } from "geojson";
//@ts-ignore see https://github.com/Turfjs/turf/issues/2559
import { greatCircle, point, featureCollection } from "@turf/turf";
import { useFlightDataContext } from "./flightContext";

export const FlightPaths = () => {
  const [mounted, setMounted] = useState(false);
  const [flightPaths, setFlightPaths] = useState();
  const context = useFlightDataContext();

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

  // Return null during SSR and initial render to prevent hydration mismatch
  if (!mounted || context.flightData.loading || !flightPaths) return null;

  return (
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
          "line-color": "rgba(3, 170, 238, 0.7)",
          "line-width": 1.5,
        }}
      />
    </Source>
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
