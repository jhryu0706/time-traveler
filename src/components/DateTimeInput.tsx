import React, { useState, useRef, useEffect, forwardRef, useCallback } from 'react';
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
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 20 }, (_, i) => currentYear - 5 + i);
const hours = Array.from({ length: 12 }, (_, i) => i + 1);
const minutes = Array.from({ length: 60 }, (_, i) => i);
const periods = ['AM', 'PM'];

const DateTimeInput = forwardRef<HTMLDivElement, DateTimeInputProps>(
  function DateTimeInput({ value, onChange, isValid, isOpen: externalOpen, onOpenChange }, ref) {
    // Initialize time from current time
    const now = new Date();
    const currentHour = now.getHours();
    const [month, setMonth] = useState(now.getMonth());
    const [day, setDay] = useState(now.getDate());
    const [year, setYear] = useState(now.getFullYear());
    const [hour, setHour] = useState(currentHour % 12 || 12);
    const [minute, setMinute] = useState(now.getMinutes());
    const [period, setPeriod] = useState<'AM' | 'PM'>(currentHour >= 12 ? 'PM' : 'AM');
    const [step, setStep] = useState<'date' | 'time'>('time');
    
    const monthRef = useRef<HTMLDivElement>(null);
    const dayRef = useRef<HTMLDivElement>(null);
    const yearRef = useRef<HTMLDivElement>(null);
    const hourRef = useRef<HTMLDivElement>(null);
    const minuteRef = useRef<HTMLDivElement>(null);
    const periodRef = useRef<HTMLDivElement>(null);
    
    const scrollTimeoutRef = useRef<{ [key: string]: number }>({});

    // Update parent value when any component changes
    useEffect(() => {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const hourStr = String(hour);
      const minuteStr = String(minute).padStart(2, '0');
      const formatted = `${monthStr}/${dayStr}/${year} ${hourStr}:${minuteStr} ${period}`;
      onChange(formatted);
    }, [month, day, year, hour, minute, period, onChange]);

    // Default to time step when sheet opens
    useEffect(() => {
      if (externalOpen) {
        setStep('time');
      }
    }, [externalOpen]);

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
      items: (number | string)[],
      setValue: (val: any) => void,
      timeoutKey: string
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
          
          scrollRef.current.scrollTo({
            top: clampedIndex * itemHeight,
            behavior: 'smooth'
          });
          
          setValue(items[clampedIndex]);
        }
      }, 100);
    }, []);

    // Scroll to initial positions when step changes
    useEffect(() => {
      if (step === 'date') {
        setTimeout(() => {
          scrollToSelected(monthRef, month);
          scrollToSelected(dayRef, day - 1);
          scrollToSelected(yearRef, years.indexOf(year));
        }, 100);
      } else if (step === 'time') {
        setTimeout(() => {
          scrollToSelected(hourRef, hour - 1);
          scrollToSelected(minuteRef, minute);
          scrollToSelected(periodRef, period === 'AM' ? 0 : 1);
        }, 100);
      }
    }, [step, month, day, year, hour, minute, period]);

    const getDayOfWeek = () => {
      const date = new Date(year, month, day);
      return format(date, 'EEE');
    };

    const displayTime = `${hour}:${String(minute).padStart(2, '0')} ${period}`;
    const displayDate = `${String(month + 1).padStart(2, '0')}/${String(day).padStart(2, '0')}/${year} (${getDayOfWeek()})`;

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
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Selected:</p>
                <p className="text-base font-medium text-primary">{displayTime} · {displayDate}</p>
              </div>
              <button
                onClick={() => setStep(step === 'date' ? 'time' : 'date')}
                className="text-sm text-muted-foreground underline underline-offset-2 touch-active"
              >
                {step === 'date' ? 'Edit Time' : 'Edit Date'}
              </button>
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
                      onScroll={() => handleScrollEnd(monthRef, Array.from({ length: 12 }, (_, i) => i), setMonth, 'month')}
                    >
                      <div className="h-[68px]" />
                      {months.map((m, index) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMonth(index)}
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
                      onScroll={() => handleScrollEnd(dayRef, days, setDay, 'day')}
                    >
                      <div className="h-[68px]" />
                      {days.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDay(d)}
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
                      onScroll={() => handleScrollEnd(yearRef, years, setYear, 'year')}
                    >
                      <div className="h-[68px]" />
                      {years.map((y) => (
                        <button
                          key={y}
                          type="button"
                          onClick={() => setYear(y)}
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
