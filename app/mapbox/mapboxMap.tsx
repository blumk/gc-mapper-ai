import Map, { NavigationControl, FullscreenControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapboxMapProps {
  children: string | JSX.Element | JSX.Element[] | Element[];
}

export const MapboxMap = ({ children }: MapboxMapProps) => {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
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
      // mapStyle="mapbox://styles/mapbox/dark-v9"
      mapboxAccessToken={mapboxToken}
      onRender={(event) => event.target.resize()}
    >
      <FullscreenControl position="top-left" />
      <NavigationControl position="top-left" />
      {children}
    </Map>
  );
};
