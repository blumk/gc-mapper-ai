import { useState } from "react";
import { Source, Layer } from "react-map-gl";
import flights from "./flights.json";
import airports from "./airports.json";
import type { Feature, Point } from "geojson";
//@ts-ignore see https://github.com/Turfjs/turf/issues/2559
import { greatCircle, point, lineString, featureCollection } from "@turf/turf";

export const FlightPaths = () => {
  const [flights] = useState(getFlights());

  return (
    <Source id="polylineLayer" type="geojson" data={flights}>
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

const getFlights = () => {
  const features: Array<Feature<Point>> = [];
  flights.forEach((flight) => {
    //@ts-ignore
    const from = airports[flight[0]];
    //@ts-ignore
    const to = airports[flight[1]];
    features.push(
      createLine([
        // Note order: longitude, latitude per the GeoJSON standard.
        [from[1], from[0]],
        [to[1], to[0]],
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
