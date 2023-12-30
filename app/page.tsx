import dynamic from "next/dynamic";

const FlightMap = dynamic(() => import("./flightMap"), {
  loading: () => <p>Loading...</p>,
});

export default function Home() {
  return <FlightMap />;
}
