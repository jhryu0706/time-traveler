import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, ChevronDown, X } from 'lucide-react';
import { cities, countries, City } from '@/data/cities';
import { getCurrentTimeInTimezone } from '@/utils/timezone';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import InteractiveMap from './InteractiveMap';
import TimezoneSelector from './TimezoneSelector';

interface LocationSelectorProps {
  label: string;
  value: { name: string; timezone: string; lat?: number; lng?: number } | null;
  onChange: (location: { name: string; timezone: string; lat?: number; lng?: number } | null) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function LocationSelector({ label, value, onChange, isOpen: externalOpen, onOpenChange }: LocationSelectorProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen ?? internalOpen;
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalOpen(open);
    }
  };
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showCountryFallback, setShowCountryFallback] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<typeof countries[0] | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showTimezoneSelector, setShowTimezoneSelector] = useState(false);
  const [multipleTimezones, setMultipleTimezones] = useState<string[]>([]);
  const [pendingCity, setPendingCity] = useState<City | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCities = cities
    .filter(city =>
      city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.country.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 50);

  const filteredCountries = countries
    .filter(country =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const showNoResults = searchQuery.length >= 2 && filteredCities.length === 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCountryFallback(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
      setSearchQuery('');
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

  const handleCountrySelect = (country: typeof countries[0]) => {
    setSelectedCountry(country);
    setShowCountryFallback(false);
    setShowMap(true);
    setIsOpen(false);
  };

  const handleMapSelect = (lat: number, lng: number, timezone: string) => {
    onChange({
      name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      timezone,
      lat,
      lng,
    });
    setShowMap(false);
    setSelectedCountry(null);
  };

  const handleOpenMapFromTimezone = () => {
    setShowTimezoneSelector(false);
    if (pendingCity) {
      setSelectedCountry({
        name: pendingCity.country,
        code: '',
        lat: pendingCity.lat,
        lng: pendingCity.lng,
        zoom: 8,
      });
    }
    setShowMap(true);
  };

  const clearSelection = () => {
    onChange(null);
    setSearchQuery('');
  };

  // If controlled externally, render as bottom sheet only
  if (onOpenChange !== undefined) {
    if (!isOpen) return null;
    
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
        
        {/* Bottom Sheet */}
        <div className="fixed inset-x-0 bottom-0 bg-popover border-t border-border rounded-t-2xl z-50 animate-slide-up max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-medium text-foreground">{label}</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 -mr-2 touch-active"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          
          {/* Search */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-3 px-4 py-3 bg-secondary/50 border border-border rounded-xl">
              <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cities..."
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base"
                autoFocus
              />
            </div>
          </div>
          
          {!showCountryFallback ? (
            <>
              <div className="overflow-y-auto flex-1 hide-scrollbar">
                {filteredCities.map((city, index) => (
                  <button
                    key={`${city.name}-${city.country}-${index}`}
                    onClick={() => handleCitySelect(city)}
                    className="w-full px-4 py-4 text-left transition-colors flex items-center justify-between touch-active active:bg-hover hover:bg-hover"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="text-foreground font-medium text-base">{city.name}</div>
                        <div className="text-sm text-muted-foreground">{city.country}</div>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {getCurrentTimeInTimezone(city.timezone)}
                    </span>
                  </button>
                ))}
              </div>
              
              {showNoResults && (
                <div className="p-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">City not found?</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCountryFallback(true);
                      setSearchQuery('');
                    }}
                    className="w-full h-12 text-base touch-active"
                  >
                    Select country instead
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="overflow-y-auto flex-1">
              <div className="px-4 py-3 border-b border-border sticky top-0 bg-popover">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search countries..."
                  className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-base outline-none focus:ring-2 focus:ring-primary/30"
                  autoFocus
                />
              </div>
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleCountrySelect(country)}
                  className="w-full px-4 py-4 text-left transition-colors flex items-center gap-3 touch-active active:bg-hover hover:bg-hover"
                >
                  <span className="text-foreground text-base">{country.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map Modal */}
        {showMap && selectedCountry && (
          <InteractiveMap
            country={selectedCountry}
            onSelect={handleMapSelect}
            onClose={() => {
              setShowMap(false);
              setSelectedCountry(null);
            }}
          />
        )}

        {/* Timezone Selector Modal */}
        {showTimezoneSelector && (
          <TimezoneSelector
            timezones={multipleTimezones}
            cityName={pendingCity?.name || ''}
            onSelect={handleTimezoneSelect}
            onSelectMap={handleOpenMapFromTimezone}
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
          isOpen && "ring-2 ring-primary/30 border-primary/30"
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
            <ChevronDown className={cn(
              "w-5 h-5 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          </>
        )}
      </button>

      {/* Dropdown - Full Screen on Mobile */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 top-auto md:absolute md:top-full md:bottom-auto md:left-0 md:right-0 md:mt-2 bg-popover border-t md:border border-border md:rounded-xl shadow-lg z-50 animate-slide-up">
          {/* Mobile Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border md:hidden">
            <span className="font-medium text-foreground">Select Location</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 -mr-2 touch-active"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {!showCountryFallback ? (
            <>
              <div className="overflow-y-auto max-h-[60vh] md:max-h-72 hide-scrollbar">
                {filteredCities.map((city, index) => (
                  <button
                    key={`${city.name}-${city.country}-${index}`}
                    onClick={() => handleCitySelect(city)}
                    className="w-full px-4 py-4 text-left transition-colors flex items-center justify-between touch-active active:bg-hover hover:bg-hover"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="text-foreground font-medium text-base">{city.name}</div>
                        <div className="text-sm text-muted-foreground">{city.country}</div>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {getCurrentTimeInTimezone(city.timezone)}
                    </span>
                  </button>
                ))}
              </div>
              
              {showNoResults && (
                <div className="p-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">City not found?</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCountryFallback(true);
                      setSearchQuery('');
                    }}
                    className="w-full h-12 text-base touch-active"
                  >
                    Select country instead
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="overflow-y-auto max-h-[60vh] md:max-h-72">
              <div className="px-4 py-3 border-b border-border sticky top-0 bg-popover">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search countries..."
                  className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-base outline-none focus:ring-2 focus:ring-primary/30"
                  autoFocus
                />
              </div>
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleCountrySelect(country)}
                  className="w-full px-4 py-4 text-left transition-colors flex items-center gap-3 touch-active active:bg-hover hover:bg-hover"
                >
                  <span className="text-foreground text-base">{country.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Map Modal */}
      {showMap && selectedCountry && (
        <InteractiveMap
          country={selectedCountry}
          onSelect={handleMapSelect}
          onClose={() => {
            setShowMap(false);
            setSelectedCountry(null);
          }}
        />
      )}

      {/* Timezone Selector Modal */}
      {showTimezoneSelector && (
        <TimezoneSelector
          timezones={multipleTimezones}
          cityName={pendingCity?.name || ''}
          onSelect={handleTimezoneSelect}
          onSelectMap={handleOpenMapFromTimezone}
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
