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
    if (!mounted || !selectedAirport || !map) return;

    const selectedAirportData =
      context.flightData.airports.get(selectedAirport);
    if (!selectedAirportData) return;

    const airportLon = Number(selectedAirportData[4]);
    const airportLat = Number(selectedAirportData[3]);

    // Validate coordinates
    if (!isFinite(airportLon) || !isFinite(airportLat)) return;

    const container = map.getContainer();
    const viewportHeight = container.clientHeight;
    const popupSpace = 400; // Space needed for popup above marker

    // Check if popup is visible and zoom out if needed
    const ensurePopupVisible = () => {
      const airportPoint = map.project([airportLon, airportLat]);
      if (airportPoint.y < popupSpace) {
        const currentZoom = map.getZoom();
        map.flyTo({
          center: [airportLon, airportLat],
          zoom: currentZoom - 1,
          duration: 500,
        });
      }
    };

    if (highlightedFlights?.features.length) {
      try {
        const bounds = bbox(highlightedFlights);
        const airportFeature = {
          type: "Feature",
          geometry: { type: "Point", coordinates: [airportLon, airportLat] },
        };

        const allBounds = bbox({
          type: "FeatureCollection",
          features: [...highlightedFlights.features, airportFeature],
        });

        map.fitBounds(
          [
            [allBounds[0], allBounds[1]],
            [allBounds[2], allBounds[3]],
          ],
          {
            padding: { top: popupSpace, bottom: 100, left: 150, right: 150 },
            duration: 1000,
            maxZoom: 8,
            minZoom: 2.5,
          }
        );

        // Check popup visibility after animation
        setTimeout(ensurePopupVisible, 1100);
      } catch (error) {
        console.error("Error fitting bounds:", error);
      }
    } else {
      // No routes: center on airport
      map.flyTo({
        center: [airportLon, airportLat],
        zoom: Math.min(map.getZoom(), 6),
        duration: 1000,
      });

      setTimeout(ensurePopupVisible, 1100);
    }
  }, [
    selectedAirport,
    highlightedFlights,
    map,
    mounted,
    context.flightData.airports,
  ]);
};
