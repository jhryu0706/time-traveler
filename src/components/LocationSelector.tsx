import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, ChevronDown, X, Check } from "lucide-react";
import { cities, City } from "@/data/cities";
import { getCurrentTimeInTimezone } from "@/utils/timezone";
import { cn } from "@/lib/utils";
import TimezoneSelector from "./TimezoneSelector";

type Location = { name: string; timezone: string; lat?: number; lng?: number };

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
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isCitySelected = (city: City) => {
    const cityName = `${city.name}, ${city.country}`;
    return selectedLocations.some((loc) => loc.name === cityName);
  };

  const isCityAlreadyAdded = (city: City) => {
    const cityName = `${city.name}, ${city.country}`;
    return existingLocations.some((loc) => loc.name === cityName);
  };

  const handleCitySelect = (city: City) => {
    if (multiSelect) {
      const cityName = `${city.name}, ${city.country}`;
      const location: Location = {
        name: cityName,
        timezone: city.timezone,
        lat: city.lat,
        lng: city.lng,
      };

      if (isCitySelected(city)) {
        // Deselect
        setSelectedLocations((prev) => prev.filter((loc) => loc.name !== cityName));
      } else {
        // Select
        setSelectedLocations((prev) => [...prev, location]);
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

  const clearSelection = () => {
    onChange(null);
    setSearchQuery("");
  };

  // If controlled externally, render as bottom sheet only
  if (onOpenChange !== undefined) {
    if (!isOpen) return null;

    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 z-40 animate-fade-in" onClick={() => setIsOpen(false)} />

        {/* Bottom Sheet - Fixed 60% height */}
        <div className="fixed inset-x-0 bottom-0 popup-container border-t rounded-t-2xl z-50 animate-slide-up h-[60vh] flex flex-col">
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
                    isSelected && "bg-secondary shadow-inner",
                    isAlreadyAdded && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {multiSelect && (
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                      </div>
                    )}
                    <div>
                      <div className="text-foreground font-medium text-base">{city.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {city.country}
                        {isAlreadyAdded && " (already added)"}
                      </div>
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
      </>
    );
  }

  // Original inline mode
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Clickable Trigger */}
      <button
        type="button"
        className={cn(
          "w-full relative flex items-center gap-3 px-4 py-3.5 min-h-[52px] bg-secondary/50 border border-border rounded-xl cursor-pointer transition-all duration-200 touch-active text-left",
          isOpen && "ring-2 ring-primary/30 border-primary/30",
        )}
        onClick={() => {
          setIsOpen(true);
          setSearchQuery("");
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
      >
        <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />

        {value ? (
          <div className="flex-1 flex items-center justify-between gap-2">
            <span className="text-foreground font-medium text-base truncate">{value.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
              className="p-2 -mr-1 rounded-full touch-active"
              aria-label="Clear selection"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <>
            <span className="flex-1 text-muted-foreground text-base">Search cities...</span>
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </>
        )}
      </button>

      {/* Dropdown with Search Inside */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 top-auto md:absolute md:top-full md:bottom-auto md:left-0 md:right-0 md:mt-2 popup-container border-t md:border md:rounded-xl shadow-lg z-50 animate-slide-up h-[60vh] md:h-auto flex flex-col">
          {/* Search Header */}
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
            <button onClick={() => setIsOpen(false)} className="p-2 touch-active">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 md:max-h-72 hide-scrollbar">
            {filteredCities.map((city, index) => (
              <button
                key={`${city.name}-${city.country}-${index}`}
                onClick={() => handleCitySelect(city)}
                className="w-full px-4 py-4 text-left flex items-center justify-between touch-active popup-item"
              >
                <div>
                  <div className="text-foreground font-medium text-base">{city.name}</div>
                  <div className="text-sm text-muted-foreground">{city.country}</div>
                </div>
                <span className="text-sm text-muted-foreground">{getCurrentTimeInTimezone(city.timezone)}</span>
              </button>
            ))}
            {filteredCities.length === 0 && searchQuery.length > 0 && (
              <div className="p-4 text-center text-muted-foreground">No cities found</div>
            )}
          </div>
        </div>
      )}

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
    </div>
  );
}
