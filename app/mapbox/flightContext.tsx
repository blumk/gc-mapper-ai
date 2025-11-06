"use client";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { loadAirports } from "../openflights/parseAirports";
import {
  loadUniqueFlightConnections,
  loadAllFlights,
} from "../openflights/parseFlights";

export interface FlightData {
  loading: boolean;
  airports: Map<string, string[]>;
  flights: string[][]; // Unique routes for map visualization
  allFlights: string[][]; // All flights (both directions) for statistics
}

const useFlightData = () => {
  const [flightData, setFlightData] = useState<FlightData>({
    loading: true,
    airports: new Map(),
    flights: [],
    allFlights: [],
  });

  useEffect(() => {
    const loadData = async () => {
      const start = performance.now();

      const allAirports = await loadAirports();
      const flights = await loadUniqueFlightConnections();
      const allFlights = await loadAllFlights();

      // Build airport Map first for O(1) lookups - much faster than O(n*m)
      const airportMap = new Map<string, string[]>();
      allAirports.forEach((airport) => {
        airportMap.set(airport[0], airport);
      });

      // Collect needed airport codes from flights
      const neededAirportCodes = new Set<string>();
      flights.forEach((flight) => {
        neededAirportCodes.add(flight[0]);
        neededAirportCodes.add(flight[1]);
      });
      console.log("Requested airports: ", neededAirportCodes.size);

      // Filter to only airports we need and that exist
      const validAirports = new Map<string, string[]>();
      neededAirportCodes.forEach((code) => {
        const airport = airportMap.get(code);
        if (airport) {
          validAirports.set(code, airport);
        } else {
          console.log("Airport not found: ", code);
        }
      });

      // Filter out flights where either airport is missing
      const validFlights = flights.filter((flight) => {
        return validAirports.has(flight[0]) && validAirports.has(flight[1]);
      });

      console.log("Valid airports: ", validAirports.size);
      console.log("Valid flights: ", validFlights.length);

      const end = performance.now();
      console.log(`Data load complete: ${end - start} ms`);

      // Filter all flights to only include those with valid airports
      const validAllFlights = allFlights.filter((flight) => {
        return validAirports.has(flight[0]) && validAirports.has(flight[1]);
      });

      setFlightData({
        loading: false,
        airports: validAirports,
        flights: validFlights,
        allFlights: validAllFlights,
      });
    };

    loadData();
  }, []);

  return {
    flightData,
    setFlightData,
  };
};

export const FlightContext = createContext(
  {} as ReturnType<typeof useFlightData>
);

export const useFlightDataContext = () => {
  const context = useContext(FlightContext);
  if (context === undefined) {
    throw new Error("useFlightContext must be within FlightContextProvider");
  }

  return context;
};

export const FlightContextProvider = ({ children }: PropsWithChildren) => {
  return (
    <FlightContext.Provider value={useFlightData()}>
      {children}
    </FlightContext.Provider>
  );
};
