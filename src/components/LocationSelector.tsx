import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, ChevronDown, X } from 'lucide-react';
import { cities, countries, City } from '@/data/cities';
import { getCurrentTimeInTimezone } from '@/utils/timezone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import InteractiveMap from './InteractiveMap';
import TimezoneSelector from './TimezoneSelector';

interface LocationSelectorProps {
  label: string;
  value: { name: string; timezone: string; lat?: number; lng?: number } | null;
  onChange: (location: { name: string; timezone: string; lat?: number; lng?: number } | null) => void;
}

export default function LocationSelector({ label, value, onChange }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCountryFallback, setShowCountryFallback] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<typeof countries[0] | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showTimezoneSelector, setShowTimezoneSelector] = useState(false);
  const [multipleTimezones, setMultipleTimezones] = useState<string[]>([]);
  const [pendingCity, setPendingCity] = useState<City | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.country.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 50);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-muted-foreground mb-2">
        {label}
      </label>

      <div
        className={cn(
          "relative flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-lg cursor-pointer transition-all duration-200 input-highlight",
          isOpen && "ring-2 ring-primary/20"
        )}
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        
        {value && !isOpen ? (
          <div className="flex-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-foreground font-medium">{value.name}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
              className="p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
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
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              onClick={(e) => e.stopPropagation()}
            />
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          </>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-card-lg z-50 max-h-80 overflow-hidden animate-fade-in">
          {!showCountryFallback ? (
            <>
              <div className="overflow-y-auto max-h-64">
                {filteredCities.map((city, index) => (
                  <button
                    key={`${city.name}-${city.country}-${index}`}
                    onClick={() => handleCitySelect(city)}
                    className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <div>
                        <div className="text-foreground font-medium">{city.name}</div>
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
                    size="sm"
                    onClick={() => {
                      setShowCountryFallback(true);
                      setSearchQuery('');
                    }}
                    className="w-full"
                  >
                    Select country instead
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="overflow-y-auto max-h-64">
              <div className="px-4 py-2 border-b border-border">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search countries..."
                  className="h-9"
                  autoFocus
                />
              </div>
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleCountrySelect(country)}
                  className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3"
                >
                  <span className="text-foreground">{country.name}</span>
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
