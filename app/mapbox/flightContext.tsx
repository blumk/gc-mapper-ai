"use client";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { loadAirports } from "../openflights/parseAirports";
import { loadUniqueFlightConnections } from "../openflights/parseFlights";

export interface FlightData {
  loading: boolean;
  airports: Map<string, string[]>;
  flights: string[][];
}

const useFlightData = () => {
  const [flightData, setFlightData] = useState<FlightData>({
    loading: true,
    airports: new Map(),
    flights: [],
  });

  useEffect(() => {
    const loadData = async () => {
      const start = performance.now();

      const allAirports = await loadAirports();
      const flights = await loadUniqueFlightConnections();
      const airports = new Map();
      flights.map((flight) => {
        airports.set(flight[0], undefined);
        airports.set(flight[1], undefined);
      });
      console.log("Requested airports: ", airports.size);

      // lookup airport data
      allAirports.forEach((airport) => {
        if (airports.has(airport[0])) {
          airports.set(airport[0], airport);
        }
      });
      // remove aiports without data
      [...airports.keys()].forEach((airport) => {
        if (airports.get(airport) === undefined) {
          console.log("Airport not found: ", airport);
          airports.delete(airport);
          // TODO remove flight
        }
      });
      // update state
      console.log("Valid airports: ", airports.size);
      setFlightData({ loading: false, airports, flights });

      const end = performance.now();
      console.log(`Data load complete: ${end - start} ms`);
    };

    console.log("xxxx LOAD");
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
