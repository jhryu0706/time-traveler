import React, { useState, useEffect } from 'react';
import { Globe, ArrowRightLeft, Clock } from 'lucide-react';
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
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto px-4 py-16 sm:py-24">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6">
              <Globe className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Timezone Converter
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Convert times between any two locations worldwide with precision
            </p>
          </div>

          {/* Main Card */}
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            {/* Location Inputs */}
            <div className="grid gap-6 mb-8">
              {/* Location X */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">X</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">From</span>
                  {locationX && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      Current: {getCurrentTimeInTimezone(locationX.timezone)}
                    </span>
                  )}
                </div>
                <LocationSelector
                  label="Source Location"
                  value={locationX}
                  onChange={setLocationX}
                />
                
                {/* Date Time Input - only show when location X is selected */}
                {locationX && (
                  <div className="mt-4 animate-fade-in">
                    <DateTimeInput
                      value={dateTime}
                      onChange={setDateTime}
                      isValid={isDateTimeValid || dateTime.length === 0}
                    />
                  </div>
                )}
              </div>

              {/* Swap Button */}
              <div className="flex justify-center -my-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={swapLocations}
                  disabled={!locationX && !locationY}
                  className="rounded-full h-10 w-10 border-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
                >
                  <ArrowRightLeft className="w-4 h-4 rotate-90" />
                </Button>
              </div>

              {/* Location Y */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-accent">Y</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">To</span>
                  {locationY && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      Current: {getCurrentTimeInTimezone(locationY.timezone)}
                    </span>
                  )}
                </div>
                <LocationSelector
                  label="Target Location"
                  value={locationY}
                  onChange={setLocationY}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border my-8" />

            {/* Result Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Converted Time</h2>
              </div>
              
              <ConversionResult
                result={result?.converted || null}
                dayDiff={result?.dayDiff || 0}
                fromLocation={locationX?.name || 'Source'}
                toLocation={locationY?.name || 'Target'}
              />
            </div>
          </div>

          {/* Footer info */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Handles DST transitions and International Date Line crossings</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
