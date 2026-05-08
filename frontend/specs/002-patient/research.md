# Patient Feature — Research

## 1. Patient Profile UI Patterns

### Form Layout

Medical intake forms benefit from a grouped, sectioned layout rather than a single long form. Best practice is to organize fields into logical sections:

- **Personal Information**: firstName, lastName, dateOfBirth, gender
- **Contact Information**: phone, address
- **Medical Information**: bloodType, knownAllergies
- **Emergency Contact**: emergencyContact, emergencyPhone
- **Insurance**: insuranceProvider, insuranceNumber

This grouping reduces cognitive load and makes it easier for users to locate specific fields. Each section should have a clear heading and visual separation.

### Progressive Disclosure

For the create form, consider showing only required fields by default with an expandable "Additional Information" section for optional fields. This reduces form abandonment on initial registration. However, for the edit flow, all fields should be visible since the user is intentionally updating their profile.

### Date of Birth Input

A date picker component is preferred over free-text input for dateOfBirth because:
- Prevents format ambiguity (MM/DD vs DD/MM)
- Enforces valid date ranges natively
- Provides a better mobile experience

The Shadcn UI `Calendar` + `Popover` pattern is the recommended approach for Next.js applications.

### Blood Type Selector

Blood type should be a select/dropdown rather than free text because:
- Limited set of valid values (8 options)
- Prevents typos and invalid entries
- Faster selection than typing

### Phone Input

Phone fields should:
- Accept both local and international formats
- Strip non-digit characters on submission
- Display validation feedback for clearly invalid formats
- Not enforce strict E.164 format on input (too restrictive for users)

## 2. Field-Level Access Control in Frontend

### Approach

Field-level access control (FLAC) determines which fields a user can see or edit based on their role. In this feature, the requirements are:

| Role | Can See | Can Edit |
|---|---|---|
| Patient (own profile) | All fields | All own fields |
| Doctor (any patient) | All fields | None |
| Admin/Receptionist (any patient) | All fields | None (view-only from list) |

### Implementation Patterns

**Option A: Conditional Rendering in Components**

Each field or field group checks the current role and renders accordingly:

```tsx
{canEdit && <Button onClick={toggleEdit}>Edit</Button>}
{isEditing && <PatientFields control={control} />}
{!isEditing && <PatientCard patient={patient} />}
```

This is the simplest approach and sufficient for this feature since the access patterns are coarse-grained (entire form editable or read-only, not individual fields).

**Option B: Field-Level Permission Map**

Define a permission map that specifies per-field visibility and editability:

```typescript
const fieldPermissions: Record<Role, Record<FieldName, "hidden" | "readonly" | "editable">> = {
  patient: { firstName: "editable", ... },
  doctor: { firstName: "readonly", bloodType: "readonly", ... },
  admin: { firstName: "readonly", ... },
};
```

This approach is overkill for the current requirements but provides extensibility if individual field permissions become necessary in the future.

**Recommendation**: Use Option A for this feature. The access control is at the form level (entire form editable or read-only), not at the individual field level. If field-level permissions are needed later, refactor to Option B.

### Role Context

The auth context should provide:
- `role`: The current user's role
- `userId`: The current user's ID (to determine if viewing own profile)

This information is consumed at the page level to determine the access mode (view, edit, or restricted).

## 3. Search and Filter UX

### Search Input Design

For patient search, two common patterns exist:

**Single Search Field**: One input that searches across multiple fields (name + phone). Simpler UI but less precise.

**Separate Filter Fields**: Dedicated inputs for name and phone. More explicit, allows combining filters. Better for admin users who need precision.

**Recommendation**: Use separate filter fields since the API supports distinct `name` and `phone` parameters. Place them above the data table in a filter bar. This matches the admin/receptionist use case where users may want to search by phone specifically.

### Debounce Strategy

Search inputs should debounce API calls to avoid excessive requests:

- **Debounce delay**: 300ms is the industry standard for search inputs. Fast enough to feel responsive, slow enough to avoid unnecessary API calls.
- **Implementation**: Use a custom hook or the `useDebouncedValue` pattern with React Query. The query key should include the debounced search term, so React Query automatically refetches when the debounced value changes.

```typescript
const [nameFilter, setNameFilter] = useState("");
const debouncedName = useDebouncedValue(nameFilter, 300);

const { data } = usePatientList({ name: debouncedName, ... });
```

### Pagination UX

- Show page size selector (10, 20, 50) as a dropdown.
- Display "Showing X–Y of Z results" text.
- Use standard previous/next navigation with page number buttons.
- Reset to page 0 when search filters change.

### Empty State

When no patients match the search criteria, display a clear message:
- Icon (e.g., search/magnifying glass)
- "No patients found" heading
- "Try adjusting your search terms" subtext
- A "Clear filters" button

### Loading State

- Show skeleton rows in the data table while loading.
- Disable pagination controls during loading.
- Show spinner or skeleton in the patient card while loading profile.

## 4. Form Validation Patterns

### Zod Schema Design

Use a single base schema and extend it for create and update:

```typescript
const patientBaseSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  dateOfBirth: z.string().refine(isValidPastDate, "Must be a valid past date"),
  gender: z.enum(["male", "female", "other"]),
  phone: z.string().min(7).max(15),
  // ...optional fields
});

const patientCreateSchema = patientBaseSchema;
const patientUpdateSchema = patientBaseSchema.partial();
```

### Server Error Mapping

When the API returns 400/422 with field-level errors, map them to React Hook Form:

```typescript
onError: (error) => {
  if (error.status === 400 || error.status === 422) {
    error.errors.forEach((e) => {
      form.setError(e.field, { message: e.message });
    });
  }
};
```

This provides a seamless experience where server validation errors appear in the same inline positions as client validation errors.
