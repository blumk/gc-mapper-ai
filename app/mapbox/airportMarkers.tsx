import { useMemo, useState } from "react";
import { Marker } from "react-map-gl";
import { AirportIcon } from "./airportIcon";
import airports from "./airports.json";

export const AirportMarkers = () => {
  const [popupInfo, setPopupInfo] = useState<null | string>(null);

  const uniqueAirports = Object.keys(airports);
  const pins = useMemo(
    () =>
      uniqueAirports.map((airport, index) => (
        <Marker
          key={`marker-${index}`}
          //@ts-ignore
          longitude={airports[airport][1]}
          //@ts-ignore
          latitude={airports[airport][0]}
          anchor="center"
          onClick={(e) => {
            // If we let the click event propagates to the map, it will immediately close the popup
            // with `closeOnClick: true`
            e.originalEvent.stopPropagation();
            setPopupInfo(airport);
          }}
        >
          <AirportIcon />
        </Marker>
      )),
    []
  );

  return <>{pins}</>;
};
