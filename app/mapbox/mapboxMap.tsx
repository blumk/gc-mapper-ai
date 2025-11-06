"use client";
import { createContext, useContext, useState } from "react";
import Map, {
  NavigationControl,
  FullscreenControl,
  MapRef,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import type { JSX } from "react";

interface MapboxMapProps {
  children: string | JSX.Element | JSX.Element[] | Element[];
}

// Context to share map instance with child components
const MapContext = createContext<MapRef | null>(null);

export const useMap = () => {
  const map = useContext(MapContext);
  return map; // Return null if not available, let components handle it
};

export const MapboxMap = ({ children }: MapboxMapProps) => {
  const [mapRef, setMapRef] = useState<MapRef | null>(null);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  return (
    <MapContext.Provider value={mapRef}>
      <Map
        ref={(ref) => {
          if (ref) {
            setMapRef(ref);
          }
        }}
        mapLib={import("mapbox-gl")}
        initialViewState={{
          longitude: -100,
          latitude: 40,
          zoom: 1.5,
        }}
        style={{ width: "100vw", height: "100vh" }}
        mapStyle="mapbox://styles/blumk/clqrgy8cf00cu01ob4nrufv5k"
        // mapStyle="mapbox://styles/mapbox/dark-v9"
        mapboxAccessToken={mapboxToken}
        onRender={(event) => event.target.resize()}
      >
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        {children}
      </Map>
    </MapContext.Provider>
  );
};
