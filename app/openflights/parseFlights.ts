"use server";
import fs from "node:fs";
import { parse } from "csv-parse";

export const loadUniqueFlightConnections = async () => {
  const allFlights = [];
  const uniqueRoutes = new Set<string>();

  const start = performance.now();
  return new Promise<string[][]>((resolve, reject) => {
    fs.createReadStream(process.cwd() + "/app/openflights/demo.csv")
      .pipe(parse({ delimiter: ",", from_line: 2 }))
      .on("data", function (row) {
        allFlights.push(row);
        const route = `${row[1]}-${row[2]}`;
        const inverseRoute = `${row[2]}-${row[1]}`;
        if (!uniqueRoutes.has(inverseRoute)) {
          // skip inverse routes (= return flight)
          uniqueRoutes.add(route);
        }
      })
      .on("close", () => {
        const result = Array.from(uniqueRoutes).map((flights) =>
          flights.split("-")
        );
        console.log(`total flights: ${allFlights.length}`);
        console.log(`unique routes: ${uniqueRoutes.size}`);
        const end = performance.now();
        console.log(`flight execution time: ${end - start} ms`);
        resolve(result);
      });
  });
};
