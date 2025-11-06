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

      // Build IATA -> ICAO mapping (multiple IATA codes can map to same ICAO)
      // and ICAO -> Airport data mapping (ICAO is unique)
      const iataToIcaoMap = new Map<string, string>();
      const airportMapByICAO = new Map<string, string[]>();

      allAirports.forEach((airport) => {
        // Index 0 = IATA code, Index 2 = ICAO code
        const iataCode = airport[0];
        const icaoCode = airport[2];

        // Build IATA -> ICAO mapping (handles multiple IATA codes for same airport)
        // \N is used in OpenFlights format to represent NULL/empty values
        const hasValidIATA =
          iataCode && iataCode !== "\\N" && iataCode.trim() !== "";
        const hasValidICAO =
          icaoCode && icaoCode !== "\\N" && icaoCode.trim() !== "";

        if (hasValidIATA && hasValidICAO) {
          iataToIcaoMap.set(iataCode, icaoCode);
        }

        // Store airports by ICAO code (unique identifier)
        if (hasValidICAO) {
          // Only store if we don't have it yet, or if this entry has an IATA code
          // (prefer entries with IATA codes for display)
          const existing = airportMapByICAO.get(icaoCode);
          if (!existing || hasValidIATA) {
            airportMapByICAO.set(icaoCode, airport);
          }
        }
      });

      // Convert flight data from IATA/ICAO codes to ICAO codes for internal use
      const convertToICAO = (code: string): string | null => {
        // If it's already an ICAO code (4 letters), use it directly
        if (code.length === 4) {
          return airportMapByICAO.has(code) ? code : null;
        }
        // Otherwise, try to convert IATA to ICAO
        return iataToIcaoMap.get(code) || null;
      };

      // Convert flights to use ICAO codes internally
      const flightsICAO = flights
        .map((flight) => {
          const fromICAO = convertToICAO(flight[0]);
          const toICAO = convertToICAO(flight[1]);
          if (fromICAO && toICAO) {
            return [fromICAO, toICAO];
          }
          return null;
        })
        .filter((flight): flight is string[] => flight !== null);

      const allFlightsICAO = allFlights
        .map((flight) => {
          const fromICAO = convertToICAO(flight[0]);
          const toICAO = convertToICAO(flight[1]);
          if (fromICAO && toICAO) {
            return [fromICAO, toICAO];
          }
          return null;
        })
        .filter((flight): flight is string[] => flight !== null);

      // Collect all unique ICAO codes from converted flights
      const neededICAOCodes = new Set<string>();
      flightsICAO.forEach((flight) => {
        neededICAOCodes.add(flight[0]);
        neededICAOCodes.add(flight[1]);
      });
      console.log("Requested airports (ICAO): ", neededICAOCodes.size);

      // Build valid airports map using ICAO codes as keys
      const validAirports = new Map<string, string[]>();
      neededICAOCodes.forEach((icaoCode) => {
        const airport = airportMapByICAO.get(icaoCode);
        if (airport) {
          validAirports.set(icaoCode, airport);
        } else {
          console.log("Airport not found (ICAO): ", icaoCode);
        }
      });

      console.log("Valid airports: ", validAirports.size);
      console.log("Valid flights: ", flightsICAO.length);

      const end = performance.now();
      console.log(`Data load complete: ${end - start} ms`);

      setFlightData({
        loading: false,
        airports: validAirports, // Keyed by ICAO code
        flights: flightsICAO, // Using ICAO codes internally
        allFlights: allFlightsICAO, // Using ICAO codes internally
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

// Context for selected airport (shared between AirportMarkers and FlightPaths)
export const SelectedAirportContext = createContext<{
  selectedAirport: string | null;
  setSelectedAirport: (airport: string | null) => void;
}>({
  selectedAirport: null,
  setSelectedAirport: () => {},
});

export const useSelectedAirport = () => {
  return useContext(SelectedAirportContext);
};

export const FlightContextProvider = ({ children }: PropsWithChildren) => {
  const [selectedAirport, setSelectedAirport] = useState<string | null>(null);
  
  return (
    <FlightContext.Provider value={useFlightData()}>
      <SelectedAirportContext.Provider value={{ selectedAirport, setSelectedAirport }}>
        {children}
      </SelectedAirportContext.Provider>
    </FlightContext.Provider>
  );
};
