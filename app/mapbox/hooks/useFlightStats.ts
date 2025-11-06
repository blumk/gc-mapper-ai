import { useMemo } from "react";
import { useFlightDataContext, useSelectedAirport } from "../flightContext";

export const useFlightStats = () => {
  const { selectedAirport } = useSelectedAirport();
  const context = useFlightDataContext();

  return useMemo(() => {
    if (!selectedAirport || !context.flightData.allFlights) {
      return { departing: 0, arriving: 0, total: 0 };
    }

    // Count flights for display (departing and arriving) from all flights
    const departing = context.flightData.allFlights.filter(
      (flight) => flight[0] === selectedAirport
    ).length;
    const arriving = context.flightData.allFlights.filter(
      (flight) => flight[1] === selectedAirport
    ).length;

    // Total is the sum of all flights (departing + arriving)
    return {
      departing,
      arriving,
      total: departing + arriving,
    };
  }, [selectedAirport, context.flightData.allFlights]);
};

