import { useMemo, useState } from "react";
import { Marker, Popup } from "react-map-gl";
import { AirportIcon } from "./airportIcon";
import { useFlightDataContext } from "./flightContext";

export const AirportMarkers = () => {
  const [selectedAirport, setSelectedAirport] = useState<null | string>(null);

  const context = useFlightDataContext();
  if (context.flightData.loading) null;
  const airports = context.flightData.airports;
  const pins = useMemo(
    () =>
      [...airports.keys()].map((airport, index) => (
        <Marker
          key={`marker-${index}`}
          //@ts-ignore
          longitude={airports.get(airport)[3]}
          //@ts-ignore
          latitude={airports.get(airport)[2]}
          anchor="center"
          onClick={(e) => {
            // If we let the click event propagates to the map, it will immediately close the popup
            // with `closeOnClick: true`
            e.originalEvent.stopPropagation();
            setSelectedAirport(airport);
          }}
        >
          <AirportIcon />
        </Marker>
      )),
    [airports]
  );

  return (
    <>
      {pins}
      {selectedAirport && (
        <Popup
          anchor="top"
          //@ts-ignore
          longitude={airports[selectedAirport][1]}
          //@ts-ignore
          latitude={airports[selectedAirport][0]}
          onClose={() => setSelectedAirport(null)}
        >
          <div>
            <h1 className="text-black">{selectedAirport}</h1>,
            <a
              target="_new"
              className="text-black"
              href={`http://en.wikipedia.org/w/index.php?title=Special:Search&search=${selectedAirport} airport`}
            >
              Wikipedia
            </a>
          </div>
        </Popup>
      )}
    </>
  );
};
