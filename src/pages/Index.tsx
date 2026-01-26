import React, { useState, useEffect } from 'react';
import { Plus, X, MapPin, Clock, Menu, Minus } from 'lucide-react';
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
    
    // Get browser timezone without geolocation
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const cityFromTimezone = 'Local';
    
    setSourceLocation({
      name: cityFromTimezone,
      timezone: userTimezone,
      lat: 0, // placeholder coords since we're not using geolocation
      lng: 0,
    });
    
    // Set to current local time
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    setDateTime(`${month}/${day}/${year} ${hours}:${String(minutes).padStart(2, '0')} ${period}`);
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

  // Check if we're in onboarding state (no source location selected yet)
  const missingDateorLoc = !dateTime || !sourceLocation;

  return (
    <div className="h-screen bg-background text-foreground flex flex-col dark">
      {/* TIME CONVERTER Logo - Always at top */}
      <div className="px-6 pt-14 pb-4">
        <h1 
          className="text-[13px] text-muted-foreground tracking-[0.2em] uppercase text-center"
          style={{ fontFamily: "'Inter Tight', sans-serif" }}
        >
          Time Converter
        </h1>
                    {/* Edit Location/Time Menu - top right */}
            {/* Onboarding - show when location permission denied */}
            {isDateTimeValid && (
              <div className="flex justify-end mb-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-muted-foreground flex items-center gap-1.5 text-[15px]">
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
      </div>

      {/* Header */}
      <div className="px-6 pb-6">
            {/* Secondary header */}
            <div className="flex justify-between items-center text-[13px] text-muted-foreground mb-2">
              <span>{formatDate(currentTime)}</span>
              <span className="text-muted-foreground">Source time</span>
            </div>

            {/* Main content - Time and Location */}
            {!missingDateorLoc ?
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
            
          :
          <div className="flex flex-col items-center justify-center py-16 px-8">
            <button 
              onClick={() => setLocationSelectorOpen(true)}
              className="bg-white/10 backdrop-blur-sm text-muted-foreground px-8 py-4 rounded-2xl text-[17px] font-medium btn-press border border-white/5"
              style={{ fontFamily: "'Inter Tight', sans-serif" }}
            >
              Add first location
            </button>
          </div>
          }
        </div>

      {/* Add/Remove Buttons */}
      <div className="px-6 py-3 bg-background flex justify-between items-center">
        <button 
          className="text-primary text-[17px] font-bold flex items-center gap-2"
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
          className="text-primary text-[17px] font-bold flex items-center gap-2"
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
        <div className="bg-background p-4 animate-slide-up">
          <LocationSelector
            label="Add Location"
            value={null}
            onChange={(loc) => loc && addTargetLocation(loc)}
          />
        </div>
      )}

      {/* Cities List */}
      <div className="flex-1 overflow-y-auto bg-background pt-3 pb-6">

        {targetLocations.length === 0 && !showAddCity && (
          <div className="px-6 py-8 text-center text-muted-foreground">
            <p className="text-[15px]">No cities added yet</p>
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
              className="mx-4 mb-3 city-card p-4 animate-fade-in"
              style={{
                background: `linear-gradient(135deg, hsl(0 0% 8%) 0%, hsl(0 0% 8%) 100%)`
              }}
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
