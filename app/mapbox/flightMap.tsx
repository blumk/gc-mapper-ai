"use client";
import { MapboxMap } from "./mapboxMap";
import { AirportMarkers } from "./airportMarkers";
import { FlightPaths } from "./flightPaths";

export default function FlightMap() {
  return (
    <MapboxMap>
      <AirportMarkers />
      <FlightPaths />
    </MapboxMap>
  );
}
