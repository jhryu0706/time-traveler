import React, { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { cities, City } from "@/data/cities";
import { getCurrentTimeInTimezone } from "@/utils/timezone";
import { cn } from "@/lib/utils";
import TimezoneSelector from "./TimezoneSelector";
import BottomSheet from "./BottomSheet";
import type { Location } from "@/types";

interface LocationSelectorProps {
  label: string;
  value: Location | null;
  onChange: (location: Location | null) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  multiSelect?: boolean;
  onMultiSelect?: (locations: Location[]) => void;
  existingLocations?: Location[];
}

export default function LocationSelector({
  label,
  value,
  onChange,
  isOpen: externalOpen,
  onOpenChange,
  multiSelect = false,
  onMultiSelect,
  existingLocations = [],
}: LocationSelectorProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen ?? internalOpen;
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalOpen(open);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [showTimezoneSelector, setShowTimezoneSelector] = useState(false);
  const [multipleTimezones, setMultipleTimezones] = useState<string[]>([]);
  const [pendingCity, setPendingCity] = useState<City | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset selected locations when sheet opens
  useEffect(() => {
    if (isOpen && multiSelect) {
      setSelectedLocations([]);
    }
  }, [isOpen, multiSelect]);

  const filteredCities = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return cities.sort((a, b) => a.name.localeCompare(b.name)).slice(0, 50);
    }
    return cities
      .filter(
        (city) =>
          city.name.toLowerCase().includes(query) ||
          city.country.toLowerCase().includes(query),
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 50);
  }, [searchQuery]);

  const isCitySelected = (city: City) => {
    const cityName = `${city.name}, ${city.country}`;
    return selectedLocations.some((loc) => loc.name === cityName);
  };

  const isCityAlreadyAdded = (city: City) => {
    const cityName = `${city.name}, ${city.country}`;
    return existingLocations.some((loc) => loc.name === cityName);
  };

  const handleCitySelect = (city: City) => {
    if (multiSelect && onMultiSelect) {
      const cityName = `${city.name}, ${city.country}`;
      const location: Location = {
        name: cityName,
        timezone: city.timezone,
        lat: city.lat,
        lng: city.lng,
      };

      if (isCitySelected(city)) {
        // Deselect - remove from local state and notify parent
        setSelectedLocations((prev) => {
          const newSelected = prev.filter((loc) => loc.name !== cityName);
          return newSelected;
        });
        // Notify parent to remove this location
        onMultiSelect([location]); // Parent will handle toggle logic
      } else {
        // Select - add to local state and immediately notify parent
        setSelectedLocations((prev) => [...prev, location]);
        onMultiSelect([location]); // Immediately add to main list
      }
    } else {
      if (city.alternateTimezones && city.alternateTimezones.length > 0) {
        setMultipleTimezones([city.timezone, ...city.alternateTimezones]);
        setPendingCity(city);
        setShowTimezoneSelector(true);
        setIsOpen(false);
      } else {
        onChange({
          name: `${city.name}, ${city.country}`,
          timezone: city.timezone,
          lat: city.lat,
          lng: city.lng,
        });
        setIsOpen(false);
        setSearchQuery("");
      }
    }
  };

  const handleDone = () => {
    if (multiSelect && onMultiSelect) {
      onMultiSelect(selectedLocations);
    }
    setIsOpen(false);
    setSearchQuery("");
    setSelectedLocations([]);
  };

  const handleTimezoneSelect = (timezone: string) => {
    if (pendingCity) {
      onChange({
        name: `${pendingCity.name}, ${pendingCity.country}`,
        timezone,
        lat: pendingCity.lat,
        lng: pendingCity.lng,
      });
    }
    setShowTimezoneSelector(false);
    setPendingCity(null);
    setMultipleTimezones([]);
  };

  // If controlled externally, render as bottom sheet only
  if (onOpenChange !== undefined) {
    return (
      <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} height="60vh">
          {/* Search Header with Done button for multi-select */}
          <div className="px-4 py-3 border-b border-border flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-secondary/50 border border-border rounded-xl">
              <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cities or countries..."
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base"
                autoFocus
              />
            </div>
            {multiSelect ? (
              <button
                onClick={handleDone}
                className="px-4 py-2 text-primary font-bold text-[17px] touch-active"
              >
                Done
              </button>
            ) : (
              <button onClick={() => setIsOpen(false)} className="p-2 touch-active">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1 hide-scrollbar">
            {filteredCities.map((city, index) => {
              const isSelected = isCitySelected(city);
              const isAlreadyAdded = isCityAlreadyAdded(city);

              return (
                <button
                  key={`${city.name}-${city.country}-${index}`}
                  onClick={() => !isAlreadyAdded && handleCitySelect(city)}
                  disabled={isAlreadyAdded}
                  className={cn(
                    "w-full px-4 py-4 text-left flex items-center justify-between touch-active popup-item transition-all duration-200",
                    isSelected && "bg-secondary/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]",
                    isAlreadyAdded && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <div>
                    <div className="text-foreground font-medium text-base">{city.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {city.country}
                      {isAlreadyAdded && " (already added)"}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{getCurrentTimeInTimezone(city.timezone)}</span>
                </button>
              );
            })}
            {filteredCities.length === 0 && searchQuery.length > 0 && (
              <div className="p-4 text-center text-muted-foreground">No cities found</div>
            )}
          </div>

        {/* Timezone Selector Modal */}
        {showTimezoneSelector && (
          <TimezoneSelector
            timezones={multipleTimezones}
            cityName={pendingCity?.name || ""}
            onSelect={handleTimezoneSelect}
            onClose={() => {
              setShowTimezoneSelector(false);
              setPendingCity(null);
              setMultipleTimezones([]);
            }}
          />
        )}
      </BottomSheet>
    );
  }

  return null;
}
