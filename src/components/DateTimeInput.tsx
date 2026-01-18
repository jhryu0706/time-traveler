import React, { useState, useRef, useEffect, forwardRef, useCallback } from 'react';
import { Calendar as CalendarIcon, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface DateTimeInputProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const hours = Array.from({ length: 12 }, (_, i) => i + 1);
const minutes = Array.from({ length: 60 }, (_, i) => i);
const periods = ['AM', 'PM'];

const DateTimeInput = forwardRef<HTMLDivElement, DateTimeInputProps>(
  function DateTimeInput({ value, onChange, isValid, isOpen: externalOpen, onOpenChange }, ref) {
    // Initialize blank - no default date/time
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [hour, setHour] = useState(12);
    const [minute, setMinute] = useState(0);
    const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
    const [dateOpen, setDateOpen] = useState(false);
    const [timeOpen, setTimeOpen] = useState(false);
    
    // Sync with external open state - open date picker when sheet opens
    useEffect(() => {
      if (externalOpen && !date) {
        setDateOpen(true);
      }
    }, [externalOpen, date]);
    
    const hourRef = useRef<HTMLDivElement>(null);
    const minuteRef = useRef<HTMLDivElement>(null);
    const periodRef = useRef<HTMLDivElement>(null);
    
    const scrollTimeoutRef = useRef<{ hour?: number; minute?: number; period?: number }>({});

    // Update parent value when any component changes
    useEffect(() => {
      if (date) {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        const hourStr = String(hour);
        const minuteStr = String(minute).padStart(2, '0');
        const formatted = `${month}/${day}/${year} ${hourStr}:${minuteStr} ${period}`;
        onChange(formatted);
      }
    }, [date, hour, minute, period, onChange]);

    // Scroll to selected value in picker
    const scrollToSelected = (scrollRef: React.RefObject<HTMLDivElement>, index: number) => {
      if (scrollRef.current) {
        const itemHeight = 44;
        scrollRef.current.scrollTo({
          top: index * itemHeight,
          behavior: 'smooth'
        });
      }
    };

    // Handle scroll end and snap to closest value
    const handleScrollEnd = useCallback((
      scrollRef: React.RefObject<HTMLDivElement>,
      items: number[] | string[],
      setValue: (val: any) => void,
      timeoutKey: 'hour' | 'minute' | 'period'
    ) => {
      if (scrollTimeoutRef.current[timeoutKey]) {
        clearTimeout(scrollTimeoutRef.current[timeoutKey]);
      }
      
      scrollTimeoutRef.current[timeoutKey] = window.setTimeout(() => {
        if (scrollRef.current) {
          const scrollTop = scrollRef.current.scrollTop;
          const itemHeight = 44;
          const closestIndex = Math.round(scrollTop / itemHeight);
          const clampedIndex = Math.max(0, Math.min(closestIndex, items.length - 1));
          
          // Snap to the closest item
          scrollRef.current.scrollTo({
            top: clampedIndex * itemHeight,
            behavior: 'smooth'
          });
          
          // Set the value
          setValue(items[clampedIndex]);
        }
      }, 100);
    }, []);

    useEffect(() => {
      if (timeOpen) {
        setTimeout(() => {
          scrollToSelected(hourRef, hour - 1);
          scrollToSelected(minuteRef, minute);
          scrollToSelected(periodRef, period === 'AM' ? 0 : 1);
        }, 100);
      }
    }, [timeOpen, hour, minute, period]);

    const handleDateSelect = (selectedDate: Date | undefined) => {
      setDate(selectedDate);
      if (selectedDate) {
        setDateOpen(false);
        setTimeout(() => setTimeOpen(true), 150);
      }
    };

    // Format: 12/31/2025 (Wed) at 8:00 PM
    const displayValue = date 
      ? `${format(date, 'MM/dd/yyyy')} (${format(date, 'EEE')}) at ${hour}:${String(minute).padStart(2, '0')} ${period}`
      : '';

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
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-medium text-foreground">Select Date & Time</span>
              <button
                onClick={closeSheet}
                className="p-2 -mr-2 touch-active"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto">
              {/* Calendar */}
              {!date ? (
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    className="p-3 pointer-events-auto"
                  />
                </div>
              ) : !timeOpen ? (
                <div className="space-y-4">
                  <div className="p-3 bg-primary/15 rounded-lg border-2 border-primary/40">
                    <p className="text-xs text-primary font-medium uppercase tracking-wide">Date selected:</p>
                    <p className="font-bold text-lg text-foreground">{format(date, 'MM/dd/yyyy')} ({format(date, 'EEE')})</p>
                  </div>
                  <Button
                    className="w-full h-12 text-base"
                    onClick={() => setTimeOpen(true)}
                  >
                    <Clock className="w-5 h-5 mr-2" />
                    Select Time
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-center text-muted-foreground">
                    Select Time
                  </p>
                  
                  {/* Scroll Picker */}
                  <div className="flex gap-2 h-[180px] relative">
                    {/* Center highlight */}
                    <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-[44px] bg-primary/10 rounded-lg pointer-events-none z-0" />
                    
                    {/* Hour */}
                    <div 
                      ref={hourRef}
                      className="flex-1 overflow-y-auto hide-scrollbar snap-y snap-mandatory relative z-10"
                      style={{ scrollSnapType: 'y mandatory' }}
                      onScroll={() => handleScrollEnd(hourRef, hours, setHour, 'hour')}
                    >
                      <div className="h-[68px]" />
                      {hours.map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setHour(h)}
                          className={cn(
                            "w-full h-[44px] flex items-center justify-center text-lg font-medium transition-all snap-center touch-active",
                            hour === h ? "text-primary font-bold" : "text-muted-foreground"
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
                      onScroll={() => handleScrollEnd(minuteRef, minutes, setMinute, 'minute')}
                    >
                      <div className="h-[68px]" />
                      {minutes.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMinute(m)}
                          className={cn(
                            "w-full h-[44px] flex items-center justify-center text-lg font-medium transition-all snap-center touch-active",
                            minute === m ? "text-primary font-bold" : "text-muted-foreground"
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
                      onScroll={() => handleScrollEnd(periodRef, periods, (p: string) => setPeriod(p as 'AM' | 'PM'), 'period')}
                    >
                      <div className="h-[68px]" />
                      {periods.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPeriod(p as 'AM' | 'PM')}
                          className={cn(
                            "w-full h-[44px] flex items-center justify-center text-lg font-medium transition-all snap-center touch-active",
                            period === p ? "text-primary font-bold" : "text-muted-foreground"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                      <div className="h-[68px]" />
                    </div>
                  </div>
                  
                  {/* Selected summary */}
                  <div className="p-3 bg-primary/15 rounded-lg border-2 border-primary/40">
                    <p className="text-xs text-primary font-medium uppercase tracking-wide">Selected:</p>
                    <p className="font-bold text-lg text-foreground">{displayValue}</p>
                  </div>
                  
                  {/* Done button */}
                  <Button 
                    type="button"
                    className="w-full h-12 text-base touch-active"
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
            !date && "text-muted-foreground"
          )}
          onClick={() => setDateOpen(true)}
        >
          <CalendarIcon className="w-5 h-5 flex-shrink-0" />
          {date ? displayValue : 'Select date & time'}
        </Button>
      </div>
    );
  }
);

export default DateTimeInput;
