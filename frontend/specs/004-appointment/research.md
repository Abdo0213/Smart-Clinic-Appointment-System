# Appointment Feature — Research

## 1. Booking Wizard UX Patterns

### Multi-Step Form Patterns

Multi-step wizards break complex flows into digestible steps, reducing cognitive load and improving completion rates. Key patterns:

- **Progress Indicator**: A visual step bar (1→2→3) showing current position. Users understand how far along they are and how many steps remain. Best practice: allow clicking completed steps to go back.
- **Step Validation**: Each step validates independently before allowing progression. Invalid fields are highlighted inline. The "Next" button is disabled until the step is valid.
- **Linear vs. Non-Linear**: Linear wizards enforce sequential completion. Non-linear allow skipping. Booking appointments should be linear — slot depends on doctor, confirmation depends on both.
- **Mobile Considerations**: On mobile, use full-screen steps rather than side-by-side layouts. Swipe gestures for back/next improve UX but must not bypass validation.

### Recommended Pattern for This Feature

```
Step 1: Select Doctor     → Validates: doctorId selected
Step 2: Select Date/Slot  → Validates: slotDate, slotStart, slotEnd selected
Step 3: Review & Confirm  → Validates: all fields present, calls mutation
```

The wizard should persist state across navigation (e.g., if user accidentally clicks away and comes back). Zustand store survives component unmounts, making it ideal here. URL-based step state (`?step=2`) is an alternative but adds complexity with deep-linking edge cases.

### Key References

- NNGroup: "User-Interface Guidelines for Wizard Dialogs" — recommends 3-5 steps max
- Material Design: "Steppers" — linear stepper pattern
- Shopify Polaris: Uses contextual save bars for multi-step forms

---

## 2. Appointment State Machine

### Finite State Machine Design

The appointment lifecycle is best modeled as a finite state machine (FSM). This prevents invalid transitions at the application level before hitting the API.

```
States: BOOKED, ARRIVED, COMPLETED, CANCELLED, NO_SHOW

Transitions:
  BOOKED   → ARRIVED     (patient checks in)
  BOOKED   → CANCELLED   (patient/receptionist cancels before visit)
  ARRIVED  → COMPLETED   (doctor finishes consultation)
  ARRIVED  → CANCELLED   (cancelled after arrival, e.g., emergency)
  ARRIVED  → NO_SHOW     (patient left without being seen)

Terminal: COMPLETED, CANCELLED, NO_SHOW (no outgoing transitions)
```

### Implementation Approach

```typescript
const VALID_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  BOOKED: ['ARRIVED', 'CANCELLED'],
  ARRIVED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

function isValidTransition(from: AppointmentStatus, to: AppointmentStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}
```

This lookup-table approach is:
- **O(1)** for validation
- **Self-documenting** — the map is the source of truth
- **Easy to extend** — add new transitions without refactoring logic
- **Testable** — pure function, trivial unit tests

The UI should filter available actions based on valid transitions. For example, a COMPLETED appointment should not show a "Cancel" button. The dropdown in `StatusUpdateDropdown` should only offer valid next statuses.

### Why Not XState?

For this feature, the state machine is simple (5 states, 5 transitions). XState adds significant bundle size (~20KB) and cognitive overhead for marginal benefit. A plain transition map is sufficient. If the state machine grows (e.g., adding RESCHEDULED as a first-class state, or adding timers for auto-NO_SHOW), migrating to XState should be reconsidered.

---

## 3. Conflict Handling (Slot Already Booked)

### Scenario

Two users attempt to book the same slot simultaneously. The second request receives a 409 Conflict response.

### Frontend Strategies

1. **Optimistic UI + Rollback**: Show the booking as successful immediately. On 409 error, roll back the UI and show the conflict message. This is fast but can confuse users if rollbacks are frequent.

2. **Pessimistic UI**: Wait for the server response before showing success. Simpler and more predictable. Recommended for this feature since booking is infrequent enough that the delay is acceptable.

3. **Slot Locking**: Before the booking mutation, call a "lock slot" endpoint that temporarily reserves the slot. This is complex (requires timeout/unlock logic) and is out of scope for this phase.

### Recommended Approach

Use pessimistic UI for booking (show loading spinner on the Confirm button). On 409 Conflict:

1. Display a toast: "This slot was just booked by someone else."
2. Offer two actions in the toast:
   - **Choose another slot** → navigates back to Step 2
   - **Join waitlist** → calls the waitlist endpoint
3. Invalidate the available slots query so the slot grid reflects the new availability.

### Slot Refresh Strategy

Available slots should be re-fetched when:
- The user enters Step 2 (doctor selected)
- After a failed booking attempt (conflict)
- Not on a timer (excessive API calls for data that rarely changes)

---

## 4. Multi-Step Forms with Zustand

### Why Zustand Over Alternatives

