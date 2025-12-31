import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';

interface DateTimeInputProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
}

const hours = Array.from({ length: 12 }, (_, i) => i + 1);
const minutes = Array.from({ length: 60 }, (_, i) => i);
const periods = ['AM', 'PM'];

const DateTimeInput = forwardRef<HTMLDivElement, DateTimeInputProps>(
  function DateTimeInput({ value, onChange, isValid }, ref) {
    // Initialize blank - no default date/time
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [hour, setHour] = useState(12);
    const [minute, setMinute] = useState(0);
    const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
    const [dateOpen, setDateOpen] = useState(false);
    const [timeOpen, setTimeOpen] = useState(false);
    
    const hourRef = useRef<HTMLDivElement>(null);
    const minuteRef = useRef<HTMLDivElement>(null);
    const periodRef = useRef<HTMLDivElement>(null);

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

    const displayValue = date 
      ? `${format(date, 'EEE, MMM d, yyyy')} at ${hour}:${String(minute).padStart(2, '0')} ${period}`
      : '';

    return (
      <div ref={ref} className="space-y-3">
        <label className="block text-sm font-medium text-muted-foreground">
          Date & Time
        </label>
        
        {/* Date Picker */}
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-[52px] justify-start text-left font-normal px-4 gap-3 touch-active",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="w-5 h-5 flex-shrink-0" />
              {date ? format(date, 'EEEE, MMMM d, yyyy') : 'Select date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-popover" align="center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        {/* Time Picker */}
        {date && (
          <Popover open={timeOpen} onOpenChange={setTimeOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-[52px] justify-start text-left font-normal px-4 gap-3 touch-active animate-fade-in"
                )}
              >
                <Clock className="w-5 h-5 flex-shrink-0" />
                {`${hour}:${String(minute).padStart(2, '0')} ${period}`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0 bg-popover" align="center">
              <div className="p-4">
                <p className="text-sm font-medium text-center text-muted-foreground mb-4">
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
                  >
                    <div className="h-[68px]" /> {/* Top spacer */}
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
                    <div className="h-[68px]" /> {/* Bottom spacer */}
                  </div>
                  
                  {/* Separator */}
                  <div className="flex items-center justify-center text-xl font-bold text-muted-foreground">:</div>
                  
                  {/* Minute */}
                  <div 
                    ref={minuteRef}
                    className="flex-1 overflow-y-auto hide-scrollbar snap-y snap-mandatory relative z-10"
                    style={{ scrollSnapType: 'y mandatory' }}
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
                
                {/* Done button */}
                <Button 
                  type="button"
                  className="w-full mt-4 h-12 text-base touch-active"
                  onClick={() => setTimeOpen(false)}
                >
                  Done
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Selected summary */}
        {date && (
          <div className="p-3 bg-primary/15 rounded-lg border-2 border-primary/40 animate-fade-in">
            <p className="text-xs text-primary font-medium uppercase tracking-wide">Selected:</p>
            <p className="font-bold text-lg text-foreground">{displayValue}</p>
          </div>
        )}
      </div>
    );
  }
);

export default DateTimeInput;
