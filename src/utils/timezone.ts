export interface TimezoneInfo {
  timezone: string;
  currentTime: string;
}

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

export function convertDateTime(
  dateStr: string, // Format: MM/DD/YYYY HH:MM AM/PM
  fromTimezone: string,
  toTimezone: string
): { converted: string; dayDiff: number } | null {
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
    
    // Create a date string that we can parse
    const dateObj = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      hour,
      parseInt(minute, 10)
    );
    
    // Get the offset for the source timezone
    const sourceFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: fromTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    
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
    
    // Format: 12/31/2025 (Wed) at 12:00 PM
    const targetDate = new Date(parseInt(targetYear, 10), targetMonth - 1, targetDay);
    const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(targetDate);
    
    const converted = `${String(targetMonth).padStart(2, '0')}/${String(targetDay).padStart(2, '0')}/${targetYear} (${dayOfWeek}) at ${targetHour}:${targetMinute} ${targetAmPm}`;
    
    // Calculate day difference
    const sourceDayNum = parseInt(day, 10);
    const targetDayNum = targetDay;
    const sourceMonthNum = parseInt(month, 10);
    const targetMonthNum = targetMonth;
    const sourceYearNum = parseInt(year, 10);
    const targetYearNum = parseInt(targetYear, 10);
    
    // Create date objects for comparison (without time)
    const sourceCompare = new Date(sourceYearNum, sourceMonthNum - 1, sourceDayNum);
    const targetCompare = new Date(targetYearNum, targetMonthNum - 1, targetDayNum);
    
    const dayDiff = Math.round((targetCompare.getTime() - sourceCompare.getTime()) / (1000 * 60 * 60 * 24));
    
    return { converted, dayDiff };
  } catch (error) {
    console.error('Error converting datetime:', error);
    return null;
  }
}

export function formatDateTimeInput(value: string): string {
  // Remove all non-numeric characters except for existing formatting
  const digits = value.replace(/\D/g, '');
  
  let formatted = '';
  
  for (let i = 0; i < digits.length && i < 12; i++) {
    if (i === 2 || i === 4) {
      formatted += '/';
    } else if (i === 8) {
      formatted += ' ';
    } else if (i === 10) {
      formatted += ':';
    }
    formatted += digits[i];
  }
  
  // Add AM/PM suffix based on remaining input
  if (digits.length >= 12) {
    formatted += ' ';
    // Check if there's a 'P' or 'A' after the time
    const suffix = value.slice(-2).toUpperCase();
    if (suffix.includes('P')) {
      formatted += 'PM';
    } else {
      formatted += 'AM';
    }
  }
  
  return formatted;
}

export function parseAndFormatDateTime(input: string): string {
  // Handle the special case of typing the full string like \"12252024330PM\"
  const cleanInput = input.toUpperCase();
  
  // Extract digits
  const digits = cleanInput.replace(/[^0-9]/g, '');
  
  // Extract AM/PM indicator
  const hasAM = cleanInput.includes('A');
  const hasPM = cleanInput.includes('P');
  
  if (digits.length < 8) {
    // Not enough digits for a complete date
    let result = '';
    for (let i = 0; i < digits.length; i++) {
      if (i === 2 || i === 4) result += '/';
      result += digits[i];
    }
    return result;
  }
  
  // Parse date parts (MMDDYYYY)
  const month = digits.slice(0, 2);
  const day = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  
  // Parse time parts
  const timeDigits = digits.slice(8);
  let hour = '';
  let minute = '';
  
  if (timeDigits.length >= 1) {
    // Smart hour parsing - if first digit > 1, it's a single digit hour
    if (timeDigits.length === 1) {
      hour = timeDigits[0];
    } else if (timeDigits.length === 2) {
      // Could be \"12\" (hour only) or \"3:3\" style
      if (parseInt(timeDigits[0], 10) > 1) {
        hour = timeDigits[0];
        minute = timeDigits[1];
      } else {
        hour = timeDigits.slice(0, 2);
      }
    } else if (timeDigits.length === 3) {
      // \"330\" -> 3:30 or \"123\" -> 12:3
      if (parseInt(timeDigits[0], 10) > 1) {
        hour = timeDigits[0];
        minute = timeDigits.slice(1, 3);
      } else if (parseInt(timeDigits.slice(0, 2), 10) > 12) {
        hour = timeDigits[0];
        minute = timeDigits.slice(1, 3);
      } else {
        hour = timeDigits.slice(0, 2);
        minute = timeDigits[2];
      }
    } else {
      // 4+ digits
      if (parseInt(timeDigits[0], 10) > 1) {
        hour = timeDigits[0];
        minute = timeDigits.slice(1, 3);
      } else if (parseInt(timeDigits.slice(0, 2), 10) > 12) {
        hour = timeDigits[0];
        minute = timeDigits.slice(1, 3);
      } else {
        hour = timeDigits.slice(0, 2);
        minute = timeDigits.slice(2, 4);
      }
    }
  }
  
  // Build result
  let result = `${month}/${day}/${year}`;
  
  if (hour) {
    result += ` ${hour}`;
    if (minute) {
      result += `:${minute.padEnd(2, '0').slice(0, 2)}`;
    }
    
    if (hasPM) {
      result += ' PM';
    } else if (hasAM) {
      result += ' AM';
    }
  }
  
  return result;
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

export function formatDayOfWeek(dateStr: string): string {
  try {
    const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)$/i);
    if (!match) return dateStr;
    
    const [, month, day, year, hour, minute, ampm] = match;
    
    const date = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10)
    );
    
    const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
    
    // Format: 12/31/2025 (Wed) at 12:00 PM
    return `${month}/${day}/${year} (${dayOfWeek}) at ${hour}:${minute} ${ampm.toUpperCase()}`;
  } catch {
    return dateStr;
  }
}
