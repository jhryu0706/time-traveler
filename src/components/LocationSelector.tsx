import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, ChevronDown, X } from "lucide-react";
import { cities, City } from "@/data/cities";
import { getCurrentTimeInTimezone } from "@/utils/timezone";
import { cn } from "@/lib/utils";
import TimezoneSelector from "./TimezoneSelector";

interface LocationSelectorProps {
  label: string;
  value: { name: string; timezone: string; lat?: number; lng?: number } | null;
  onChange: (location: { name: string; timezone: string; lat?: number; lng?: number } | null) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function LocationSelector({
  label,
  value,
  onChange,
  isOpen: externalOpen,
  onOpenChange,
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleCitySelect = (city: City) => {
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
          {/* Search Header with X button */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-3 px-4 py-3 bg-secondary/50 border border-border rounded-xl">
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
              <button onClick={() => setIsOpen(false)} className="p-1 touch-active">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 hide-scrollbar">
            {filteredCities.map((city, index) => (
              <button
                key={`${city.name}-${city.country}-${index}`}
                onClick={() => handleCitySelect(city)}
                className="w-full px-4 py-4 text-left flex items-center justify-between touch-active popup-item"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="text-foreground font-medium text-base">{city.name}</div>
                    <div className="text-sm text-muted-foreground">{city.country}</div>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{getCurrentTimeInTimezone(city.timezone)}</span>
              </button>
            ))}
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
      {/* Clickable Input Area */}
      <button
        type="button"
        className={cn(
          "w-full relative flex items-center gap-3 px-4 py-3.5 min-h-[52px] bg-secondary/50 border border-border rounded-xl cursor-pointer transition-all duration-200 touch-active text-left",
          isOpen && "ring-2 ring-primary/30 border-primary/30",
        )}
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />

        {value && !isOpen ? (
          <div className="flex-1 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-foreground font-medium text-base truncate">{value.name}</span>
            </div>
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
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cities..."
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base"
              onClick={(e) => e.stopPropagation()}
            />
            <ChevronDown
              className={cn("w-5 h-5 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")}
            />
          </>
        )}
      </button>

      {/* Dropdown - Full Screen on Mobile */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 top-auto md:absolute md:top-full md:bottom-auto md:left-0 md:right-0 md:mt-2 popup-container border-t md:border md:rounded-xl shadow-lg z-50 animate-slide-up">
          {/* Mobile Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border md:hidden">
            <span className="font-medium text-foreground">Select Location</span>
            <button onClick={() => setIsOpen(false)} className="p-2 -mr-2 touch-active">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[60vh] md:max-h-72 hide-scrollbar">
            {filteredCities.map((city, index) => (
              <button
                key={`${city.name}-${city.country}-${index}`}
                onClick={() => handleCitySelect(city)}
                className="w-full px-4 py-4 text-left flex items-center justify-between touch-active popup-item"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="text-foreground font-medium text-base">{city.name}</div>
                    <div className="text-sm text-muted-foreground">{city.country}</div>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{getCurrentTimeInTimezone(city.timezone)}</span>
              </button>
            ))}
            {filteredCities.length === 0 && searchQuery.length >= 2 && (
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
