"use server";
const airportsCSV = require("./airports.csv");

export const loadAirports = async () => {
  const start = performance.now();

  // Use map instead of forEach + push for better performance
  // CSV format: Airport Name, City, Country, IATA Code, ICAO Code, Latitude, Longitude
  const airports: string[][] = airportsCSV.map((row: string[]) => [
    row[3], // IATA code (3 letters) - index 0
    row[0], // airport name - index 1
    row[4], // ICAO code (4 letters) - index 2
    row[5], // latitude - index 3
    row[6], // longitude - index 4
  ]);

  const end = performance.now();
  console.log(`total airports: ${airports.length}`);
  console.log(`airport execution time: ${end - start} ms`);

  return airports;
};
