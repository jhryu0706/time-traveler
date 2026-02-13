import { Clock, X } from 'lucide-react';
import { getCurrentTimeInTimezone } from '@/utils/timezone';
import BottomSheet from './BottomSheet';

interface TimezoneSelectorProps {
  timezones: string[];
  cityName: string;
  onSelect: (timezone: string) => void;
  onClose: () => void;
}

export default function TimezoneSelector({
  timezones,
  cityName,
  onSelect,
  onClose,
}: TimezoneSelectorProps) {
  return (
    <BottomSheet isOpen={true} onClose={onClose} fullScreen>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-foreground">Multiple Timezones</h3>
          <p className="text-sm text-muted-foreground truncate">{cityName}</p>
        </div>
        <button
          onClick={onClose}
          className="p-3 -mr-2 touch-active"
          aria-label="Close"
        >
          <X className="w-6 h-6 text-muted-foreground" />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <p className="text-base text-muted-foreground mb-4">
            Select the correct timezone for your location:
          </p>

          <div className="space-y-3">
            {timezones.map((tz) => (
              <button
                key={tz}
                onClick={() => onSelect(tz)}
                className="w-full px-4 py-4 text-left rounded-xl transition-colors border border-border bg-card touch-active active:bg-muted/70"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-foreground font-medium text-base truncate">{tz}</div>
                    <div className="text-sm text-muted-foreground">
                      {getCurrentTimeInTimezone(tz)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
