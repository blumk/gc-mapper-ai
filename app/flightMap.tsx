"use client";
import { useState } from "react";
import Map, { Source, Layer } from "react-map-gl";
import flights from "./flights.json";
import airports from "./airports.json";
import type { FeatureCollection, Geometry, Feature } from "geojson";

export default function FlightMap() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const [flights] = useState(getFlights());

  return (
    <Map
      mapLib={import("mapbox-gl")}
      initialViewState={{
        longitude: -100,
        latitude: 40,
        zoom: 2,
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
            "line-color": "rgba(3, 170, 238, 0.5)",
            "line-width": 5,
          }}
        />
      </Source>
    </Map>
  );
}

const getFlights = () => {
  const features: Array<Feature<Geometry>> = [];
  flights.forEach((flight) => {
    //@ts-ignore
    const from = airports[flight[0]];
    //@ts-ignore
    const to = airports[flight[1]];
    features.push(
      createLine([
        [from[1], from[0]],
        [to[1], to[0]],
      ])
    );
  });
  const collection: FeatureCollection = {
    type: "FeatureCollection",
    features,
  };

  return collection;
};

const createLine = (coordinates: [number[], number[]]) => {
  const line: Feature<Geometry> = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates,
    },
  };
  return line;
};
