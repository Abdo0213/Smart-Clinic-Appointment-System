# Doctor Feature — Research

## Schedule & Availability UI Patterns

### Common Patterns

1. **Weekly Calendar Grid** — A 7-column layout where each column represents a day. Working hours run vertically as a timeline. The doctor clicks and drags to mark available blocks. Used by Calendly, Zocdoc, and most SaaS scheduling tools. Best for configuring recurring weekly templates.

2. **Date-Specific Form** — A form tied to a specific date where the doctor sets startTime, endTime, slotDuration, and breaks. Simpler to implement and maps directly to the `CreateScheduleRequest` model. Best for per-date configuration as required by this feature.

3. **Hybrid Approach** — A weekly template that can be overridden per date. The doctor sets a default weekly schedule, then clicks individual dates to make exceptions. More complex but offers the best UX for doctors with mostly consistent schedules.

**Recommendation**: Start with the Date-Specific Form (Pattern 2) since the API contract is per-date. A weekly template can be added later as a convenience layer that calls the same per-date endpoint for each day of the week.

---

## Calendar Component Integration

### Evaluated Libraries

| Library | Size | React Support | Date Selection | Weekly View | License |
|---|---|---|---|---|---|
| react-day-picker | ~12KB gzip | Native | Yes | No | MIT |
| @fullcalendar/react | ~60KB gzip | Native | Yes | Yes | MIT |
| react-calendar | ~8KB gzip | Native | Yes | No | MIT |
| date-fns (utilities only) | ~13KB gzip (tree-shakeable) | N/A | N/A | N/A | MIT |

### Recommendation

- **Date picker for schedule form**: Use `react-day-picker` for the date selection in the schedule form. It is lightweight, accessible, and supports disabled dates (e.g., past dates). It pairs well with `date-fns` for date formatting and manipulation.
- **Slot display**: Custom slot grid built with Tailwind CSS. No calendar library needed — slots are a simple list of time intervals displayed as a grid of clickable/unClickable blocks.
- **Avoid @fullcalendar/react**: While powerful, it is overkill for this feature. The schedule configuration is form-based, not drag-and-drop on a calendar canvas. It can be reconsidered if a visual weekly calendar view is needed later.

### Integration Pattern

```tsx
import { DayPicker } from "react-day-picker";
import { format, isBefore, startOfDay } from "date-fns";

function ScheduleDatePicker({ value, onChange }) {
  return (
    <DayPicker
      mode="single"
      selected={value}
      onSelect={onChange}
      disabled={{ before: startOfDay(new Date()) }}
      formatters={{ formatDay: (date) => format(date, "d") }}
    />
  );
}
```

---

## Slot Generation Algorithm

The server generates slots, but a client-side preview utility helps doctors see slot breakdowns before saving.

### Algorithm

```
Input: schedule { startTime, endTime, slotDuration, breaks[] }
Output: Slot[]

1. Convert startTime and endTime to minutes-since-midnight.
2. Create a sorted list of unavailable intervals from breaks[].
3. Walk from startMinutes to endMinutes in steps of slotDuration.
4. For each candidate slot [current, current + slotDuration]:
   a. Check if the slot overlaps any break interval.
   b. If no overlap, add { startTime, endTime, isAvailable: true }.
5. Return the slot list.
```

### Overlap Detection

Two intervals [a1, a2] and [b1, b2] overlap if `a1 < b2 && b1 < a2`.

### Edge Cases

- **Break exactly at boundary**: A break from 12:00–13:00 means the last pre-break slot ends at 12:00 and the first post-break slot starts at 13:00. No overlap.
- **Slot extends past endTime**: If the last slot would end after endTime, it is discarded (partial slot not created).
- **Slot spans a break**: If a slot [11:45, 12:15] overlaps a break [12:00, 13:00], the entire slot is marked unavailable (not split).

### Client-Side Implementation

```typescript
function generateSlots(schedule: {
  startTime: string;
  endTime: string;
  slotDuration: number;
  breaks: ScheduleBreak[];
}): Slot[] {
  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const toTime = (m: number) =>
    `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

  const start = toMinutes(schedule.startTime);
  const end = toMinutes(schedule.endTime);
  const duration = schedule.slotDuration;
  const breakIntervals = schedule.breaks.map((b) => ({
    start: toMinutes(b.breakStart),
    end: toMinutes(b.breakEnd),
  }));

  const overlapsBreak = (slotStart: number, slotEnd: number) =>
    breakIntervals.some(
      (brk) => slotStart < brk.end && brk.start < slotEnd
    );

  const slots: Slot[] = [];
  for (let current = start; current + duration <= end; current += duration) {
    const slotEnd = current + duration;
    if (!overlapsBreak(current, slotEnd)) {
      slots.push({
        startTime: toTime(current),
        endTime: toTime(slotEnd),
        isAvailable: true,
      });
    }
  }
  return slots;
}
```

---

## Break Entry UX Patterns

### Pattern 1: Dynamic Field List (Recommended)

A list of break rows with "Add Break" / "Remove" buttons. Each row has two time inputs (breakStart, breakEnd). This maps directly to the `ScheduleBreak[]` array and is simple to validate.

### Pattern 2: Timeline Slider

A visual timeline of the working day where the doctor drags to select break regions. More intuitive but significantly more complex to implement. Better suited for a later iteration.

**Recommendation**: Pattern 1. Use React Hook Form's `useFieldArray` for managing the dynamic break list. Validate each break row independently and check for inter-break overlaps on submit.

---

## Accessibility Considerations

- Time inputs should support keyboard entry and be labeled with `<label>` elements.
- The slot grid should use `role="list"` and `role="listitem"` with `aria-label` describing the time range and availability.
- Filter controls should announce changes to screen readers via `aria-live` regions.
- Color alone should not indicate availability; pair with text/icon indicators.
