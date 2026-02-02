import React, { useState, useEffect } from "react";
import { Plus, Minus, RotateCcw } from "lucide-react";
import LocationSelector from "@/components/LocationSelector";
import DateTimeInput from "@/components/DateTimeInput";
import { convertDateTime, isValidDateTime, formatDayOfWeek } from "@/utils/timezone";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Location {
  name: string;
  timezone: string;
  lat?: number;
  lng?: number;
}

const STORAGE_KEYS = {
  SOURCE_LOCATION: "timeConverter_sourceLocation",
  TARGET_LOCATIONS: "timeConverter_targetLocations",
};

const Index = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [storedSourceLocation, setStoredSourceLocation] = useLocalStorage<Location | null>(
    STORAGE_KEYS.SOURCE_LOCATION,
    null,
  );
  const [sourceLocation, setSourceLocation] = useState<Location | null>(storedSourceLocation);
  const [manualDateTime, setManualDateTime] = useState<string | null>(null); // null = live mode
  const [targetLocations, setTargetLocations] = useLocalStorage<Location[]>(STORAGE_KEYS.TARGET_LOCATIONS, []);

  // Compute current dateTime string from live clock in the source timezone
  const getLiveDateTimeString = () => {
    const tz = sourceLocation?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const parts = formatter.formatToParts(now);
    const p: Record<string, string> = {};
    parts.forEach((part) => {
      p[part.type] = part.value;
    });
    // "MM/DD/YYYY H:MM AM"
    return `${p.month}/${p.day}/${p.year} ${p.hour}:${p.minute} ${p.dayPeriod?.toUpperCase() ?? 'AM'}`;
  };

  // The effective dateTime - either manual selection or live
  const dateTime = manualDateTime ?? getLiveDateTimeString();
  const isLiveMode = manualDateTime === null;

  const [locationSelectorOpen, setLocationSelectorOpen] = useState(false);
  const [timeSelectorOpen, setTimeSelectorOpen] = useState(false);
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);
  const [removeMode, setRemoveMode] = useState(false);
  const [addCitySelectorOpen, setAddCitySelectorOpen] = useState(false);
  const [isTransitioningToEmpty, setIsTransitioningToEmpty] = useState(false);
  const [isTransitioningToFilled, setIsTransitioningToFilled] = useState(false);
  const [isExitingRemoveMode, setIsExitingRemoveMode] = useState(false);
  const [removingIndices, setRemovingIndices] = useState<Set<number>>(new Set());

  const isDateTimeValid = isValidDateTime(dateTime);

  // Sync sourceLocation to localStorage when it changes
  useEffect(() => {
    if (sourceLocation) {
      setStoredSourceLocation(sourceLocation);
    }
  }, [sourceLocation, setStoredSourceLocation]);

  // Request user location on mount (only if no stored location)
  useEffect(() => {
    if (hasRequestedLocation) return;
    setHasRequestedLocation(true);

    // If we have a stored source location, use it
    if (storedSourceLocation) {
      setSourceLocation(storedSourceLocation);
    } else {
      // Get browser timezone without geolocation
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const cityFromTimezone = "Local";

      setSourceLocation({
        name: cityFromTimezone,
        timezone: userTimezone,
        lat: 0,
        lng: 0,
      });
    }
    // Start in live mode (manualDateTime is already null)
  }, [hasRequestedLocation, storedSourceLocation]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Toggle a location - add if not present, remove if present
  const toggleTargetLocation = (location: Location) => {
    const existingIndex = targetLocations.findIndex((l) => l.name === location.name);

    if (existingIndex !== -1) {
      // Remove it
      setTargetLocations((prev) => prev.filter((_, i) => i !== existingIndex));
    } else {
      // Add it
      const isFirstCity = targetLocations.length === 0;
      if (isFirstCity) {
        setIsTransitioningToFilled(true);
        setTimeout(() => {
          setTargetLocations((prev) => [...prev, location]);
          setIsTransitioningToFilled(false);
        }, 200);
      } else {
        setTargetLocations((prev) => [...prev, location]);
      }
    }
  };

  const addTargetLocations = (locations: Location[]) => {
    // In multi-select mode, this is called for each toggle
    locations.forEach((loc) => toggleTargetLocation(loc));
  };

  const addTargetLocation = (location: Location) => {
    toggleTargetLocation(location);
  };

  const removeTargetLocation = (index: number) => {
    // Add to removing set to trigger fade out animation
    setRemovingIndices((prev) => new Set(prev).add(index));

    // After animation, actually remove
    setTimeout(() => {
      setTargetLocations((prev) => prev.filter((_, i) => i !== index));
      setRemovingIndices((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }, 200);
  };

  const getConvertedTime = (targetTimezone: string) => {
    if (!sourceLocation || !isDateTimeValid) return null;
    return convertDateTime(dateTime, sourceLocation.timezone, targetTimezone);
  };

  const formatTime12Hour = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return {
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      ampm,
    };
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  // Get date string from dateTime (format: "MM/DD/YYYY HH:MM AM/PM")
  const getSourceDateDisplay = () => {
    if (!isDateTimeValid) return formatDate(currentTime);
    // dateTime format: "MM/DD/YYYY HH:MM AM/PM"
    const datePart = dateTime.split(" ")[0]; // "MM/DD/YYYY"
    const [month, day, year] = datePart.split("/");
    return `${year}/${month}/${day}`;
  };

  const getTimeDifference = (targetTimezone: string) => {
    if (!sourceLocation || !isDateTimeValid) return "";
    const result = getConvertedTime(targetTimezone);
    if (!result) return "";

    const dayDiff = result.dayDiff;
    if (dayDiff === 0) return "Same day";
    if (dayDiff > 0) return `+${dayDiff} day${dayDiff > 1 ? "s" : ""}`;
    return `${dayDiff} day${dayDiff < -1 ? "s" : ""}`;
  };

  const handleResetToLocal = () => {
    // Reset time to live mode
    setManualDateTime(null);
    // Reset location to browser timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setSourceLocation({
      name: "Local",
      timezone: userTimezone,
      lat: 0,
      lng: 0,
    });
  };

  const time12 = formatTime12Hour(currentTime);

  return (
    <div className="h-screen bg-background text-foreground flex flex-col dark">
      {/* Header with Logo and Reset Button */}
      <div className="px-6 pt-6 pb-6 flex items-center justify-between">
        <div className="w-10" /> {/* Spacer for centering */}
        <h1
          className="text-[13px] text-muted-foreground tracking-[0.2em] uppercase"
          style={{ fontFamily: "'Inter Tight', sans-serif" }}
        >
          Time Converter
        </h1>
        <button
          onClick={handleResetToLocal}
          className="w-10 h-10 rounded-full bg-card shadow-sm flex items-center justify-center touch-active hover:bg-muted transition-colors"
          title="Reset to local time and location"
        >
          <RotateCcw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Main content - Location and Time */}
      <div className="px-6">
        <div className="flex justify-between mb-4">
          <button
            onClick={() => setLocationSelectorOpen(true)}
            className="flex flex-col items-start transition-colors touch-active"
          >
            <span className="text-[32px] leading-none text-foreground">
              {sourceLocation ? sourceLocation.name.split(",")[0] : "Local"}
            </span>
          </button>
          <button
            onClick={() => setTimeSelectorOpen(true)}
            className="flex flex-col items-end transition-colors touch-active"
          >
            <div className="flex items-baseline gap-1">
              {isDateTimeValid ? (
                <>
                  <span className="text-[32px] leading-none font-light tabular-nums text-foreground">
                    {formatDayOfWeek(dateTime).split(" at ")[1]?.split(" ")[0] || time12.hours + ":" + time12.minutes}
                  </span>
                  <span className="text-[13px] text-muted-foreground">
                    {formatDayOfWeek(dateTime).split(" at ")[1]?.split(" ")[1] || time12.ampm}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[32px] leading-none font-light tabular-nums text-primary">
                    {time12.hours}:{time12.minutes}
                  </span>
                  <span className="text-[13px] text-muted-foreground">{time12.ampm}</span>
                </>
              )}
            </div>
            <span className="text-[13px] text-muted-foreground">{getSourceDateDisplay()}</span>
          </button>
        </div>
      </div>

      {/* Location Selector Sheet */}
      <LocationSelector
        label="Source Location"
        value={sourceLocation}
        onChange={(loc) => {
          setSourceLocation(loc);
          if (loc) {
            setLocationSelectorOpen(false);
          }
        }}
        isOpen={locationSelectorOpen}
        onOpenChange={setLocationSelectorOpen}
      />

      {/* Time Selector Sheet */}
      <DateTimeInput
        value={dateTime}
        onChange={(newDateTime) => setManualDateTime(newDateTime)}
        isValid={isDateTimeValid || dateTime.length === 0}
        isOpen={timeSelectorOpen}
        onOpenChange={setTimeSelectorOpen}
        deferManualSwitch
      />

      {/* Instruction hint */}
      <div className="px-6 pb-2">
        <p className="text-[13px] text-muted-foreground/60 text-center">
          <span className="font-bold text-[13px]">*</span> Click location or time to edit.
        </p>
      </div>

      {/* Divider */}
      <div className="mx-6 h-px bg-border/30" />

      {/* Add/Remove Buttons */}
      <div
        className={`px-6 py-3 bg-background flex items-center transition-all duration-300 ${
          removeMode || isExitingRemoveMode
            ? "justify-start"
            : targetLocations.length > 0
              ? "justify-between"
              : "justify-center"
        }`}
      >
        {/* Remove/Done button - visible when there are cities OR in remove mode */}
        <div
          className={`transition-opacity duration-200 ${
            (targetLocations.length > 0 || removeMode) && !isTransitioningToEmpty && !isExitingRemoveMode
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          } ${targetLocations.length === 0 && !removeMode ? "absolute" : ""}`}
        >
          <button
            className="text-primary text-[17px] font-bold flex items-center gap-2"
            onClick={() => {
              if (removeMode) {
                // Exiting remove mode - fade out Done first, then fade in Add City
                setIsExitingRemoveMode(true);
                setTimeout(() => {
                  setRemoveMode(false);
                  setIsExitingRemoveMode(false);
                }, 200);
              } else {
                setRemoveMode(true);
              }
            }}
          >
            {removeMode ? (
              <span>Done</span>
            ) : (
              <>
                <Minus className="w-5 h-5" />
                <span>Remove</span>
              </>
            )}
          </button>
        </div>

        {!removeMode && (
          <button
            className={`text-primary text-[17px] font-bold flex items-center gap-2 transition-opacity duration-200 ${
              isTransitioningToEmpty || isTransitioningToFilled || isExitingRemoveMode ? "opacity-0" : "opacity-100"
            }`}
            onClick={() => setAddCitySelectorOpen(true)}
          >
            <Plus className="w-5 h-5" />
            <span>Add City</span>
          </button>
        )}
      </div>

      {/* Add City Location Selector Sheet */}
      <LocationSelector
        label="Add Location"
        value={null}
        onChange={() => {}}
        isOpen={addCitySelectorOpen}
        onOpenChange={setAddCitySelectorOpen}
        multiSelect={true}
        onMultiSelect={(locations) => {
          addTargetLocations(locations);
          setAddCitySelectorOpen(false);
        }}
        existingLocations={targetLocations}
      />

      {/* Cities List */}
      <div className="flex-1 overflow-y-auto bg-background pt-3 pb-6">
        {targetLocations.length === 0 && (
          <div className="px-6 py-8 text-center text-muted-foreground">
            <p className="text-[15px]">No cities added yet</p>
          </div>
        )}

        {targetLocations.map((location, index) => {
          const result = getConvertedTime(location.timezone);
          const timeDiff = getTimeDifference(location.timezone);

          // Parse converted time for display
          let displayTime = { hours: "--", minutes: "--", ampm: "" };
          let displayDate = "";

          if (result) {
            const converted = result.converted;
            // Format: "MM/DD/YYYY (Day) at HH:MM AM/PM"
            const atIndex = converted.indexOf(" at ");
            if (atIndex !== -1) {
              displayDate = converted.substring(0, atIndex);
              const timePart = converted.substring(atIndex + 4);
              const [time, ampm] = timePart.split(" ");
              const [hours, minutes] = time.split(":");
              displayTime = { hours, minutes, ampm };
            }
          }
          const isRemoving = removingIndices.has(index);

          return (
            <div
              key={location.name}
              className={`transition-all duration-200 ${
                isRemoving ? "opacity-0 scale-95 h-0 mb-0 overflow-hidden" : "opacity-100 scale-100"
              }`}
              style={{
                transitionProperty: isRemoving ? "opacity, transform" : "opacity, transform, height, margin",
                transitionDelay: isRemoving ? "0ms" : "0ms",
              }}
            >
              <button
                onClick={() => removeMode && !isRemoving && removeTargetLocation(index)}
                className={`mx-4 mb-3 city-card p-4 w-[calc(100%-2rem)] text-left transition-colors duration-200 ${
                  removeMode ? "border border-destructive bg-destructive/10" : "bg-card"
                }`}
                disabled={!removeMode || isRemoving}
              >
                {/* Secondary header */}
                <div className="flex justify-between items-center text-[13px] text-muted-foreground mb-2">
                  <span>{displayDate}</span>
                  <span>{timeDiff}</span>
                </div>

                {/* Main content - Time and City */}
                <div className="flex justify-between items-baseline">
                  <span className="text-[32px] text-foreground">{location.name.split(",")[0]}</span>

                  <div className="flex items-baseline gap-2">
                    <span className="text-[32px] leading-none font-light tabular-nums text-foreground">
                      {displayTime.hours}:{displayTime.minutes}
                    </span>
                    <span className="text-[13px] text-muted-foreground">{displayTime.ampm}</span>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Index;
