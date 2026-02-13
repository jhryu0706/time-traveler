import React, { useState, useEffect } from "react";
import { Plus, Minus, RotateCcw } from "lucide-react";
import LocationSelector from "@/components/LocationSelector";
import DateTimeInput from "@/components/DateTimeInput";
import { convertDateTime, isValidDateTime } from "@/utils/timezone";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Location } from "@/types";

const STORAGE_KEYS = {
  SOURCE_LOCATION: "timeConverter_sourceLocation",
  TARGET_LOCATIONS: "timeConverter_targetLocations",
};

const Index = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sourceLocation, setSourceLocation] = useLocalStorage<Location | null>(
    STORAGE_KEYS.SOURCE_LOCATION,
    null,
  );
  const [manualDateTime, setManualDateTime] = useState<string | null>(null); // null = live mode
  const [targetLocations, setTargetLocations] = useLocalStorage<Location[]>(STORAGE_KEYS.TARGET_LOCATIONS, []);

  // Compute current dateTime string from live clock
  const getLiveDateTimeString = () => {
    // Live mode must reflect the *selected source location's timezone*.
    // We format `currentTime` into that timezone using Intl (handles DST correctly).
    const timezone = sourceLocation?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).formatToParts(currentTime);

    const map: Record<string, string> = {};
    for (const p of parts) map[p.type] = p.value;

    const month = map.month;
    const day = map.day;
    const year = map.year;
    const hour = map.hour;
    const minute = map.minute;
    const period = (map.dayPeriod || "").toUpperCase();

    return `${month}/${day}/${year} ${hour}:${minute} ${period}`;
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

  // Track previous source location for timezone conversion
  const prevSourceLocationRef = React.useRef<Location | null>(null);
  // Track manualDateTime in a ref so we can access current value in effects
  const manualDateTimeRef = React.useRef<string | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    manualDateTimeRef.current = manualDateTime;
  }, [manualDateTime]);

  // Convert time when timezone changes
  useEffect(() => {
    if (!sourceLocation) return;

    const prevLocation = prevSourceLocationRef.current;
    const currentManualDateTime = manualDateTimeRef.current;

    // Only convert if we have a previous location with different timezone and a manual time
    if (prevLocation && prevLocation.timezone !== sourceLocation.timezone && currentManualDateTime) {
      const result = convertDateTime(currentManualDateTime, prevLocation.timezone, sourceLocation.timezone);

      if (result) {
        setManualDateTime(`${result.month}/${result.day}/${result.year} ${result.hour}:${result.minute} ${result.ampm}`);
      }
    }

    // Always update the ref after processing
    prevSourceLocationRef.current = sourceLocation;
  }, [sourceLocation]);

  // Set default source location on mount if none stored
  useEffect(() => {
    if (hasRequestedLocation) return;
    setHasRequestedLocation(true);

    if (!sourceLocation) {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setSourceLocation({
        name: "Local",
        timezone: userTimezone,
        lat: 0,
        lng: 0,
      });
    }
  }, [hasRequestedLocation, sourceLocation, setSourceLocation]);

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

  // Parse dateTime string into display parts
  const parsedSource = (() => {
    const match = dateTime.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)$/i);
    if (!match) return null;
    const [, month, day, year, hour, minute, ampm] = match;
    return { month, day, year, time: `${hour}:${minute}`, ampm: ampm.toUpperCase() };
  })();

  const formatDayDiff = (dayDiff: number) => {
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

  return (
    <div className="h-screen bg-background text-foreground flex flex-col">
      {/* Header with Hint and Reset Button */}
      <div className="px-6 pt-4 pb-8 flex items-center justify-between">
        <div className="w-5" /> {/* Spacer for centering */}
        <p className="text-[13px] text-muted-foreground whitespace-nowrap">Click Location or Time to Edit</p>
        <button onClick={handleResetToLocal} className="touch-active p-1" title="Reset to local time and location">
          <RotateCcw className="w-5 h-5 text-muted-foreground" />
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
            {parsedSource ? (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="text-[32px] leading-none font-light tabular-nums text-foreground">
                    {parsedSource.time}
                  </span>
                  <span className="text-[13px] text-muted-foreground">
                    {parsedSource.ampm}
                  </span>
                </div>
                <span className="text-[13px] text-muted-foreground">
                  {parsedSource.year}/{parsedSource.month}/{parsedSource.day}
                </span>
              </>
            ) : (
              <span className="text-[32px] leading-none font-light tabular-nums text-foreground">--:--</span>
            )}
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
      />

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
          locations.forEach((loc) => toggleTargetLocation(loc));
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
          const timeDiff = result ? formatDayDiff(result.dayDiff) : "";

          const displayTime = result
            ? { hours: result.hour, minutes: result.minute, ampm: result.ampm }
            : { hours: "--", minutes: "--", ampm: "" };
          const displayDate = result
            ? `${result.month}/${result.day}/${result.year} (${result.dayOfWeek})`
            : "";
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
