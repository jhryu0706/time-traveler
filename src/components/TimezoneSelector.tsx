import React from 'react';
import { Clock, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentTimeInTimezone } from '@/utils/timezone';

interface TimezoneSelectorProps {
  timezones: string[];
  cityName: string;
  onSelect: (timezone: string) => void;
  onSelectMap: () => void;
  onClose: () => void;
}

export default function TimezoneSelector({
  timezones,
  cityName,
  onSelect,
  onSelectMap,
  onClose,
}: TimezoneSelectorProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border border-border rounded-xl shadow-card-lg w-full max-w-md overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Multiple Timezones Found</h3>
            <p className="text-sm text-muted-foreground">{cityName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Timezone Options */}
        <div className="p-4 space-y-2">
          <p className="text-sm text-muted-foreground mb-4">
            Select the correct timezone for your location:
          </p>
          
          {timezones.map((tz) => (
            <button
              key={tz}
              onClick={() => onSelect(tz)}
              className="w-full px-4 py-3 text-left hover:bg-muted/50 rounded-lg transition-colors border border-border hover:border-primary/30 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div>
                    <div className="text-foreground font-medium">{tz}</div>
                    <div className="text-sm text-muted-foreground">
                      {getCurrentTimeInTimezone(tz)}
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Map Option */}
        <div className="px-6 py-4 border-t border-border bg-muted/30">
          <Button
            variant="outline"
            onClick={onSelectMap}
            className="w-full gap-2"
          >
            <MapPin className="w-4 h-4" />
            Select location on map
          </Button>
        </div>
      </div>
    </div>
  );
}
