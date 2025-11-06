import { useSelectedAirport } from "../flightContext";
import { isValidCode } from "../utils";
import { useFlightStats } from "../hooks/useFlightStats";
import { useTopAirports } from "../hooks/useTopAirports";

interface AirportPopupProps {
  airportData: string[];
}

export const AirportPopup = ({ airportData }: AirportPopupProps) => {
  const { setSelectedAirport } = useSelectedAirport();
  const flightStats = useFlightStats();
  const topAirports = useTopAirports(3);

  return (
    <div className="w-fit max-w-[120px] p-1.5">
      {/* Header */}
      <div className="mb-1 pb-1 border-b border-gray-200">
        <h2 className="text-xs font-bold text-gray-900 mb-0.5 break-words leading-tight">
          {airportData[1]}
        </h2>
        <div className="flex items-baseline gap-1">
          {isValidCode(airportData[0]) && (
            <p className="text-[10px] font-semibold text-sky-600 uppercase tracking-wide">
              {airportData[0]}
            </p>
          )}
          {isValidCode(airportData[2]) && (
            <p className="text-[9px] text-gray-500 uppercase tracking-wide">
              {airportData[2]}
            </p>
          )}
        </div>
      </div>

      {/* Flight Statistics */}
      <div className="mb-1 pb-1 border-b border-gray-200">
        <h3 className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
          Flights
        </h3>
        <div className="grid grid-cols-3 gap-0.5">
          <div className="text-center">
            <div className="text-xs font-bold text-gray-900">
              {flightStats.departing}
            </div>
            <div className="text-[9px] text-gray-600">Out</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-bold text-gray-900">
              {flightStats.arriving}
            </div>
            <div className="text-[9px] text-gray-600">In</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-bold text-sky-600">
              {flightStats.total}
            </div>
            <div className="text-[9px] text-gray-600">Tot</div>
          </div>
        </div>
      </div>

      {/* Top Connected Airports */}
      {topAirports.length > 0 && (
        <div className="mb-1 pb-1 border-b border-gray-200">
          <h3 className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
            Top Routes
          </h3>
          <div className="space-y-0.5">
            {topAirports.map((airport, index) => (
              <button
                key={airport.code}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAirport(airport.code);
                }}
                className="flex items-center justify-between text-[8px] w-full text-left hover:bg-gray-50 rounded px-0.5 py-0.5 transition-colors duration-150 cursor-pointer"
              >
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <span className="text-gray-400 font-mono">{index + 1}.</span>
                  {isValidCode(airport.iata) ? (
                    <span className="font-semibold text-sky-600 uppercase truncate hover:text-sky-700">
                      {airport.iata}
                    </span>
                  ) : isValidCode(airport.icao) ? (
                    <span className="font-semibold text-sky-600 uppercase truncate hover:text-sky-700">
                      {airport.icao}
                    </span>
                  ) : (
                    <span className="font-semibold text-sky-600 uppercase truncate hover:text-sky-700">
                      {airport.code}
                    </span>
                  )}
                </div>
                <span className="text-gray-500 font-medium ml-1">
                  {airport.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Coordinates */}
      <div className="mb-1 text-[8px] text-gray-500">
        {Number(airportData[3]).toFixed(1)}°
        {Number(airportData[3]) >= 0 ? "N" : "S"}{" "}
        {Math.abs(Number(airportData[4])).toFixed(1)}°
        {Number(airportData[4]) >= 0 ? "E" : "W"}
      </div>

      {/* Links */}
      <div className="flex gap-1">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`https://en.wikipedia.org/w/index.php?title=Special:Search&search=${encodeURIComponent(
            airportData[1]
          )} airport`}
          className="flex-1 px-1.5 py-0.5 text-[9px] font-medium text-white bg-sky-600 hover:bg-sky-700 rounded transition-colors duration-200 text-center"
        >
          Wiki
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.google.com/maps/search/?api=1&query=${Number(
            airportData[3]
          )},${Number(airportData[4])}`}
          className="flex-1 px-1.5 py-0.5 text-[9px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors duration-200 text-center"
        >
          Map
        </a>
      </div>
    </div>
  );
};

