import { useEffect } from "react";
//@ts-ignore see https://github.com/Turfjs/turf/issues/2559
import { bbox } from "@turf/turf";
import type { FeatureCollection } from "geojson";
import { useFlightDataContext, useSelectedAirport } from "../flightContext";
import { useMap } from "../mapboxMap";

export const useMapZoom = (
  highlightedFlights: FeatureCollection | null,
  mounted: boolean
) => {
  const { selectedAirport } = useSelectedAirport();
  const context = useFlightDataContext();
  const map = useMap();

  useEffect(() => {
    if (!mounted || !selectedAirport || !highlightedFlights || !map) return;

    try {
      // Calculate bounding box of highlighted routes
      const bounds = bbox(highlightedFlights);

      // Validate bounds - ensure lat/lng are within valid ranges
      const minLon = Math.max(-180, Math.min(180, bounds[0]));
      const minLat = Math.max(-90, Math.min(90, bounds[1]));
      const maxLon = Math.max(-180, Math.min(180, bounds[2]));
      const maxLat = Math.max(-90, Math.min(90, bounds[3]));

      // Check if bounds are valid
      if (
        !isFinite(minLon) ||
        !isFinite(minLat) ||
        !isFinite(maxLon) ||
        !isFinite(maxLat) ||
        minLon >= maxLon ||
        minLat >= maxLat
      ) {
        console.error("Invalid bounds calculated:", bounds);
        return;
      }

      // Get selected airport coordinates
      const selectedAirportData =
        context.flightData.airports.get(selectedAirport);
      if (!selectedAirportData) return;

      const airportLon = Number(selectedAirportData[4]);
      const airportLat = Number(selectedAirportData[3]);

      // Validate airport coordinates
      if (
        !isFinite(airportLon) ||
        !isFinite(airportLat) ||
        airportLat < -90 ||
        airportLat > 90 ||
        airportLon < -180 ||
        airportLon > 180
      ) {
        console.error("Invalid airport coordinates:", airportLon, airportLat);
        return;
      }

      // Get viewport dimensions
      const container = map.getContainer();
      const viewportHeight = container.clientHeight;
      const viewportWidth = container.clientWidth;

      // Popup dimensions (conservative estimates)
      const popupHeight = 200; // Slightly larger to be safe
      const popupWidth = 160;
      const markerHeight = 32;
      const popupOffset = 20; // Offset from marker

      // Calculate total space needed above marker for popup
      const totalSpaceAbove = popupHeight + markerHeight + popupOffset + 30; // Extra margin
      const totalSpaceSides = popupWidth / 2 + 30; // Half width + margin

      // Calculate bounds with padding (using validated values)
      const sw: [number, number] = [minLon, minLat];
      const ne: [number, number] = [maxLon, maxLat];

      // Fit bounds with generous padding to ensure popup space
      // Set minZoom to prevent zooming out too far (continent level, not entire globe)
      // Single smooth transition - no post-render adjustments
      map.fitBounds([sw, ne], {
        padding: {
          top: Math.max(totalSpaceAbove, viewportHeight / 3), // Very generous top padding
          bottom: 100,
          left: Math.max(totalSpaceSides, 150), // Generous side padding
          right: Math.max(totalSpaceSides, 150),
        },
        duration: 1000,
        maxZoom: 8,
        minZoom: 2.5, // Prevent zooming out to show entire globe
      });
    } catch (error) {
      console.error("Error fitting bounds:", error);
    }
  }, [
    selectedAirport,
    highlightedFlights,
    map,
    mounted,
    context.flightData.airports,
  ]);
};

