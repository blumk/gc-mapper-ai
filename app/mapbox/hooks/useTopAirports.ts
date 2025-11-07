import { useMemo } from "react";
import { useFlightDataContext, useSelectedAirport } from "../flightContext";

interface TopAirport {
  code: string;
  count: number;
  name: string;
  iata?: string;
  icao?: string;
}

interface TopAirportsResult {
  outbound: TopAirport[];
  inbound: TopAirport[];
}

export const useTopAirports = (limit: number = 3): TopAirportsResult => {
  const { selectedAirport } = useSelectedAirport();
  const context = useFlightDataContext();
  const airports = context.flightData.airports;

  return useMemo(() => {
    if (!selectedAirport || !context.flightData.allFlights || !airports) {
      return { outbound: [], inbound: [] };
    }

    // Count outbound and inbound flights separately
    const outboundCounts = new Map<string, number>();
    const inboundCounts = new Map<string, number>();

    context.flightData.allFlights.forEach((flight) => {
      if (flight[0] === selectedAirport) {
        // Outbound flight
        const count = outboundCounts.get(flight[1]) || 0;
        outboundCounts.set(flight[1], count + 1);
      } else if (flight[1] === selectedAirport) {
        // Inbound flight
        const count = inboundCounts.get(flight[0]) || 0;
        inboundCounts.set(flight[0], count + 1);
      }
    });

    // Convert to arrays and sort by count (descending)
    const topOutbound = Array.from(outboundCounts.entries())
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
      .filter((airport) => airport.name)
      .sort((a, b) => b.count - a.count);

    const topInbound = Array.from(inboundCounts.entries())
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
      .filter((airport) => airport.name)
      .sort((a, b) => b.count - a.count);

    // Apply limit only if it's a reasonable number (not Infinity or very high)
    const limitedOutbound =
      limit > 1000 ? topOutbound : topOutbound.slice(0, limit);
    const limitedInbound =
      limit > 1000 ? topInbound : topInbound.slice(0, limit);

    return { outbound: limitedOutbound, inbound: limitedInbound };
  }, [selectedAirport, context.flightData.allFlights, airports, limit]);
};

