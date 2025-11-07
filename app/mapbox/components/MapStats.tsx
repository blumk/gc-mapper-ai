import { useFlightDataContext, useSelectedAirport } from "../flightContext";

export const MapStats = () => {
  const context = useFlightDataContext();
  const { selectedAirport } = useSelectedAirport();
  const { loading, airports, allFlights } = context.flightData;

  // Hide stats when an airport is selected or when loading
  if (loading || selectedAirport) {
    return null;
  }

  const totalAirports = airports.size;
  const totalFlights = allFlights.length;
  const uniqueRoutes = new Set(
    allFlights.map((flight) => `${flight[0]}-${flight[1]}`)
  ).size;

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-gray-900/60 backdrop-blur-md rounded-lg shadow-sm border border-gray-800/50 px-4 py-2 sm:px-5 sm:py-2.5">
      <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-5 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500/70"></div>
          <span className="text-gray-500 font-normal">Airports</span>
          <span className="text-gray-300 font-medium ml-1">
            {totalAirports.toLocaleString()}
          </span>
        </div>
        <div className="hidden sm:block w-px h-5 bg-gray-800/50"></div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600/70"></div>
          <span className="text-gray-500 font-normal">Total Flights</span>
          <span className="text-gray-300 font-medium ml-1">
            {totalFlights.toLocaleString()}
          </span>
        </div>
        <div className="hidden sm:block w-px h-5 bg-gray-800/50"></div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600/70"></div>
          <span className="text-gray-500 font-normal">Unique Routes</span>
          <span className="text-gray-300 font-medium ml-1">
            {uniqueRoutes.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
