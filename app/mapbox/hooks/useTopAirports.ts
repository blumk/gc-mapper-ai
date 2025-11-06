import { useMemo } from "react";
import { useFlightDataContext, useSelectedAirport } from "../flightContext";

interface TopAirport {
  code: string;
  count: number;
  name: string;
  iata?: string;
  icao?: string;
}

export const useTopAirports = (limit: number = 3): TopAirport[] => {
  const { selectedAirport } = useSelectedAirport();
  const context = useFlightDataContext();
  const airports = context.flightData.airports;

  return useMemo(() => {
    if (!selectedAirport || !context.flightData.allFlights || !airports) {
      return [];
    }

    // Count flights to/from each connected airport
    const airportCounts = new Map<string, number>();

    context.flightData.allFlights.forEach((flight) => {
      if (flight[0] === selectedAirport) {
        const count = airportCounts.get(flight[1]) || 0;
        airportCounts.set(flight[1], count + 1);
      } else if (flight[1] === selectedAirport) {
        const count = airportCounts.get(flight[0]) || 0;
        airportCounts.set(flight[0], count + 1);
      }
    });

    // Convert to array and sort by flight count (descending)
    const sorted = Array.from(airportCounts.entries())
      .map(([code, count]) => {
        const airportData = airports.get(code);
        return {
          code,
          count,
          name: airportData?.[1] || code,
          iata: airportData?.[0],
          icao: airportData?.[2],
        };
      })
      .filter((airport) => airport.name) // Filter out invalid airports
      .sort((a, b) => b.count - a.count)
      .slice(0, limit); // Top N

    return sorted;
  }, [selectedAirport, context.flightData.allFlights, airports, limit]);
};

