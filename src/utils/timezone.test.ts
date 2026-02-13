import { describe, it, expect } from "vitest";
import { convertDateTime } from "./timezone";

describe("convertDateTime", () => {
  it("should convert time from local timezone to Abu Dhabi (UTC+4)", () => {
    // Test: If it's 12:00 PM in New York (EST, UTC-5), what time is it in Abu Dhabi (UTC+4)?
    // Difference: 9 hours ahead
    // Expected: 9:00 PM same day
    const result = convertDateTime(
      "02/02/2026 12:00 PM",
      "America/New_York", // UTC-5
      "Asia/Dubai" // UTC+4 (Abu Dhabi uses Dubai timezone)
    );

    console.log("Conversion result:", result);

    expect(result).not.toBeNull();
    expect(result?.hour).toBe("9");
    expect(result?.minute).toBe("00");
    expect(result?.ampm).toBe("PM");
  });

  it("should convert time correctly when crossing day boundary", () => {
    // Test: If it's 10:00 PM in New York, what time is it in Abu Dhabi?
    // 10 PM + 9 hours = 7 AM next day
    const result = convertDateTime(
      "02/02/2026 10:00 PM",
      "America/New_York",
      "Asia/Dubai"
    );

    console.log("Day boundary result:", result);

    expect(result).not.toBeNull();
    expect(result?.hour).toBe("7");
    expect(result?.minute).toBe("00");
    expect(result?.ampm).toBe("AM");
    expect(result?.dayDiff).toBe(1); // Next day
  });

  it("should handle conversion from browser local time to Abu Dhabi", () => {
    const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const result = convertDateTime(
      "02/02/2026 2:00 PM",
      localTimezone,
      "Asia/Dubai"
    );

    console.log(`Conversion from ${localTimezone} to Abu Dhabi:`, result);

    expect(result).not.toBeNull();
    // The exact time depends on the test runner's timezone
  });
});
