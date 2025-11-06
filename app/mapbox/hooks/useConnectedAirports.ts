import { useMemo } from "react";
import { useFlightDataContext, useSelectedAirport } from "../flightContext";

export const useConnectedAirports = () => {
  const { selectedAirport } = useSelectedAirport();
  const context = useFlightDataContext();

  return useMemo(() => {
    if (!selectedAirport || !context.flightData.flights) {
      return new Set<string>();
    }
    const connected = new Set<string>();
    context.flightData.flights.forEach((flight) => {
      if (flight[0] === selectedAirport) {
        connected.add(flight[1]);
      } else if (flight[1] === selectedAirport) {
        connected.add(flight[0]);
      }
    });
    return connected;
  }, [selectedAirport, context.flightData.flights]);
};

