"use client";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useFlightDataContext, useSelectedAirport } from "../flightContext";

// Normalize string by removing diacritics for search matching
const normalizeString = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

interface NormalizedAirport {
  code: string;
  data: string[];
  normalizedIata: string;
  normalizedName: string;
  normalizedIcao: string;
}

export const AirportSearch = () => {
  const context = useFlightDataContext();
  const { setSelectedAirport } = useSelectedAirport();
  const { airports } = context.flightData;
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Pre-compute normalized strings for all airports (memoized)
  const normalizedAirports = useMemo(() => {
    const normalized: NormalizedAirport[] = [];
    airports.forEach((data, icaoCode) => {
      normalized.push({
        code: icaoCode,
        data,
        normalizedIata: normalizeString(data[0] || ""),
        normalizedName: normalizeString(data[1] || ""),
        normalizedIcao: normalizeString(icaoCode),
      });
    });
    return normalized;
  }, [airports]);

  // Debounce search query (250ms delay)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Filter airports based on debounced search query (optimized)
  const filteredAirports = useMemo(() => {
    if (!debouncedQuery.trim()) return [];

    const normalizedQuery = normalizeString(debouncedQuery);
    const queryLength = normalizedQuery.length;
    const results: Array<{
      code: string;
      data: string[];
      match: string;
      matchType: "iata" | "icao" | "name";
    }> = [];

    // Early exit: if query is too short, don't search
    if (queryLength < 1) return [];

    for (const airport of normalizedAirports) {
      // Early exit: check if any field starts with query (fastest check)
      const iataStarts = airport.normalizedIata.startsWith(normalizedQuery);
      const icaoStarts = airport.normalizedIcao.startsWith(normalizedQuery);
      const nameStarts = airport.normalizedName.startsWith(normalizedQuery);

      if (iataStarts || icaoStarts || nameStarts) {
        // Prefer exact start matches
        let match = "";
        let matchType: "iata" | "icao" | "name" = "name";

        if (iataStarts) {
          match = airport.data[0] || "";
          matchType = "iata";
        } else if (icaoStarts) {
          match = airport.code;
          matchType = "icao";
        } else {
          match = airport.data[1] || "";
          matchType = "name";
        }

        results.push({
          code: airport.code,
          data: airport.data,
          match,
          matchType,
        });
      } else {
        // Fallback to includes() only if no start match
        const iataIncludes = airport.normalizedIata.includes(normalizedQuery);
        const icaoIncludes = airport.normalizedIcao.includes(normalizedQuery);
        const nameIncludes = airport.normalizedName.includes(normalizedQuery);

        if (iataIncludes || icaoIncludes || nameIncludes) {
          let match = "";
          let matchType: "iata" | "icao" | "name" = "name";

          if (iataIncludes) {
            match = airport.data[0] || "";
            matchType = "iata";
          } else if (icaoIncludes) {
            match = airport.code;
            matchType = "icao";
          } else {
            match = airport.data[1] || "";
            matchType = "name";
          }

          results.push({
            code: airport.code,
            data: airport.data,
            match,
            matchType,
          });
        }
      }

      // Early exit: if we have enough results, stop searching
      if (results.length >= 20) break;
    }

    // Sort by relevance (exact start matches first, then by match type priority)
    return results
      .sort((a, b) => {
        const aNormalized = normalizeString(a.match);
        const bNormalized = normalizeString(b.match);
        const queryNormalized = normalizedQuery;

        // Exact match priority
        const aExact = aNormalized === queryNormalized;
        const bExact = bNormalized === queryNormalized;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // Start match priority
        const aStarts = aNormalized.startsWith(queryNormalized);
        const bStarts = bNormalized.startsWith(queryNormalized);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        // Match type priority: IATA > ICAO > Name
        const typePriority = { iata: 0, icao: 1, name: 2 };
        const aPriority = typePriority[a.matchType];
        const bPriority = typePriority[b.matchType];
        if (aPriority !== bPriority) return aPriority - bPriority;

        // Alphabetical
        return aNormalized.localeCompare(bNormalized);
      })
      .slice(0, 10); // Limit to 10 results
  }, [debouncedQuery, normalizedAirports]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
        setSearchQuery("");
        setDebouncedQuery("");
        setFocusedIndex(-1);
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isExpanded]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSelect = useCallback(
    (icaoCode: string) => {
      setSelectedAirport(icaoCode);
      setIsExpanded(false);
      setSearchQuery("");
      setDebouncedQuery("");
      setFocusedIndex(-1);
    },
    [setSelectedAirport]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsExpanded(false);
      setSearchQuery("");
      setDebouncedQuery("");
      setFocusedIndex(-1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) =>
        prev < filteredAirports.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredAirports[focusedIndex].code);
    }
  };

  return (
    <div ref={containerRef} className="absolute top-4 right-4 z-10">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-900/60 backdrop-blur-md border border-gray-800/50 shadow-sm hover:bg-gray-800/60 transition-all duration-300 hover:scale-110"
          aria-label="Search airports"
        >
          <svg
            className="w-5 h-5 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      ) : (
        <div className="relative">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-900/60 backdrop-blur-md border border-gray-800/50 rounded-lg shadow-sm transition-all duration-300 min-w-[250px] sm:min-w-[350px]">
            <svg
              className="w-5 h-5 text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setFocusedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search airports..."
              className="bg-transparent border-none outline-none text-sm text-gray-200 placeholder-gray-500 flex-1 min-w-0"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setDebouncedQuery("");
                  setFocusedIndex(-1);
                }}
                className="flex-shrink-0 text-gray-400 hover:text-gray-200 transition-colors"
                aria-label="Clear search"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {filteredAirports.length > 0 && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-gray-900/95 backdrop-blur-md border border-gray-800/50 rounded-lg shadow-xl overflow-hidden z-50 max-h-[300px] overflow-y-auto">
              {filteredAirports.map((airport, index) => {
                const [iata, name, icao] = airport.data;
                const isFocused = index === focusedIndex;

                return (
                  <button
                    key={airport.code}
                    onClick={() => handleSelect(airport.code)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-800/80 transition-colors ${
                      isFocused ? "bg-gray-800/80" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          {iata && (
                            <span className="text-sm font-semibold text-blue-400">
                              {iata}
                            </span>
                          )}
                          {icao && (
                            <span className="text-xs text-gray-500">
                              {icao}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 mt-0.5">
                          {name}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
