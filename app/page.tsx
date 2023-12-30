"use client";
// import Image from "next/image";
import Map from "react-map-gl";

export default function Home() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  return (
    <Map
      mapLib={import("mapbox-gl")}
      initialViewState={{
        longitude: -100,
        latitude: 40,
        zoom: 1,
      }}
      style={{ width: "100vw", height: "100vh" }}
      mapStyle="mapbox://styles/blumk/clqrgy8cf00cu01ob4nrufv5k"
      mapboxAccessToken={mapboxToken}
      onRender={(event) => event.target.resize()}
    />
  );
}
