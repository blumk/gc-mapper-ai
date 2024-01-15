"use server";
import fs from "node:fs";
import { parse } from "csv-parse";

export const loadAirports = async () => {
  const airports: string[][] = [];

  const start = performance.now();
  return new Promise<string[][]>((resolve, reject) => {
    fs.createReadStream(process.cwd() + "/app/openflights/airports.csv")
      .pipe(parse({ delimiter: "," }))
      .on("data", function (row) {
        airports.push([row[3], row[4], row[5], row[6]]);
      })
      .on("close", () => {
        console.log(`total airports: ${airports.length}`);
        const end = performance.now();
        console.log(`airport execution time: ${end - start} ms`);
        resolve(airports);
      });
  });
};
