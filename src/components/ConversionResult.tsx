import React from 'react';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversionResultProps {
  result: string | null;
  dayDiff: number;
  fromLocation: string;
  toLocation: string;
}

export default function ConversionResult({
  result,
  dayDiff,
  fromLocation,
  toLocation,
}: ConversionResultProps) {
  if (!result) {
    return (
      <div className="py-8 px-4 bg-muted/30 rounded-xl border border-dashed border-border text-center">
        <Clock className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-muted-foreground text-base">
          Enter a date/time and select both locations
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-primary/40 bg-primary/15 animate-slide-up">
      <div className="p-4">
        {/* Output Header */}
        <p className="text-xs text-primary font-medium uppercase tracking-wide mb-3">
          Converted Time
        </p>

        {/* Location flow */}
        <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
          <span className="truncate flex-1">{fromLocation}</span>
          <ArrowRight className="w-4 h-4 flex-shrink-0 text-primary" />
          <span className="truncate flex-1 text-right">{toLocation}</span>
        </div>

        {/* Result - matches DateTimeInput selected summary styling */}
        <div className="space-y-2">
          <p className="font-bold text-lg text-foreground">
            {result}
          </p>
          
          {/* Day difference indicator */}
          {dayDiff !== 0 && (
            <p className={cn(
              "text-sm",
              dayDiff > 0 ? "text-accent" : "text-muted-foreground"
            )}>
              {dayDiff > 0 
                ? `${dayDiff} day${dayDiff > 1 ? 's' : ''} later`
                : `${Math.abs(dayDiff)} day${Math.abs(dayDiff) > 1 ? 's' : ''} earlier`
              }
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
