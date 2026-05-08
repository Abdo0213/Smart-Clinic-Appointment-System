# Admin Feature — Research Notes

## Feature Branch: `008-admin`

---

## 1. Dashboard Chart Libraries

### Option A: Recharts (Recommended)

**Pros:**
- Most popular React charting library (24k+ GitHub stars)
- Declarative, component-based API that aligns with React patterns
- Native TypeScript support
- Lightweight — tree-shakeable, only import what you need
- Excellent for the chart types needed: BarChart (revenue), LineChart (no-show trend), PieChart (appointment status), horizontal BarChart (doctor utilization)
- Strong community support and extensive documentation
- Works well with Shadcn UI styling — charts are SVG-based and can be styled with Tailwind classes
- Responsive container component (`<ResponsiveContainer>`) handles resize automatically

**Cons:**
- Animation performance can degrade with very large datasets (>10k points)
- Limited interactivity out-of-the-box (tooltips are basic, no built-in zoom/brush)
- No server-side rendering for charts (client-only)

**Integration with Shadcn:**
```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/components/card";

<Card>
  <CardHeader><CardTitle>Revenue</CardTitle></CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={report.records}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="billed" fill="hsl(var(--primary))" />
        <Bar dataKey="collected" fill="hsl(var(--chart-2))" />
      </BarChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
```

**Shadcn Charts:**
- Shadcn UI now includes a `charts` module built on top of Recharts
- Provides pre-styled chart components that match Shadcn theme tokens
- Uses CSS variables (`--chart-1` through `--chart-5`) for consistent color palette
- Recommended approach: use Shadcn chart wrappers for consistent theming

### Option B: Nivo (@nivo/bar, @nivo/line, @nivo/pie)

**Pros:**
- Beautiful defaults and rich theming API
- Server-side rendering support
- Built-in motion/transitions
- Extensive chart types including heatmaps and radar charts
- Good accessibility with SVG-based rendering

**Cons:**
- Larger bundle size (~40KB per chart type)
- Less popular than Recharts (fewer community resources)
- API is more configuration-heavy (less declarative)
- No native Shadcn integration — requires custom theming to match
- Separate packages for each chart type increases dependency count

**Decision: Recharts via Shadcn Charts**
- Recharts is the better fit due to Shadcn's built-in chart support, lighter bundle, and more familiar React component API
- Use Shadcn chart wrappers (`ChartContainer`, `ChartTooltip`, `ChartLegend`) for consistent theming
- Import individual Recharts components for customization

---

## 2. CSV Download Patterns

### Pattern A: Server-side CSV generation (Current API design)

The API provides `GET /admin/reports/export?reportType=&from=&to=` which returns a CSV blob.

**Implementation:**

```typescript
// src/shared/lib/downloadCsv.ts
export function downloadCsv(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// src/features/admin-reports/api/exportReport.ts
export async function exportReport(params: ExportQueryParams): Promise<void> {
  const response = await apiClient.get(ADMIN.REPORTS_EXPORT, {
    params: {
      reportType: params.reportType,
      from: params.from,
      to: params.to,
    },
    responseType: "blob",
  });
  downloadCsv(response.data, `${params.reportType}-report.csv`);
}
```

**Key considerations:**
- Must use `responseType: "blob"` in Axios config — otherwise binary data is corrupted
- `URL.revokeObjectURL()` should be called after download to prevent memory leaks
- Append `<a>` element to DOM before clicking for Firefox compatibility
- Remove `<a>` element after click to clean up DOM

### Pattern B: Client-side CSV generation (Fallback)

If the export endpoint is unavailable or for client-only export:

```typescript
import { unparse } from "papaparse";

export function generateCsv<T extends Record<string, unknown>>(
  data: T[],
  filename: string
): void {
  const csv = unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadCsv(blob, filename);
}
```

**Decision: Use Pattern A (server-side)** as the primary approach since the API provides the export endpoint. Pattern B is a fallback option if server export is unavailable or slow.

---

## 3. Audit Log Table UX

### Table Design Considerations

**Column layout:**

| Column | Width | Alignment | Notes |
|--------|-------|-----------|-------|
| Timestamp | Fixed ~180px | Left | Formatted as relative time ("2 hours ago") with full date in tooltip |
| Actor | Fixed ~200px | Left | Email address, clickable to filter by actor |
| Action | Fixed ~100px | Center | Colored badge: VIEW=blue, CREATE=green, UPDATE=amber, DELETE=red, LOGIN=purple |
| Resource | Fixed ~120px | Center | Badge with resource type |
| Details | Flex remaining | Left | Truncated with expand-on-click |

