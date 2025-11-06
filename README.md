# Great Circle Mapper

An interactive web application that visualizes flight routes as great circle paths on a world map. Explore airports, view flight connections, and see the shortest paths between destinations.

**🌐 Live Demo:** [https://gc-mapper-ai.vercel.app/](https://gc-mapper-ai.vercel.app/)

<img width="1290" height="709" alt="Screenshot 2025-10-26 at 4 06 29 PM" src="https://github.com/user-attachments/assets/cfff5014-be7b-4306-8295-9e0496621218" />

## Features

- **Interactive World Map**: Navigate and explore airports across the globe using Mapbox GL
- **Great Circle Paths**: Visualize flight routes as accurate great circle arcs (the shortest distance between two points on a sphere)
- **Airport Markers**: Click on any airport to view detailed information
- **Flight Statistics**: See departing, arriving, and total flight connections for each airport
- **Smart Airport Lookup**: Supports both IATA (3-letter) and ICAO (4-letter) airport codes
- **Smooth Animations**: Map smoothly pans and centers when selecting airports
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with React 19
- **Mapping**: [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) via [react-map-gl](https://visgl.github.io/react-map-gl/)
- **Geospatial Calculations**: [@turf/turf](https://turfjs.org/) for great circle path calculations
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Data Processing**: CSV parsing for airport and flight data
- **Deployment**: [Vercel](https://vercel.com/)

## How It Works

The application processes flight data and airport information to:

1. **Load Airport Data**: Parses airport information including IATA/ICAO codes, names, and coordinates
2. **Process Flight Routes**: Converts flight data to unique routes and calculates great circle paths
3. **Normalize Airport Codes**: Uses ICAO codes internally (unique 4-letter codes) while supporting multiple IATA codes per airport
4. **Render Visualizations**: Displays airports as interactive markers and flight paths as curved lines on the map

## Getting Started

### Prerequisites

- Node.js >= 22.0.0
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd gc-mapper-ai
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

Get your Mapbox access token from [mapbox.com](https://account.mapbox.com/access-tokens/)

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
gc-mapper-ai/
├── app/
│   ├── mapbox/              # Map components
│   │   ├── airportMarkers.tsx    # Airport markers and popups
│   │   ├── flightPaths.tsx        # Great circle path rendering
│   │   ├── flightContext.tsx      # Global flight data state
│   │   └── mapboxMap.tsx          # Map container component
│   ├── openflights/          # Data parsing
│   │   ├── airports.csv           # Airport database
│   │   ├── demo.csv               # Flight data
│   │   ├── parseAirports.ts      # Airport data parser
│   │   └── parseFlights.ts       # Flight data parser
│   └── page.tsx              # Main page
├── public/                   # Static assets
└── README.md
```

## Key Features Explained

### Great Circle Paths

Flight routes are displayed as great circle arcs, which represent the shortest distance between two points on the Earth's surface. This is how aircraft actually navigate long distances.

### Airport Code Handling

- **IATA Codes**: 3-letter codes (e.g., `JFK`, `LAX`) used for passenger-facing operations
- **ICAO Codes**: 4-letter codes (e.g., `KJFK`, `KLAX`) used for air traffic control
- The application uses ICAO codes internally for unique identification, while supporting multiple IATA codes that may map to the same airport (e.g., `BSL`, `MLH`, `EAP` all map to Basel-Mulhouse Airport `LFSB`)

### Interactive Popups

Click on any airport marker to:

- View airport name and codes
- See flight connection statistics (departing, arriving, total)
- Access location coordinates
- Open Wikipedia or Google Maps links

## Building for Production

```bash
npm run build
npm start
```

## Deployment

The application is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com/)
3. Add your `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` environment variable
4. Deploy!

The live version is available at [https://gc-mapper-ai.vercel.app/](https://gc-mapper-ai.vercel.app/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.
