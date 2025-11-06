"use server";
const flightsCSV = require("./demo.csv");

export const loadUniqueFlightConnections = async () => {
  const start = performance.now();
  const uniqueRoutes = new Set<string>();

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

  const result = Array.from(uniqueRoutes).map((route) => route.split("-"));
  const end = performance.now();
  console.log(`unique routes: ${uniqueRoutes.size}`);
  console.log(`flight execution time: ${end - start} ms`);

  return result;
};