| Option | Pros | Cons |
|---|---|---|
| **URL params** | Deep-linkable, survives refresh | Complex serialization, limited data types, exposed in URL |
| **React Context** | Built-in, no deps | Re-renders entire subtree, verbose boilerplate |
| **useReducer** | No deps, predictable | Prop drilling, no persistence across navigation |
| **Zustand** | Minimal API, persists across nav, selective re-renders, no boilerplate | Extra dependency (already in project) |

Zustand is the best fit because:
- The wizard state (step, doctor, slot) must survive if the user navigates away and returns.
- Selective subscriptions prevent unnecessary re-renders (e.g., `useBookingStore(state => state.step)` only re-renders on step change).
- The `reset()` action cleanly clears all state on success or explicit cancel.
- No provider wrapping needed — the store is a standalone module.

### Store Design

```typescript
import { create } from 'zustand';

interface BookingState {
  step: 1 | 2 | 3;
  doctorId: string | null;
  slotDate: string | null;
  slotStart: string | null;
  slotEnd: string | null;
  patientId: string | null;
}

interface BookingActions {
  setStep: (step: 1 | 2 | 3) => void;
  setDoctor: (doctorId: string) => void;
  setSlot: (date: string, start: string, end: string) => void;
  setPatient: (patientId: string) => void;
  reset: () => void;
}

const initialState: BookingState = {
  step: 1,
  doctorId: null,
  slotDate: null,
  slotStart: null,
  slotEnd: null,
  patientId: null,
};

export const useBookingStore = create<BookingState & BookingActions>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setDoctor: (doctorId) => set({ doctorId, step: 2 }),
  setSlot: (slotDate, slotStart, slotEnd) => set({ slotDate, slotStart, slotEnd, step: 3 }),
  setPatient: (patientId) => set({ patientId }),
  reset: () => set(initialState),
}));
```

### Integration with React Query

The store holds the input parameters; the mutation is triggered only on the final step:

```typescript
function StepReviewConfirm() {
  const { doctorId, slotDate, slotStart, slotEnd, patientId, reset } = useBookingStore();
  const bookMutation = useBookAppointment();

  const handleConfirm = () => {
    bookMutation.mutate(
      { patientId: patientId!, doctorId: doctorId!, slotDate: slotDate!, slotStart: slotStart!, slotEnd: slotEnd! },
      { onSuccess: () => reset() }
    );
  };

  // ...
}
```

### Persist Middleware (Optional)

If the wizard should survive a full page refresh, add Zustand's `persist` middleware with `sessionStorage` (not `localStorage` — booking state should not persist across browser sessions):

```typescript
import { persist } from 'zustand/middleware';

export const useBookingStore = create(
  persist<BookingState & BookingActions>(
    (set) => ({ /* ... */ }),
    { name: 'booking-wizard', storage: createJSONStorage(() => sessionStorage) }
  )
);
```

This is optional and can be added in Phase 7 if user testing shows accidental navigation loss is a problem.

---

## 5. Pagination Pattern

### Cursor vs. Offset Pagination

| Aspect | Offset (current API) | Cursor |
|---|---|---|
| Simplicity | Simple page numbers | Requires cursor token |
| Jump to page | Yes | No (sequential only) |
| Consistency | May see duplicates on data change | Consistent |
| Fit for UI | Standard page controls | Infinite scroll |

The API uses offset pagination (`page` + `size`), which maps well to standard page controls. The UI should:

1. Show page numbers with previous/next buttons
2. Display "Showing X–Y of Z results"
3. Store current page in URL search params for shareable links
4. Reset to page 0 when filters change

---

## 6. Real-Time Updates for Doctor Queue

### Polling vs. WebSocket vs. SSE

| Approach | Complexity | Latency | Server Load |
|---|---|---|---|
| **Polling** (30s) | Low | Up to 30s | Moderate |
| **WebSocket** | High | Real-time | Low (after connect) |
| **SSE** | Medium | Near real-time | Low |

For Phase 1, **polling at 30-second intervals** is the pragmatic choice:

- No server infrastructure changes needed
- React Query's `refetchInterval` makes this trivial
- 30s is acceptable latency for a clinical queue (patients don't appear every second)
- Automatic pause when tab is not focused (React Query default)

```typescript
export function useDoctorQueue(doctorId: string, date: string) {
  return useQuery({
    queryKey: ['appointments', 'queue', doctorId, date],
    queryFn: () => getAppointments({ doctorId, date, size: 100 }),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}
```

WebSocket integration can be added in a future phase as a dedicated real-time layer.

---

## 7. Accessibility Considerations

- **Wizard steps**: Use `role="tablist"` for step indicators, `aria-selected` for active step
- **Status badges**: Use `aria-label` with descriptive text (not just color)
- **Date/slot picker**: Ensure keyboard navigation works for calendar grid
- **Filter controls**: Associate labels with inputs, announce filter changes to screen readers
- **Dialogs**: Focus trap, `aria-modal="true"`, return focus on close
- **Live queue updates**: Use `aria-live="polite"` region for status changes
