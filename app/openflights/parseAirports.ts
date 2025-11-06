"use server";
const airportsCSV = require("./airports.csv");

export const loadAirports = async () => {
  const start = performance.now();

  // Use map instead of forEach + push for better performance
  const airports: string[][] = airportsCSV.map((row: string[]) => [
    row[3], // airport code
    row[4], // airport name
    row[5], // latitude
    row[6], // longitude
  ]);

  const end = performance.now();
  console.log(`total airports: ${airports.length}`);
  console.log(`airport execution time: ${end - start} ms`);

  return airports;
};
