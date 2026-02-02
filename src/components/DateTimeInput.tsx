import React, { useState, useRef, useEffect, useLayoutEffect, useMemo, forwardRef, useCallback } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface DateTimeInputProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** If true, opening picker does NOT auto-switch to manual mode; only user interaction does. */
  deferManualSwitch?: boolean;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const hours = Array.from({ length: 12 }, (_, i) => i + 1);
const minutes = Array.from({ length: 60 }, (_, i) => i);
const periods = ['AM', 'PM'];

const DateTimeInput = forwardRef<HTMLDivElement, DateTimeInputProps>(
  function DateTimeInput({ value, onChange, isValid, isOpen: externalOpen, onOpenChange, deferManualSwitch = false }, ref) {
    // Track if the user has made an actual change during this open session
    const userChangedRef = useRef(false);

    // Always compute current year fresh
    const getCurrentYear = () => new Date().getFullYear();
    
    // Initialize time from current time
    const now = new Date();
    const currentHour = now.getHours();
    const currentYear = getCurrentYear();
    
    const [baseYear, setBaseYear] = useState(currentYear);
    const [month, setMonth] = useState(now.getMonth());
    const [day, setDay] = useState(now.getDate());
    const [year, setYear] = useState(currentYear);
    const [hour, setHour] = useState(currentHour % 12 || 12);
    const [minute, setMinute] = useState(now.getMinutes());
    const [period, setPeriod] = useState<'AM' | 'PM'>(currentHour >= 12 ? 'PM' : 'AM');
    const [step, setStep] = useState<'date' | 'time'>('time');

    // Only allow selecting the current year ± 1, per product requirement.
    const years = useMemo(() => [baseYear - 1, baseYear, baseYear + 1], [baseYear]);
    
    const monthRef = useRef<HTMLDivElement>(null);
    const dayRef = useRef<HTMLDivElement>(null);
    const yearRef = useRef<HTMLDivElement>(null);
    const hourRef = useRef<HTMLDivElement>(null);
    const minuteRef = useRef<HTMLDivElement>(null);
    const periodRef = useRef<HTMLDivElement>(null);
    
    const scrollTimeoutRef = useRef<{ [key: string]: number }>({});
    // Prevent "programmatic" scroll positioning (when opening / switching steps)
    // from triggering the debounced snap handler.
    // Without this, the year column can briefly land between items and round up
    // to the next year (e.g. 2027).
    const suspendScrollHandlersRef = useRef(false);
    const resumeScrollHandlersTimeoutRef = useRef<number | null>(null);

    // Update parent value when any component changes
    // If deferManualSwitch is true, only call onChange after user has interacted.
    // IMPORTANT: Only call onChange when the sheet is open to prevent stale state from
    // overwriting the parent's value after reset.
    useEffect(() => {
      // Never call onChange if the sheet is closed
      if (!externalOpen) return;
      // Skip calling onChange if we're in deferred mode and user hasn't changed anything
      if (deferManualSwitch && !userChangedRef.current) return;

      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const hourStr = String(hour);
      const minuteStr = String(minute).padStart(2, '0');
      const formatted = `${monthStr}/${dayStr}/${year} ${hourStr}:${minuteStr} ${period}`;
      onChange(formatted);
    }, [month, day, year, hour, minute, period, onChange, deferManualSwitch, externalOpen]);

    // Reset to the passed-in value (live clock) every time the sheet opens.
    // useLayoutEffect prevents a one-frame flash of stale values.
    useLayoutEffect(() => {
      if (!externalOpen) return;

      // Reset user changed tracker when opening
      userChangedRef.current = false;

      // While opening, we programmatically set scrollTop for each column.
      // Suspend scroll handlers to avoid the debounced snap logic from
      // interpreting those intermediate scroll positions as user input.
      suspendScrollHandlersRef.current = true;
      if (resumeScrollHandlersTimeoutRef.current) {
        window.clearTimeout(resumeScrollHandlersTimeoutRef.current);
        resumeScrollHandlersTimeoutRef.current = null;
      }

      // Parse the current value (format: "MM/DD/YYYY H:MM AM/PM")
      const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)$/i);
      if (match) {
        const [, monthStr, dayStr, yearStr, hourStr, minuteStr, periodStr] = match;
        const parsedYear = parseInt(yearStr, 10);
        const parsedMonth = parseInt(monthStr, 10) - 1;
        const parsedDay = parseInt(dayStr, 10);
        const parsedHour = parseInt(hourStr, 10);
        const parsedMinute = parseInt(minuteStr, 10);
        const parsedPeriod = periodStr.toUpperCase() as 'AM' | 'PM';

        setBaseYear(parsedYear);
        setMonth(parsedMonth);
        setDay(parsedDay);
        setYear(parsedYear);
        setHour(parsedHour);
        setMinute(parsedMinute);
        setPeriod(parsedPeriod);
      } else {
        // Fallback to current local time if value can't be parsed
        const now = new Date();
        const currentHour = now.getHours();
        const currentYear = now.getFullYear();
        setBaseYear(currentYear);
        setMonth(now.getMonth());
        setDay(now.getDate());
        setYear(currentYear);
        setHour(currentHour % 12 || 12);
        setMinute(now.getMinutes());
        setPeriod(currentHour >= 12 ? 'PM' : 'AM');
      }
      setStep('time');
    }, [externalOpen, value]);

    // Scroll to selected value in picker.
    // NOTE: When opening the sheet we use an instant scroll to avoid triggering
    // handleScrollEnd mid-smooth-animation, which could snap to the wrong year.
    const scrollToSelected = (
      scrollRef: React.RefObject<HTMLDivElement>,
      index: number,
      behavior: ScrollBehavior = 'auto'
    ) => {
      if (scrollRef.current) {
        const itemHeight = 44;
        scrollRef.current.scrollTo({
          top: index * itemHeight,
          behavior
        });
      }
    };

    // If the sheet closes, ensure no pending debounced "scroll end" callbacks can
    // fire later and mutate state (this can manifest as the year jumping to +1).
    useEffect(() => {
      if (externalOpen) return;
      for (const key of Object.keys(scrollTimeoutRef.current)) {
        clearTimeout(scrollTimeoutRef.current[key]);
      }
      scrollTimeoutRef.current = {};

      // If the sheet closes mid-initialization, ensure we don't keep scroll
      // handlers suspended (or resume later and unexpectedly run snaps).
      suspendScrollHandlersRef.current = false;
      if (resumeScrollHandlersTimeoutRef.current) {
        window.clearTimeout(resumeScrollHandlersTimeoutRef.current);
        resumeScrollHandlersTimeoutRef.current = null;
      }
    }, [externalOpen]);

    // Handle scroll end and snap to closest value
    // Uses both debounced onScroll AND scrollend event for reliability
    const handleScrollEnd = useCallback((
      scrollRef: React.RefObject<HTMLDivElement>,
      items: (number | string)[],
      setValue: (val: any) => void,
      timeoutKey: string
    ) => {
      if (scrollTimeoutRef.current[timeoutKey]) {
        clearTimeout(scrollTimeoutRef.current[timeoutKey]);
      }
      
      // Debounce: wait for scroll to settle, then snap
      scrollTimeoutRef.current[timeoutKey] = window.setTimeout(() => {
        if (scrollRef.current) {
          const scrollTop = scrollRef.current.scrollTop;
          const itemHeight = 44;
          const closestIndex = Math.round(scrollTop / itemHeight);
          const clampedIndex = Math.max(0, Math.min(closestIndex, items.length - 1));

          // Mark that user has made a change
          userChangedRef.current = true;

          // Update state with snapped value
          setValue(items[clampedIndex]);
        }
      }, 80); // Reduced debounce for snappier response
    }, []);

    // Attach scrollend listeners for more reliable detection (where supported)
    useEffect(() => {
      if (!externalOpen) return;

      type ScrollConfig = {
        ref: React.RefObject<HTMLDivElement>;
        items: (number | string)[];
        setValue: (val: any) => void;
        key: string;
      };

      const refs: ScrollConfig[] = [
        { ref: monthRef, items: Array.from({ length: 12 }, (_, i) => i), setValue: setMonth, key: 'month' },
        { ref: dayRef, items: days, setValue: setDay, key: 'day' },
        { ref: yearRef, items: years, setValue: setYear, key: 'year' },
        { ref: hourRef, items: hours, setValue: setHour, key: 'hour' },
        { ref: minuteRef, items: minutes, setValue: setMinute, key: 'minute' },
        { ref: periodRef, items: periods, setValue: (p: string) => setPeriod(p as 'AM' | 'PM'), key: 'period' },
      ];

      const handlers: Array<{ el: HTMLDivElement; handler: () => void }> = [];

      refs.forEach(({ ref, items, setValue }) => {
        const el = ref.current;
        if (!el) return;

        const onScrollEnd = () => {
          if (suspendScrollHandlersRef.current) return;
          const scrollTop = el.scrollTop;
          const itemHeight = 44;
          const closestIndex = Math.round(scrollTop / itemHeight);
          const clampedIndex = Math.max(0, Math.min(closestIndex, items.length - 1));
          userChangedRef.current = true;
          setValue(items[clampedIndex]);
        };

        el.addEventListener('scrollend', onScrollEnd);
        handlers.push({ el, handler: onScrollEnd });
      });

      return () => {
        handlers.forEach(({ el, handler }) => {
          el.removeEventListener('scrollend', handler);
        });
      };
    }, [externalOpen, step, years]);

    // Scroll to initial positions when sheet opens or step changes
    useEffect(() => {
      if (!externalOpen) return;

      // Keep scroll handlers suspended while we position the columns.
      // We'll re-enable them shortly after.
      suspendScrollHandlersRef.current = true;
      if (resumeScrollHandlersTimeoutRef.current) {
        window.clearTimeout(resumeScrollHandlersTimeoutRef.current);
        resumeScrollHandlersTimeoutRef.current = null;
      }
      
      if (step === 'date') {
        // Wait a moment for the sheet animation/layout to settle.
        setTimeout(() => {
          // Use instant scroll on open/step change to avoid debounced snap firing mid-animation
          scrollToSelected(monthRef, month, 'auto');
          scrollToSelected(dayRef, day - 1, 'auto');
          const yearIndex = years.indexOf(year);
          scrollToSelected(yearRef, yearIndex === -1 ? 1 : yearIndex, 'auto');
        }, 150);
      } else if (step === 'time') {
        // Wait a moment for the sheet animation/layout to settle.
        setTimeout(() => {
          // Use instant scroll on open/step change to avoid debounced snap firing mid-animation
          scrollToSelected(hourRef, hour - 1, 'auto');
          scrollToSelected(minuteRef, minute, 'auto');
          scrollToSelected(periodRef, period === 'AM' ? 0 : 1, 'auto');
        }, 150);
      }

      // Re-enable scroll handlers after the initial positioning has completed.
      // (Using a timeout keeps us safe from late scroll events during the open
      // animation on mobile.)
      resumeScrollHandlersTimeoutRef.current = window.setTimeout(() => {
        suspendScrollHandlersRef.current = false;
        resumeScrollHandlersTimeoutRef.current = null;
      }, 500);
    }, [step, externalOpen]);

    const getDayOfWeek = () => {
      const date = new Date(year, month, day);
      return format(date, 'EEE');
    };

    const getRelativeDateLabel = () => {
      const selectedDate = new Date(year, month, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      const diffTime = selectedDate.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays === -1) return 'Yesterday';
      return null;
    };

    const displayTime = `${hour}:${String(minute).padStart(2, '0')} ${period}`;
    const relativeLabel = getRelativeDateLabel();
    const displayDate = relativeLabel 
      ? `${relativeLabel} (${getDayOfWeek()})`
      : `${String(month + 1).padStart(2, '0')}/${String(day).padStart(2, '0')}/${year} (${getDayOfWeek()})`;

    const closeSheet = () => {
      if (onOpenChange) {
        onOpenChange(false);
      }
    };

    // If controlled externally, render as bottom sheet
    if (onOpenChange !== undefined) {
      if (!externalOpen) return null;
      
      return (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
            onClick={closeSheet}
          />
          
          {/* Bottom Sheet */}
          <div className="fixed inset-x-0 bottom-0 bg-popover border-t border-border rounded-t-2xl z-50 animate-slide-up max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between px-4 py-3 border-b border-border">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Selected:</p>
                <p className="text-base font-medium text-primary leading-none">{displayTime} · {displayDate}</p>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setStep(step === 'date' ? 'time' : 'date')}
                  className="text-sm text-foreground font-medium touch-active leading-none px-4 py-2 rounded-lg bg-secondary border border-border transition-colors active:bg-hover"
                >
                  {step === 'date' ? 'Change Time' : 'Change Date'}
                </button>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto">
              {step === 'date' ? (
                <div className="space-y-4">
                  {/* Date Scroll Picker */}
                  <div className="flex gap-2 h-[180px] relative">
                    {/* Center highlight */}
                    <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-[44px] bg-secondary/50 rounded-lg pointer-events-none z-0" />
                    
                    {/* Month */}
                    <div 
                      ref={monthRef}
                      className="flex-[1.5] overflow-y-auto hide-scrollbar snap-y snap-mandatory relative z-10"
                      style={{ scrollSnapType: 'y mandatory' }}
                      onScroll={() => {
                        if (suspendScrollHandlersRef.current) return;
                        handleScrollEnd(monthRef, Array.from({ length: 12 }, (_, i) => i), setMonth, 'month');
                      }}
                    >
                      <div className="h-[68px]" />
                      {months.map((m, index) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => { userChangedRef.current = true; setMonth(index); }}
                          className={cn(
                            "w-full h-[44px] flex items-center justify-center text-base font-medium transition-all snap-center touch-active",
                            month === index ? "text-foreground font-bold" : "text-muted-foreground"
                          )}
                        >
                          {m}
                        </button>
                      ))}
                      <div className="h-[68px]" />
                    </div>
                    
                    {/* Day */}
                    <div 
                      ref={dayRef}
                      className="flex-1 overflow-y-auto hide-scrollbar snap-y snap-mandatory relative z-10"
                      style={{ scrollSnapType: 'y mandatory' }}
                      onScroll={() => {
                        if (suspendScrollHandlersRef.current) return;
                        handleScrollEnd(dayRef, days, setDay, 'day');
                      }}
                    >
                      <div className="h-[68px]" />
                      {days.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => { userChangedRef.current = true; setDay(d); }}
                          className={cn(
                            "w-full h-[44px] flex items-center justify-center text-lg font-medium transition-all snap-center touch-active",
                            day === d ? "text-foreground font-bold" : "text-muted-foreground"
                          )}
                        >
                          {d}
                        </button>
                      ))}
                      <div className="h-[68px]" />
                    </div>
                    
                    {/* Year */}
                    <div 
                      ref={yearRef}
                      className="flex-1 overflow-y-auto hide-scrollbar snap-y snap-mandatory relative z-10"
                      style={{ scrollSnapType: 'y mandatory' }}
                      onScroll={() => {
                        if (suspendScrollHandlersRef.current) return;
                        handleScrollEnd(yearRef, years, setYear, 'year');
                      }}
                    >
                      <div className="h-[68px]" />
                      {years.map((y) => (
                        <button
                          key={y}
                          type="button"
                          onClick={() => { userChangedRef.current = true; setYear(y); }}
                          className={cn(
                            "w-full h-[44px] flex items-center justify-center text-lg font-medium transition-all snap-center touch-active",
                            year === y ? "text-foreground font-bold" : "text-muted-foreground"
                          )}
                        >
                          {y}
                        </button>
                      ))}
                      <div className="h-[68px]" />
                    </div>
                  </div>
                  
                  {/* Done button */}
                  <Button
                    variant="secondary"
                    className="w-full h-14 text-lg font-medium"
                    onClick={closeSheet}
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Time Scroll Picker */}
                  <div className="flex gap-2 h-[180px] relative">
                    {/* Center highlight */}
                    <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-[44px] bg-secondary/50 rounded-lg pointer-events-none z-0" />
                    
                    {/* Hour */}
                    <div 
                      ref={hourRef}
                      className="flex-1 overflow-y-auto hide-scrollbar snap-y snap-mandatory relative z-10"
                      style={{ scrollSnapType: 'y mandatory' }}
                      onScroll={() => {
                        if (suspendScrollHandlersRef.current) return;
                        handleScrollEnd(hourRef, hours, setHour, 'hour');
                      }}
                    >
                      <div className="h-[68px]" />
                      {hours.map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => { userChangedRef.current = true; setHour(h); }}
                          className={cn(
                            "w-full h-[44px] flex items-center justify-center text-lg font-medium transition-all snap-center touch-active",
                            hour === h ? "text-foreground font-bold" : "text-muted-foreground"
                          )}
                        >
                          {h}
                        </button>
                      ))}
                      <div className="h-[68px]" />
                    </div>
                    
                    {/* Separator */}
                    <div className="flex items-center justify-center text-xl font-bold text-muted-foreground">:</div>
                    
                    {/* Minute */}
                    <div 
                      ref={minuteRef}
                      className="flex-1 overflow-y-auto hide-scrollbar snap-y snap-mandatory relative z-10"
                      style={{ scrollSnapType: 'y mandatory' }}
                      onScroll={() => {
                        if (suspendScrollHandlersRef.current) return;
                        handleScrollEnd(minuteRef, minutes, setMinute, 'minute');
                      }}
                    >
                      <div className="h-[68px]" />
                      {minutes.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => { userChangedRef.current = true; setMinute(m); }}
                          className={cn(
                            "w-full h-[44px] flex items-center justify-center text-lg font-medium transition-all snap-center touch-active",
                            minute === m ? "text-foreground font-bold" : "text-muted-foreground"
                          )}
                        >
                          {String(m).padStart(2, '0')}
                        </button>
                      ))}
                      <div className="h-[68px]" />
                    </div>
                    
                    {/* AM/PM */}
                    <div 
                      ref={periodRef}
                      className="w-16 overflow-y-auto hide-scrollbar snap-y snap-mandatory relative z-10"
                      style={{ scrollSnapType: 'y mandatory' }}
                      onScroll={() => {
                        if (suspendScrollHandlersRef.current) return;
                        handleScrollEnd(periodRef, periods, (p: string) => setPeriod(p as 'AM' | 'PM'), 'period');
                      }}
                    >
                      <div className="h-[68px]" />
                      {periods.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => { userChangedRef.current = true; setPeriod(p as 'AM' | 'PM'); }}
                          className={cn(
                            "w-full h-[44px] flex items-center justify-center text-lg font-medium transition-all snap-center touch-active",
                            period === p ? "text-foreground font-bold" : "text-muted-foreground"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                      <div className="h-[68px]" />
                    </div>
                  </div>
                  
                  {/* Done button */}
                  <Button 
                    type="button"
                    variant="secondary"
                    className="w-full h-14 text-lg font-medium touch-active"
                    onClick={closeSheet}
                  >
                    Done
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      );
    }

    // Original inline mode (fallback, not used in current flow)
    return (
      <div ref={ref} className="space-y-3">
        <label className="block text-sm font-medium text-muted-foreground">
          Date & Time
        </label>
        
        <Button
          variant="outline"
          className={cn(
            "w-full h-[52px] justify-start text-left font-normal px-4 gap-3 touch-active",
            "text-muted-foreground"
          )}
          onClick={() => onOpenChange?.(true)}
        >
          <CalendarIcon className="w-5 h-5 flex-shrink-0" />
          {displayTime ? `${displayDate} at ${displayTime}` : 'Select date & time'}
        </Button>
      </div>
    );
  }
);

export default DateTimeInput;