**Pagination:**
- Default page size: 20 rows
- Page size options: 10, 20, 50, 100
- Server-side pagination (data can be large)
- Show "Showing X-Y of Z entries" summary
- First/Prev/Next/Last navigation buttons

**Filtering (Future enhancement):**
- Filter by actor, action type, resource type
- Date range filter for timestamp
- Full-text search on details field
- Not in MVP — but design the table header area to accommodate future filter chips

**Sorting:**
- Default sort: timestamp DESC (most recent first)
- Allow sorting by actor, action, resource
- Server-side sort via query params (if supported)

**Empty state:**
- Icon: `ShieldCheck` from Lucide
- Message: "No audit log entries found"
- Description: "System activity will appear here as users interact with the application."

**Loading state:**
- Skeleton rows: 5-8 rows with animated pulse
- Maintain table header during loading

**Accessibility:**
- `<caption>` element for screen readers
- `aria-sort` on sortable columns
- `aria-label` on pagination buttons

---

## 4. Report Filtering UX

### Date Range Selection

**Default behavior:**
- On page load with no URL params: default to last 30 days
- `from` = 30 days ago, `to` = today
- Pre-populate DateRangePicker with these defaults

**DateRangePicker component design:**
- Two date inputs: "From" and "To"
- Calendar popover (Shadcn Calendar component) for visual date selection
- Quick-select presets:
  - Last 7 days
  - Last 30 days (default)
  - Last 90 days
  - This month
  - Last month
  - This year
- Validation: `from` must be ≤ `to`; show inline error if violated
- Format: YYYY-MM-DD (ISO)

**Report type selection:**
- Segmented control or tab bar at the top of the reports page
- Tabs: Appointments | Revenue | Visits | Doctors | Patients | No-Show Rate
- Selected tab determines which chart/data is displayed
- Changing tab does NOT reset the date range

**URL state persistence:**
```typescript
const [searchParams, setSearchParams] = useSearchParams();

const from = searchParams.get("from") || defaultFrom;
const to = searchParams.get("to") || defaultTo;
const reportType = searchParams.get("reportType") || "appointments";

function updateFilters(newFrom: string, newTo: string, newType: string) {
  setSearchParams({ from: newFrom, to: newTo, reportType: newType });
}
```

**React Query integration:**
- Query key includes params: `["admin", "reports", reportType, { from, to }]`
- Changing filters automatically triggers refetch
- `staleTime: 5 * 60 * 1000` — don't refetch on tab switch within 5 minutes
- `placeholderData: keepPreviousData` — show old data while new data loads

**Empty state handling:**
- When API returns empty/null data for the selected period:
  - Chart area shows empty state illustration
  - Message: "No data for the selected period"
  - Suggestion: "Try adjusting the date range to find results."
- Do NOT show "0" values in metric cards when data is empty — show "N/A" or "—"

**Export button placement:**
- Top-right of the report content area, always visible
- Shows loading spinner during download
- Disabled when no data is available for the current filters
- Tooltip: "Export {reportType} report as CSV"

---

## 5. Doctor Status Toggle UX

### Design Pattern

**Location:** User management table or dedicated doctor list
**Trigger:** Toggle switch or button in the "Actions" column for Doctor-role rows
**Confirmation:** Dialog before status change

**Confirmation dialog:**
- Deactivation: "Are you sure you want to deactivate Dr. {name}? They will no longer appear in search results or receive appointments."
- Activation: "Are you sure you want to activate Dr. {name}?"

**Status badge:**
- Active: Green badge with dot
- Inactive: Red/gray badge with dot

**Optimistic update:**
- Update UI immediately on toggle click
- Roll back on API error with error toast
- Use React Query `onMutate` + `onError` + `onSuccess` pattern

```typescript
const useToggleDoctorStatus = () =>
  useMutation({
    mutationFn: ({ doctorId, isActive }: { doctorId: string; isActive: boolean }) =>
      apiClient.patch(ADMIN.DOCTORS_STATUS(doctorId), null, {
        params: { isActive },
      }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["doctors"] });
      const previous = queryClient.getQueryData(["doctors"]);
      // Optimistic update: flip isActive in cached data
      queryClient.setQueryData(["doctors"], (old: any) => ({
        ...old,
        content: old.content.map((d: Doctor) =>
          d.id === variables.doctorId
            ? { ...d, isActive: variables.isActive }
            : d
        ),
      }));
      return { previous };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(["doctors"], context?.previous);
      toast.error("Failed to update doctor status");
    },
    onSuccess: () => {
      toast.success("Doctor status updated");
    },
  });
```
