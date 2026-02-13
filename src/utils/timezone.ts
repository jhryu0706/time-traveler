export function getCurrentTimeInTimezone(timezone: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date());
  } catch {
    return '--:-- --';
  }
}

export interface ConvertedDateTime {
  month: string;
  day: string;
  year: string;
  dayOfWeek: string;
  hour: string;
  minute: string;
  ampm: string;
  dayDiff: number;
}

export function convertDateTime(
  dateStr: string, // Format: MM/DD/YYYY HH:MM AM/PM
  fromTimezone: string,
  toTimezone: string
): ConvertedDateTime | null {
  try {
    // Parse the input date string
    const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)$/i);
    if (!match) return null;

    const [, month, day, year, hourStr, minute, ampm] = match;
    let hour = parseInt(hourStr, 10);

    // Convert to 24-hour format
    if (ampm.toUpperCase() === 'PM' && hour !== 12) {
      hour += 12;
    } else if (ampm.toUpperCase() === 'AM' && hour === 12) {
      hour = 0;
    }

    const dateObj = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      hour,
      parseInt(minute, 10)
    );

    // Get the offset for the target timezone
    const targetFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: toTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    // Calculate the UTC time from the source timezone
    const sourceDate = new Date(dateObj.toLocaleString('en-US', { timeZone: fromTimezone }));
    const utcDate = new Date(dateObj.getTime() + (dateObj.getTime() - sourceDate.getTime()));

    // Format in target timezone
    const targetParts = targetFormatter.formatToParts(utcDate);
    const targetDateParts: Record<string, string> = {};
    targetParts.forEach(part => {
      targetDateParts[part.type] = part.value;
    });

    const targetYear = targetDateParts.year;
    const targetMonth = parseInt(targetDateParts.month, 10);
    const targetDay = parseInt(targetDateParts.day, 10);
    let targetHour = parseInt(targetDateParts.hour, 10);
    const targetMinute = targetDateParts.minute;

    // Convert to 12-hour format
    const targetAmPm = targetHour >= 12 ? 'PM' : 'AM';
    if (targetHour > 12) targetHour -= 12;
    if (targetHour === 0) targetHour = 12;

    const targetDate = new Date(parseInt(targetYear, 10), targetMonth - 1, targetDay);
    const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(targetDate);

    // Calculate day difference
    const sourceCompare = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    const targetCompare = new Date(parseInt(targetYear, 10), targetMonth - 1, targetDay);
    const dayDiff = Math.round((targetCompare.getTime() - sourceCompare.getTime()) / (1000 * 60 * 60 * 24));

    return {
      month: String(targetMonth).padStart(2, '0'),
      day: String(targetDay).padStart(2, '0'),
      year: targetYear,
      dayOfWeek,
      hour: String(targetHour),
      minute: targetMinute,
      ampm: targetAmPm,
      dayDiff,
    };
  } catch (error) {
    console.error('Error converting datetime:', error);
    return null;
  }
}

export function isValidDateTime(value: string): boolean {
  const pattern = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)$/i;
  const match = value.match(pattern);
  
  if (!match) return false;
  
  const [, month, day, year, hour, minute] = match;
  const monthNum = parseInt(month, 10);
  const dayNum = parseInt(day, 10);
  const yearNum = parseInt(year, 10);
  const hourNum = parseInt(hour, 10);
  const minuteNum = parseInt(minute, 10);
  
  if (monthNum < 1 || monthNum > 12) return false;
  if (dayNum < 1 || dayNum > 31) return false;
  if (yearNum < 1900 || yearNum > 2100) return false;
  if (hourNum < 1 || hourNum > 12) return false;
  if (minuteNum < 0 || minuteNum > 59) return false;
  
  return true;
}

