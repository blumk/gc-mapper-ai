"use server";
const flightsCSV = require("./demo.csv");

export const loadUniqueFlightConnections = async () => {
  const allFlights = [];
  const uniqueRoutes = new Set<string>();

  const start = performance.now();
  return new Promise<string[][]>((resolve, reject) => {
    flightsCSV.forEach((flight: string[]) => {
      if (flight[0] === "Data") {
        // skip header (openflights format)
        return;
      }
      const route = `${flight[1]}-${flight[2]}`;
      const inverseRoute = `${flight[2]}-${flight[1]}`;
      if (!uniqueRoutes.has(inverseRoute)) {
        // skip inverse routes (= return flight)
        uniqueRoutes.add(route);
      }
    });

    const result = Array.from(uniqueRoutes).map((flights) =>
      flights.split("-")
    );
    console.log(`total flights: ${allFlights.length}`);
    console.log(`unique routes: ${uniqueRoutes.size}`);
    const end = performance.now();
    console.log(`flight execution time: ${end - start} ms`);
    resolve(result);
  });
};
