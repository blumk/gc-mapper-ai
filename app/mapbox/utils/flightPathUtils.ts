import type { Feature, Point } from "geojson";
//@ts-ignore see https://github.com/Turfjs/turf/issues/2559
import { greatCircle, point, featureCollection } from "@turf/turf";

/**
 * Plots flight paths as great circle routes between airports
 * @param flights - Array of [fromICAO, toICAO] flight routes
 * @param airports - Map of ICAO code to airport data [IATA, Name, ICAO, Latitude, Longitude]
 * @returns FeatureCollection of great circle paths
 */
export const plotFlightPaths = (
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

