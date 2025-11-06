import { useEffect, useState, useMemo } from "react";
import { Source, Layer } from "react-map-gl";
import type { Feature, Point } from "geojson";
//@ts-ignore see https://github.com/Turfjs/turf/issues/2559
import { greatCircle, point, featureCollection, bbox } from "@turf/turf";
import { useFlightDataContext, useSelectedAirport } from "./flightContext";
import { useMap } from "./mapboxMap";

export const FlightPaths = () => {
  const [mounted, setMounted] = useState(false);
  const [flightPaths, setFlightPaths] = useState();
  const context = useFlightDataContext();
  const { selectedAirport } = useSelectedAirport();
  const map = useMap();

  // Ensure component only renders after client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || context.flightData.loading) {
      return;
    }

    const start = performance.now();
    const flightPaths = plotFlightPaths(
      context.flightData.flights,
      context.flightData.airports
    );
    setFlightPaths(flightPaths);
    const end = performance.now();
    console.log(`GCM Execution time: ${end - start} ms`);
  }, [
    mounted,
    context.flightData.loading,
    context.flightData.flights,
    context.flightData.airports,
  ]);

  // Filter flights connected to selected airport
  const highlightedFlights = useMemo(() => {
    if (!selectedAirport || !context.flightData.flights || !flightPaths) {
      return null;
    }

    const highlighted = context.flightData.flights.filter(
      (flight) => flight[0] === selectedAirport || flight[1] === selectedAirport
    );

    if (highlighted.length === 0) return null;

    return plotFlightPaths(highlighted, context.flightData.airports);
  }, [
    selectedAirport,
    context.flightData.flights,
    context.flightData.airports,
    flightPaths,
  ]);

  // Zoom to fit highlighted routes when airport is selected, ensuring popup stays in viewport
  useEffect(() => {
    if (!mounted || !selectedAirport || !highlightedFlights || !map) return;

    try {
      // Calculate bounding box of highlighted routes
      const bounds = bbox(highlightedFlights);

      // Get selected airport coordinates
      const selectedAirportData = context.flightData.airports.get(selectedAirport);
      if (!selectedAirportData) return;

      const airportLon = Number(selectedAirportData[4]);
      const airportLat = Number(selectedAirportData[3]);

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
      
      // Fit bounds with generous padding to ensure popup space
      map.fitBounds(
        [
          [bounds[0], bounds[1]], // Southwest corner [lng, lat]
          [bounds[2], bounds[3]], // Northeast corner [lng, lat]
        ],
        {
          padding: { 
            top: Math.max(totalSpaceAbove, viewportHeight / 3), // Very generous top padding
            bottom: 100, 
            left: Math.max(totalSpaceSides, 150), // Generous side padding
            right: Math.max(totalSpaceSides, 150) 
          },
          duration: 1000,
          maxZoom: 8,
        }
      );
      
      // After fitBounds, verify and adjust using actual popup DOM position
      const verifyAndAdjust = () => {
        // Wait for popup to render, then check actual DOM position
        const checkPopup = () => {
          try {
            // Find the actual popup DOM element
            const popupElement = document.querySelector('.airport-popup .mapboxgl-popup') as HTMLElement;
            
            if (!popupElement) {
              // If popup not found yet, try again after a short delay
              setTimeout(checkPopup, 50);
              return;
            }
            
            // Get actual popup position from DOM
            const popupRect = popupElement.getBoundingClientRect();
            const viewportRect = {
              top: 0,
              left: 0,
              bottom: viewportHeight,
              right: viewportWidth,
            };
            
            // Check if popup is outside viewport
            const margin = 20;
            let needsAdjustment = false;
            let deltaX = 0;
            let deltaY = 0;
            
            // Check each edge
            if (popupRect.top < viewportRect.top + margin) {
              deltaY = (viewportRect.top + margin) - popupRect.top;
              needsAdjustment = true;
            }
            
            if (popupRect.bottom > viewportRect.bottom - margin) {
              deltaY = (viewportRect.bottom - margin) - popupRect.bottom;
              needsAdjustment = true;
            }
            
            if (popupRect.left < viewportRect.left + margin) {
              deltaX = (viewportRect.left + margin) - popupRect.left;
              needsAdjustment = true;
            }
            
            if (popupRect.right > viewportRect.right - margin) {
              deltaX = (viewportRect.right - margin) - popupRect.right;
              needsAdjustment = true;
            }
            
            // Adjust map if popup is outside viewport
            if (needsAdjustment) {
              const currentBounds = map.getBounds();
              if (!currentBounds) return;
              
              const ne = currentBounds.getNorthEast();
              const sw = currentBounds.getSouthWest();
              const latRange = ne.lat - sw.lat;
              const lonRange = ne.lng - sw.lng;
              
              // Convert pixel deltas to geographic deltas
              const latDelta = -(deltaY / viewportHeight) * latRange;
              const lonDelta = (deltaX / viewportWidth) * lonRange;
              
              const currentCenter = map.getCenter();
              map.flyTo({
                center: [
                  currentCenter.lng + lonDelta,
                  currentCenter.lat + latDelta
                ],
                zoom: map.getZoom(),
                duration: 400,
              });
            }
          } catch (error) {
            console.error("Error verifying popup position:", error);
          }
        };
        
        // Start checking after a short delay to ensure popup is rendered
        setTimeout(checkPopup, 150);
      };
      
      // Use moveend event to check after animation completes
      const handleMoveEnd = () => {
        verifyAndAdjust();
        map.off('moveend', handleMoveEnd);
      };
      
      map.once('moveend', handleMoveEnd);
    } catch (error) {
      console.error("Error fitting bounds:", error);
    }
  }, [selectedAirport, highlightedFlights, map, mounted, context.flightData.airports]);

  // Return null during SSR and initial render to prevent hydration mismatch
  if (!mounted || context.flightData.loading || !flightPaths) return null;

  return (
    <>
      {/* All flight paths (dimmed when airport is selected) */}
      <Source id="polylineLayer" type="geojson" data={flightPaths}>
        <Layer
          id="lineLayer"
          type="line"
          source="polylineLayer"
          layout={{
            "line-join": "round",
            "line-cap": "round",
          }}
          paint={{
            "line-color": selectedAirport
              ? "rgba(3, 170, 238, 0.2)"
              : "rgba(3, 170, 238, 0.7)",
            "line-width": 1.5,
          }}
        />
      </Source>

      {/* Highlighted routes for selected airport */}
      {highlightedFlights && (
        <Source id="highlightedLayer" type="geojson" data={highlightedFlights}>
          <Layer
            id="highlightedLineLayer"
            type="line"
            source="highlightedLayer"
            layout={{
              "line-join": "round",
              "line-cap": "round",
            }}
            paint={{
              "line-color": "rgba(59, 130, 246, 1)",
              "line-width": 3,
            }}
          />
        </Source>
      )}
    </>
  );
};

const plotFlightPaths = (
  flights: string[][],
  airports: Map<string, string[]>
) => {
  // Combine all operations in one pass - avoid creating intermediate arrays
  // Mapbox does not use shortest path by default, see https://github.com/mapbox/mapbox-gl-js/issues/11813#issuecomment-1872461121
  const greatCircleFeatures: Array<Feature<Point>> = [];

  flights.forEach((flight) => {
    const from = airports.get(flight[0]);
    const to = airports.get(flight[1]);

    // Flights should already be filtered, but double-check for safety
    if (!from || !to) {
      return;
    }

    // Create great circle directly without intermediate lineString
    // Data structure: [IATA, Name, ICAO, Latitude, Longitude]
    const start = point([Number(from[4]), Number(from[3])]); // [longitude, latitude]
    const end = point([Number(to[4]), Number(to[3])]);
    greatCircleFeatures.push(greatCircle(start, end));
  });

  return featureCollection(greatCircleFeatures);
};
