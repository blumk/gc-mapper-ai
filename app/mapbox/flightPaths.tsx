import { useEffect, useState } from "react";
import { Source, Layer } from "react-map-gl";
import type { Feature, Point } from "geojson";
//@ts-ignore see https://github.com/Turfjs/turf/issues/2559
import { greatCircle, point, lineString, featureCollection } from "@turf/turf";
import { useFlightDataContext } from "./flightContext";

export const FlightPaths = () => {
  const [flightPaths, setFlightPaths] = useState();
  const context = useFlightDataContext();

  useEffect(() => {
    if (context.flightData.loading) {
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
  }, [context]);

  if (context.flightData.loading) null;

  return (
    <Source id="polylineLayer" type="geojson" data={flightPaths}>
      <Layer
        id="lineLayer"
        type="line"
        source="my-data"
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
  const features: Array<Feature<Point>> = [];

  flights.forEach((flight) => {
    const from = airports.get(flight[0]);
    const to = airports.get(flight[1]);
    if (!from) {
      console.log("airport not found: ", flight[0]);
      return;
    }

    if (!to) {
      console.log("airport not found: ", flight[1]);
      return;
    }
    features.push(
      createLine([
        // Note order: longitude, latitude per the GeoJSON standard.
        [Number(from[3]), Number(from[2])],
        [Number(to[3]), Number(to[2])],
      ])
    );
  });

  // Mapbox does not use shortest path by default, see https://github.com/mapbox/mapbox-gl-js/issues/11813#issuecomment-1872461121
  const greatCircleData = convertToGreatCircle(features);
  return featureCollection(greatCircleData);
};

const createLine = (coordinates: [number[], number[]]) => {
  return lineString(coordinates);
};

const convertToGreatCircle = (features: Array<Feature<Point>>) => {
  const greatCircleData: Array<Feature<Point>> = [];
  features.forEach((feature) => {
    const getStart = feature.geometry.coordinates[0];
    const getEnd = feature.geometry.coordinates[1];
    const start = point(getStart);
    const end = point(getEnd);
    greatCircleData.push(greatCircle(start, end));
  });

  return greatCircleData;
};
