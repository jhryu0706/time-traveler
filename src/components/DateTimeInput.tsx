import React, { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateTimeInputProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
}

export default function DateTimeInput({ value, onChange, isValid }: DateTimeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, arrows
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    
    if (allowedKeys.includes(e.key)) {
      return;
    }

    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
      return;
    }

    // Only allow digits and A/P/M for AM/PM
    if (!/^[0-9apmAPM]$/.test(e.key)) {
      e.preventDefault();
      return;
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatInput(input);
    onChange(formatted);
  };

  const formatInput = (input: string): string => {
    const upper = input.toUpperCase();
    
    // Extract only digits
    const digits = upper.replace(/[^0-9]/g, '');
    
    // Extract AM/PM indicator
    const hasA = upper.includes('A');
    const hasP = upper.includes('P');
    
    let result = '';
    
    // Date part: MM/DD/YYYY (8 digits)
    for (let i = 0; i < Math.min(digits.length, 8); i++) {
      if (i === 2 || i === 4) {
        result += '/';
      }
      result += digits[i];
    }
    
    // Time part (after 8 digits)
    if (digits.length > 8) {
      result += ' ';
      const timeDigits = digits.slice(8);
      
      let hourStr = '';
      let minuteStr = '';
      
      if (timeDigits.length >= 1) {
        const firstDigit = parseInt(timeDigits[0], 10);
        
        if (firstDigit > 1) {
          hourStr = timeDigits[0];
          minuteStr = timeDigits.slice(1, 3);
        } else if (timeDigits.length >= 2) {
          const firstTwo = parseInt(timeDigits.slice(0, 2), 10);
          if (firstTwo > 12) {
            hourStr = timeDigits[0];
            minuteStr = timeDigits.slice(1, 3);
          } else {
            hourStr = timeDigits.slice(0, 2);
            minuteStr = timeDigits.slice(2, 4);
          }
        } else {
          hourStr = timeDigits[0];
        }
      }
      
      result += hourStr;
      if (minuteStr.length > 0) {
        result += ':' + minuteStr.padEnd(2, minuteStr.length === 1 ? '' : '0').slice(0, 2);
      }
      
      // Add AM/PM
      if (hasP) {
        result += ' PM';
      } else if (hasA) {
        result += ' AM';
      }
    }
    
    return result;
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-muted-foreground mb-2">
        Date & Time
      </label>
      
      <div
        className={cn(
          "relative flex items-center gap-3 px-4 py-3.5 min-h-[52px] bg-secondary/50 border rounded-xl transition-all duration-200",
          isFocused && "ring-2 ring-primary/30 border-primary/30",
          !isValid && value.length > 0 ? "border-destructive/50" : "border-border"
        )}
      >
        <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        
        <input
          ref={inputRef}
          type="text"
          inputMode="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="MM/DD/YYYY HH:MM AM/PM"
          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-mono text-base tracking-wide"
          maxLength={22}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        
        <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      </div>
      
      <p className="mt-2 text-sm text-muted-foreground">
        Type digits + A/P (e.g., 12252024330P)
      </p>
    </div>
  );
}
