import React, { useState, useEffect } from 'react';
import { Plus, X, MapPin, Clock, Pointer, Menu, Minus } from 'lucide-react';
import LocationSelector from '@/components/LocationSelector';
import DateTimeInput from '@/components/DateTimeInput';
import { convertDateTime, isValidDateTime, formatDayOfWeek } from '@/utils/timezone';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Location {
  name: string;
  timezone: string;
  lat?: number;
  lng?: number;
}

const Index = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sourceLocation, setSourceLocation] = useState<Location | null>(null);
  const [dateTime, setDateTime] = useState('');
  const [targetLocations, setTargetLocations] = useState<Location[]>([]);
  const [showAddCity, setShowAddCity] = useState(false);
  const [locationSelectorOpen, setLocationSelectorOpen] = useState(false);
  const [timeSelectorOpen, setTimeSelectorOpen] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);
  const [showTimeChoiceDialog, setShowTimeChoiceDialog] = useState(false);
  const [removeMode, setRemoveMode] = useState(false);

  const isDateTimeValid = isValidDateTime(dateTime);

  // Request user location on mount
  useEffect(() => {
    if (hasRequestedLocation) return;
    setHasRequestedLocation(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Get timezone from coordinates
          const { latitude, longitude } = position.coords;
          // Use a simple lookup - in production you'd use a proper API
          const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          setSourceLocation({
            name: 'Current Location',
            timezone: userTimezone,
            lat: latitude,
            lng: longitude,
          });
          // Show time choice dialog after location is set
          setShowTimeChoiceDialog(true);
        },
        (error) => {
          console.log('Geolocation denied or unavailable:', error.message);
          setLocationPermissionDenied(true);
        },
        { timeout: 10000 }
      );
    } else {
      setLocationPermissionDenied(true);
    }
  }, [hasRequestedLocation]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addTargetLocation = (location: Location) => {
    if (!targetLocations.find(l => l.name === location.name)) {
      setTargetLocations([...targetLocations, location]);
    }
    setShowAddCity(false);
  };

  const removeTargetLocation = (index: number) => {
    setTargetLocations(targetLocations.filter((_, i) => i !== index));
  };

  const getConvertedTime = (targetTimezone: string) => {
    if (!sourceLocation || !isDateTimeValid) return null;
    return convertDateTime(dateTime, sourceLocation.timezone, targetTimezone);
  };

  const formatTime12Hour = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      ampm
    };
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  const getTimeDifference = (targetTimezone: string) => {
    if (!sourceLocation || !isDateTimeValid) return '';
    const result = getConvertedTime(targetTimezone);
    if (!result) return '';
    
    const dayDiff = result.dayDiff;
    if (dayDiff === 0) return 'Same day';
    if (dayDiff > 0) return `+${dayDiff} day${dayDiff > 1 ? 's' : ''}`;
    return `${dayDiff} day${dayDiff < -1 ? 's' : ''}`;
  };

  const handleSetLocalTime = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    setDateTime(`${month}/${day}/${year} ${hours}:${String(minutes).padStart(2, '0')} ${period}`);
    setShowTimeChoiceDialog(false);
  };

  const handleSelectTime = () => {
    setShowTimeChoiceDialog(false);
    setTimeSelectorOpen(true);
  };

  const time12 = formatTime12Hour(currentTime);

  return (
    <div className="h-screen bg-background text-foreground flex flex-col dark">
      {/* Header - Conditional based on location availability */}
      <div className="px-6 pt-14 pb-6 border-b border-border">
        {locationPermissionDenied && !sourceLocation ? (
          /* No location - show prompt to select */
          <button 
            onClick={() => setLocationSelectorOpen(true)}
            className="w-full text-left"
          >
            <div className="flex items-center gap-2">
              <Pointer className="w-4 h-4 text-muted-foreground" />
              <span className="text-[15px] text-foreground font-medium">Tap to select your first location</span>
            </div>
          </button>
        ) : (
          /* Has location - show normal header */
          <>
            {/* Edit Location/Time Menu - top right */}
            {sourceLocation && isDateTimeValid && (
              <div className="flex justify-end mb-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-primary flex items-center gap-1.5 text-[15px]">
                      <Menu className="w-5 h-5" />
                      <span>Edit Location/Time</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-border">
                    <DropdownMenuItem 
                      onClick={() => setLocationSelectorOpen(true)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Edit location</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setTimeSelectorOpen(true)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Edit time</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Secondary header */}
            <div className="flex justify-between items-center text-[13px] text-muted-foreground mb-2">
              <span>{formatDate(currentTime)}</span>
              <span className="text-foreground">Source time and location</span>
            </div>

            {/* Main content - Time and Location */}
            <div className="flex justify-between items-baseline mb-4">
              <span className="text-[32px] text-primary">
                {sourceLocation ? sourceLocation.name.split(',')[0] : 'Local'}
              </span>
              <div className="flex items-baseline gap-2">
                {isDateTimeValid ? (
                  <>
                    <span className="text-[32px] leading-none font-light tabular-nums text-primary">
                      {formatDayOfWeek(dateTime).split(' at ')[1]?.split(' ')[0] || time12.hours + ':' + time12.minutes}
                    </span>
                    <span className="text-[13px] text-muted-foreground">
                      {formatDayOfWeek(dateTime).split(' at ')[1]?.split(' ')[1] || time12.ampm}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[32px] leading-none font-light tabular-nums text-primary">
                      {time12.hours}:{time12.minutes}
                    </span>
                    <span className="text-[13px] text-muted-foreground">
                      {time12.ampm}
                    </span>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Time Choice Dialog - forces user to select */}
      <Dialog open={showTimeChoiceDialog} onOpenChange={setShowTimeChoiceDialog}>
        <DialogContent className="bg-card border-border max-w-[300px]">
          <DialogHeader>
            <DialogTitle className="text-center text-foreground">Select Time</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <button 
              onClick={handleSetLocalTime}
              className="w-full px-4 py-3 bg-background rounded-lg text-[15px] text-foreground border border-border flex items-center justify-center gap-2 hover:bg-hover transition-colors"
            >
              <Clock className="w-4 h-4" />
              <span>Set to local time</span>
            </button>
            <button 
              onClick={handleSelectTime}
              className="w-full px-4 py-3 bg-background rounded-lg text-[15px] text-foreground border border-border flex items-center justify-center gap-2 hover:bg-hover transition-colors"
            >
              <Clock className="w-4 h-4" />
              <span>Select time</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Location Selector Sheet */}
      <LocationSelector
        label="Source Location"
        value={sourceLocation}
        onChange={(loc) => {
          setSourceLocation(loc);
          if (loc) {
            setLocationSelectorOpen(false);
            // Show time choice dialog after manual location selection
            if (!isDateTimeValid) {
              setShowTimeChoiceDialog(true);
            }
          }
        }}
        isOpen={locationSelectorOpen}
        onOpenChange={setLocationSelectorOpen}
      />

      {/* Time Selector Sheet */}
      <DateTimeInput
        value={dateTime}
        onChange={setDateTime}
        isValid={isDateTimeValid || dateTime.length === 0}
        isOpen={timeSelectorOpen}
        onOpenChange={setTimeSelectorOpen}
      />

      {/* Add/Remove Buttons */}
      <div className="px-6 py-3 bg-[hsl(0,0%,6%)] flex justify-between">
        <button 
          className="text-primary text-[17px] flex items-center gap-2"
          onClick={() => {
            setRemoveMode(!removeMode);
            if (showAddCity) setShowAddCity(false);
          }}
        >
          {removeMode ? (
            <>
              <X className="w-5 h-5" />
              <span>Done</span>
            </>
          ) : (
            <>
              <Minus className="w-5 h-5" />
              <span>Remove</span>
            </>
          )}
        </button>
        <button 
          className="text-primary text-[17px] flex items-center gap-2"
          onClick={() => {
            setShowAddCity(!showAddCity);
            if (removeMode) setRemoveMode(false);
          }}
        >
          {showAddCity ? (
            <>
              <X className="w-5 h-5" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>Add City</span>
            </>
          )}
        </button>
      </div>

      {/* Add City Panel */}
      {showAddCity && (
        <div className="bg-[hsl(0,0%,6%)] p-4 animate-slide-up">
          <LocationSelector
            label="Add Location"
            value={null}
            onChange={(loc) => loc && addTargetLocation(loc)}
          />
        </div>
      )}

      {/* Cities List */}
      <div className="flex-1 overflow-y-auto bg-[hsl(0,0%,6%)]">
        {targetLocations.length === 0 && !showAddCity && (
          <div className="px-6 py-8 text-center text-muted-foreground">
            <p className="text-[15px]">No cities added yet</p>
            <p className="text-[13px] mt-1">Tap "Add City" to compare times</p>
          </div>
        )}

        {targetLocations.map((location, index) => {
          const result = getConvertedTime(location.timezone);
          const timeDiff = getTimeDifference(location.timezone);

          // Parse converted time for display
          let displayTime = { hours: '--', minutes: '--', ampm: '' };
          let displayDate = '';
          
          if (result) {
            const converted = result.converted;
            // Format: "MM/DD/YYYY (Day) at HH:MM AM/PM"
            const atIndex = converted.indexOf(' at ');
            if (atIndex !== -1) {
              displayDate = converted.substring(0, atIndex);
              const timePart = converted.substring(atIndex + 4);
              const [time, ampm] = timePart.split(' ');
              const [hours, minutes] = time.split(':');
              displayTime = { hours, minutes, ampm };
            }
          }

          return (
            <div 
              key={location.name}
              className={`px-6 py-5 ${
                index !== targetLocations.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              {/* Secondary header */}
              <div className="flex justify-between items-center text-[13px] text-muted-foreground mb-2">
                <span>{displayDate}</span>
                <span>{timeDiff}</span>
              </div>
              
              {/* Main content - Time and City */}
              <div className="flex justify-between items-baseline">
                <div className="flex items-center gap-3">
                  {removeMode && (
                    <button
                      onClick={() => removeTargetLocation(index)}
                      className="text-destructive animate-fade-in"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                  <span className="text-[32px] text-foreground">{location.name.split(',')[0]}</span>
                </div>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-[32px] leading-none font-light tabular-nums text-foreground">
                    {displayTime.hours}:{displayTime.minutes}
                  </span>
                  <span className="text-[13px] text-muted-foreground">
                    {displayTime.ampm}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Index;
