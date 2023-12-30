"use client";
import { useState } from "react";
import Map, { Source, Layer } from "react-map-gl";
import flights from "./flights.json";
import airports from "./airports.json";
import type { Feature, Point } from "geojson";
import { greatCircle, point, lineString, featureCollection } from "@turf/turf";

export default function FlightMap() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const [flights] = useState(getFlights());

  return (
    <Map
      mapLib={import("mapbox-gl")}
      initialViewState={{
        longitude: -100,
        latitude: 40,
        zoom: 1.5,
      }}
      style={{ width: "100vw", height: "100vh" }}
      mapStyle="mapbox://styles/blumk/clqrgy8cf00cu01ob4nrufv5k"
      mapboxAccessToken={mapboxToken}
      onRender={(event) => event.target.resize()}
    >
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
    </Map>
  );
}

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
