"use client";
import { MapboxMap } from "./mapboxMap";
import { AirportMarkers } from "./airportMarkers";
import { FlightPaths } from "./flightPaths";
import { MapStats } from "./components/MapStats";

export default function FlightMap() {
  return (
    <div className="relative" style={{ width: "100vw", height: "100vh" }}>
      <MapboxMap>
        <AirportMarkers />
        <FlightPaths />
      </MapboxMap>
      <MapStats />
    </div>
  );
}
