import React, { useState, useEffect } from 'react';
import { Globe, ArrowDownUp, Clock } from 'lucide-react';
import LocationSelector from '@/components/LocationSelector';
import DateTimeInput from '@/components/DateTimeInput';
import ConversionResult from '@/components/ConversionResult';
import { convertDateTime, isValidDateTime, getCurrentTimeInTimezone } from '@/utils/timezone';
import { Button } from '@/components/ui/button';

interface Location {
  name: string;
  timezone: string;
  lat?: number;
  lng?: number;
}

const Index = () => {
  const [locationX, setLocationX] = useState<Location | null>(null);
  const [locationY, setLocationY] = useState<Location | null>(null);
  const [dateTime, setDateTime] = useState('');
  const [result, setResult] = useState<{ converted: string; dayDiff: number } | null>(null);

  const isDateTimeValid = isValidDateTime(dateTime);

  useEffect(() => {
    if (locationX && locationY && isDateTimeValid) {
      const conversion = convertDateTime(dateTime, locationX.timezone, locationY.timezone);
      setResult(conversion);
    } else {
      setResult(null);
    }
  }, [locationX, locationY, dateTime, isDateTimeValid]);

  const swapLocations = () => {
    const temp = locationX;
    setLocationX(locationY);
    setLocationY(temp);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-optimized container */}
      <div className="w-full max-w-lg mx-auto px-4 py-6 pb-8 safe-bottom">
        {/* Compact Header */}
        <header className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Globe className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Timezone Converter
            </h1>
            <p className="text-sm text-muted-foreground">
              Convert times worldwide
            </p>
          </div>
        </header>

        {/* Main Content - Single Column Stack */}
        <div className="space-y-4">
          {/* Location X Card */}
          <section className="mobile-card">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">X</span>
              </div>
              <span className="text-base font-medium text-foreground">From</span>
              {locationX && (
                <span className="text-sm text-muted-foreground ml-auto">
                  {getCurrentTimeInTimezone(locationX.timezone)}
                </span>
              )}
            </div>
            <LocationSelector
              label="Source Location"
              value={locationX}
              onChange={setLocationX}
            />
            
            {/* Date Time Input */}
            {locationX && (
              <div className="mt-4 pt-4 border-t border-border animate-fade-in">
                <DateTimeInput
                  value={dateTime}
                  onChange={setDateTime}
                  isValid={isDateTimeValid || dateTime.length === 0}
                />
              </div>
            )}
          </section>

          {/* Swap Button - Full Width Touch Target */}
          <div className="flex justify-center py-1">
            <Button
              variant="outline"
              onClick={swapLocations}
              disabled={!locationX && !locationY}
              className="w-full h-12 rounded-xl border-2 gap-2 text-base font-medium touch-active"
            >
              <ArrowDownUp className="w-5 h-5" />
              Swap Locations
            </Button>
          </div>

          {/* Location Y Card */}
          <section className="mobile-card">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
                <span className="text-xs font-bold text-accent">Y</span>
              </div>
              <span className="text-base font-medium text-foreground">To</span>
              {locationY && (
                <span className="text-sm text-muted-foreground ml-auto">
                  {getCurrentTimeInTimezone(locationY.timezone)}
                </span>
              )}
            </div>
            <LocationSelector
              label="Target Location"
              value={locationY}
              onChange={setLocationY}
            />
          </section>

          {/* Result Section */}
          <section className="mobile-card">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Converted Time</h2>
            </div>
            
            <ConversionResult
              result={result?.converted || null}
              dayDiff={result?.dayDiff || 0}
              fromLocation={locationX?.name || 'Source'}
              toLocation={locationY?.name || 'Target'}
            />
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-6 text-center text-sm text-muted-foreground">
          <p>Handles DST & International Date Line</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
