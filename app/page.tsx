import dynamic from "next/dynamic";
import { FlightContextProvider } from "./mapbox/flightContext";

const FlightMap = dynamic(() => import("./mapbox/flightMap"), {
  loading: () => <p>Loading...</p>,
});

export default function Home() {
  return (
    <FlightContextProvider>
      <FlightMap />
    </FlightContextProvider>
  );
}
