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
      <div className="p-8 bg-muted/30 rounded-xl border border-dashed border-border text-center">
        <Clock className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
        <p className="text-muted-foreground">
          Enter a date/time and select both locations to see the conversion
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card animate-slide-up">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
      
      <div className="relative p-6">
        {/* Location flow */}
        <div className="flex items-center gap-3 mb-6 text-sm text-muted-foreground">
          <span className="truncate max-w-[120px]">{fromLocation}</span>
          <ArrowRight className="w-4 h-4 flex-shrink-0 text-primary" />
          <span className="truncate max-w-[120px]">{toLocation}</span>
        </div>

        {/* Result */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="text-2xl font-semibold text-foreground tracking-wide font-mono">
              {result}
            </span>
          </div>
          
          {/* Day difference indicator */}
          {dayDiff !== 0 && (
            <p className={cn(
              "text-sm pl-8",
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
