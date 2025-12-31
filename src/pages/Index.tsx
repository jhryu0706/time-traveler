import React, { useState } from 'react';
import { Globe, Plus, X, Clock } from 'lucide-react';
import LocationSelector from '@/components/LocationSelector';
import DateTimeInput from '@/components/DateTimeInput';
import { convertDateTime, isValidDateTime, formatDayOfWeek } from '@/utils/timezone';
import { Button } from '@/components/ui/button';

interface Location {
  name: string;
  timezone: string;
  lat?: number;
  lng?: number;
}

const Index = () => {
  const [sourceLocation, setSourceLocation] = useState<Location | null>(null);
  const [dateTime, setDateTime] = useState('');
  const [targetLocations, setTargetLocations] = useState<Location[]>([]);

  const isDateTimeValid = isValidDateTime(dateTime);
  const showResults = sourceLocation && isDateTimeValid && targetLocations.length > 0;

  const addTargetLocation = (location: Location) => {
    if (!targetLocations.find(l => l.name === location.name)) {
      setTargetLocations([...targetLocations, location]);
    }
  };

  const removeTargetLocation = (index: number) => {
    setTargetLocations(targetLocations.filter((_, i) => i !== index));
  };

  const getConvertedTime = (targetTimezone: string) => {
    if (!sourceLocation || !isDateTimeValid) return null;
    return convertDateTime(dateTime, sourceLocation.timezone, targetTimezone);
  };

  const formattedSourceTime = isDateTimeValid ? formatDayOfWeek(dateTime) : '';

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-lg mx-auto px-4 py-6 pb-8 safe-bottom">
        {/* Header */}
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

        {/* Steps */}
        <div className="space-y-4">
          {/* Step 1: Select Location */}
          <section className="mobile-card">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">1</span>
              </div>
              <span className="text-base font-medium text-foreground">Select Location</span>
            </div>
            <LocationSelector
              label="Source Location"
              value={sourceLocation}
              onChange={setSourceLocation}
            />
          </section>

          {/* Step 2: Select Time */}
          <section className="mobile-card">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${sourceLocation ? 'bg-primary' : 'bg-muted'}`}>
                <span className={`text-xs font-bold ${sourceLocation ? 'text-primary-foreground' : 'text-muted-foreground'}`}>2</span>
              </div>
              <span className={`text-base font-medium ${sourceLocation ? 'text-foreground' : 'text-muted-foreground'}`}>Select Time</span>
            </div>
            {sourceLocation ? (
              <DateTimeInput
                value={dateTime}
                onChange={setDateTime}
                isValid={isDateTimeValid || dateTime.length === 0}
              />
            ) : (
              <p className="text-sm text-muted-foreground py-2">Select a location first</p>
            )}
          </section>

          {/* Step 3: Add Target Locations */}
          <section className="mobile-card">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isDateTimeValid ? 'bg-primary' : 'bg-muted'}`}>
                <span className={`text-xs font-bold ${isDateTimeValid ? 'text-primary-foreground' : 'text-muted-foreground'}`}>3</span>
              </div>
              <span className={`text-base font-medium ${isDateTimeValid ? 'text-foreground' : 'text-muted-foreground'}`}>Add Locations to Compare</span>
            </div>
            {isDateTimeValid && sourceLocation ? (
              <div className="space-y-3">
                <LocationSelector
                  label="Add Location"
                  value={null}
                  onChange={(loc) => loc && addTargetLocation(loc)}
                />
                {targetLocations.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {targetLocations.map((loc, index) => (
                      <div
                        key={loc.name}
                        className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg text-sm"
                      >
                        <span className="text-foreground">{loc.name.split(',')[0]}</span>
                        <button
                          onClick={() => removeTargetLocation(index)}
                          className="p-1 rounded-full touch-active"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-2">Complete steps 1 and 2 first</p>
            )}
          </section>

          {/* Results */}
          {showResults && (
            <section className="mobile-card bg-gradient-to-br from-primary/5 to-accent/5 animate-slide-up">
              <div className="space-y-4">
                {/* Header sentence */}
                <p className="text-base text-foreground leading-relaxed">
                  At <span className="font-semibold text-primary">{sourceLocation.name}</span> on{' '}
                  <span className="font-semibold">{formattedSourceTime}</span>, it's:
                </p>

                {/* Results list */}
                <div className="space-y-3">
                  {targetLocations.map((loc, index) => {
                    const result = getConvertedTime(loc.timezone);
                    if (!result) return null;

                    return (
                      <div
                        key={loc.name}
                        className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                          <div>
                            <p className="font-mono text-lg font-semibold text-foreground">
                              {result.converted}
                            </p>
                            {result.dayDiff !== 0 && (
                              <p className="text-sm text-muted-foreground">
                                {result.dayDiff > 0
                                  ? `${result.dayDiff} day${result.dayDiff > 1 ? 's' : ''} later`
                                  : `${Math.abs(result.dayDiff)} day${Math.abs(result.dayDiff) > 1 ? 's' : ''} earlier`}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground text-right">{loc.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
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
