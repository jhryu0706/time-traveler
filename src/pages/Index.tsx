import React, { useState, useEffect } from "react";
import { Plus, X, Clock, Minus, ChevronRight } from "lucide-react";
import LocationSelector from "@/components/LocationSelector";
import DateTimeInput from "@/components/DateTimeInput";
import { convertDateTime, isValidDateTime, formatDayOfWeek } from "@/utils/timezone";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Location {
  name: string;
  timezone: string;
  lat?: number;
  lng?: number;
}

const Index = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sourceLocation, setSourceLocation] = useState<Location | null>(null);
  const [dateTime, setDateTime] = useState("");
  const [targetLocations, setTargetLocations] = useState<Location[]>([]);

  const [locationSelectorOpen, setLocationSelectorOpen] = useState(false);
  const [timeSelectorOpen, setTimeSelectorOpen] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);
  const [showTimeChoiceDialog, setShowTimeChoiceDialog] = useState(false);
  const [removeMode, setRemoveMode] = useState(false);
  const [addCitySelectorOpen, setAddCitySelectorOpen] = useState(false);
  const [isTransitioningToEmpty, setIsTransitioningToEmpty] = useState(false);
  const [isTransitioningToFilled, setIsTransitioningToFilled] = useState(false);

  const isDateTimeValid = isValidDateTime(dateTime);

  // Request user location on mount
  useEffect(() => {
    if (hasRequestedLocation) return;
    setHasRequestedLocation(true);

    // Get browser timezone without geolocation
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const cityFromTimezone = "Local";

    setSourceLocation({
      name: cityFromTimezone,
      timezone: userTimezone,
      lat: 0, // placeholder coords since we're not using geolocation
      lng: 0,
    });

    // Set to current local time
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    setDateTime(`${month}/${day}/${year} ${hours}:${String(minutes).padStart(2, "0")} ${period}`);
  }, [hasRequestedLocation]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addTargetLocation = (location: Location) => {
    if (!targetLocations.find((l) => l.name === location.name)) {
      const isFirstCity = targetLocations.length === 0;
      if (isFirstCity) {
        // Fade out centered button, then show filled state
        setIsTransitioningToFilled(true);
        setTimeout(() => {
          setTargetLocations([...targetLocations, location]);
          setIsTransitioningToFilled(false);
        }, 200);
      } else {
        setTargetLocations([...targetLocations, location]);
      }
    }
  };

  const removeTargetLocation = (index: number) => {
    const newLocations = targetLocations.filter((_, i) => i !== index);
    setTargetLocations(newLocations);
    // Stay in remove mode even when empty - user must click Done to exit
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

  const getTimeDifference = (targetTimezone: string) => {
    if (!sourceLocation || !isDateTimeValid) return "";
    const result = getConvertedTime(targetTimezone);
    if (!result) return "";

    const dayDiff = result.dayDiff;
    if (dayDiff === 0) return "Same day";
    if (dayDiff > 0) return `+${dayDiff} day${dayDiff > 1 ? "s" : ""}`;
    return `${dayDiff} day${dayDiff < -1 ? "s" : ""}`;
  };

  const handleSetLocalTime = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    setDateTime(`${month}/${day}/${year} ${hours}:${String(minutes).padStart(2, "0")} ${period}`);
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
      <div className="px-6 pt-6 pb-10">
        <h1
          className="text-[13px] text-muted-foreground tracking-[0.2em] uppercase text-center"
          style={{ fontFamily: "'Inter Tight', sans-serif" }}
        >
          Time Converter
        </h1>
        <div className="flex items-center justify-center gap-1 mt-2 text-[13px] text-muted-foreground/60">
          <ChevronRight className="w-4 h-4" />
          <span>Click source location or time to edit.</span>
        </div>
      </div>

      {/* Header */}
      <div className="px-6">
        {/* Secondary header */}
        <div className="flex justify-between items-center text-[13px] text-muted-foreground mb-2">
          <span>{formatDate(currentTime)}</span>
          <span className="text-muted-foreground">Source time</span>
        </div>

        {/* Main content - Time and Location */}
        {!missingDateorLoc ? (
          <div className="flex justify-between items-baseline mb-4">
            <button
              onClick={() => setLocationSelectorOpen(true)}
              className="text-[32px] text-foreground transition-colors touch-active flex items-center gap-1"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
              {sourceLocation ? sourceLocation.name.split(",")[0] : "Local"}
            </button>
            <button
              onClick={() => setTimeSelectorOpen(true)}
              className="flex items-center gap-1 transition-colors touch-active"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
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
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-8">
            <button
              onClick={() => setLocationSelectorOpen(true)}
              className="bg-white/10 backdrop-blur-sm text-muted-foreground px-8 py-4 rounded-2xl text-[17px] font-medium btn-press border border-white/5"
              style={{ fontFamily: "'Inter Tight', sans-serif" }}
            >
              Add first location
            </button>
          </div>
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

      {/* Divider */}
      <div className="mx-6 my-4 h-px bg-border/30" />

      {/* Add/Remove Buttons */}
      <div
        className={`px-6 py-3 bg-background flex items-center transition-all duration-300 ${
          targetLocations.length > 0 ? "justify-between" : "justify-center"
        }`}
      >
        {/* Remove button - only visible when there are cities */}
        <div
          className={`transition-opacity duration-200 ${
            targetLocations.length > 0 && !isTransitioningToEmpty
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          } ${targetLocations.length === 0 ? "absolute" : ""}`}
        >
          <button
            className="text-primary text-[17px] font-bold flex items-center gap-2"
            onClick={() => setRemoveMode(!removeMode)}
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
              isTransitioningToEmpty || isTransitioningToFilled ? "opacity-0" : "opacity-100"
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
        onChange={(loc) => {
          if (loc) {
            addTargetLocation(loc);
            setAddCitySelectorOpen(false);
          }
        }}
        isOpen={addCitySelectorOpen}
        onOpenChange={setAddCitySelectorOpen}
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

          return (
            <button
              key={location.name}
              onClick={() => removeMode && removeTargetLocation(index)}
              className={`mx-4 mb-3 city-card p-4 animate-fade-in w-[calc(100%-2rem)] text-left transition-all duration-200 ${
                removeMode ? "border-2 border-destructive" : ""
              }`}
              style={{
                background: `linear-gradient(135deg, hsl(0 0% 8%) 0%, hsl(0 0% 8%) 100%)`,
              }}
              disabled={!removeMode}
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
          );
        })}
      </div>
    </div>
  );
};

export default Index;
