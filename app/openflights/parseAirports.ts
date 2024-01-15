"use server";
const airportsCSV = require("./airports.csv");

export const loadAirports = async () => {
  const airports: string[][] = [];

  const start = performance.now();
  return new Promise<string[][]>((resolve, reject) => {
    airportsCSV.forEach((row: string[]) => {
      airports.push([row[3], row[4], row[5], row[6]]);
    });

    console.log(`total airports: ${airports.length}`);
    const end = performance.now();
    console.log(`airport execution time: ${end - start} ms`);
    resolve(airports);
  });
};
