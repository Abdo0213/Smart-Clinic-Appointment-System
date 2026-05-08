# Visit Feature — Research

## 1. Structured Medical Form UX

### Problem

Medical forms are complex with multiple sections, required fields, and conditional logic. Poor UX leads to incomplete records and clinician frustration.

### Findings

**Progressive Disclosure**
- Break the visit form into collapsible sections: Chief Complaint → Examination → Assessment → Plan → ICD-10
- Show only the active section expanded; completed sections collapse with a green check indicator
- This mirrors the SOAP (Subjective, Objective, Assessment, Plan) clinical documentation pattern

**Auto-save & Draft Persistence**
- Save visit drafts automatically on field blur (debounced 1.5s)
- Display "Draft saved" indicator to reduce anxiety about data loss
- On page reload, restore the draft from the last auto-saved state

**Field Sizing**
- Chief Complaint: Single-line text input (char count: 200)
- Examination Findings: Multi-line textarea (min 3 rows, expandable)
- Assessment: Multi-line textarea (min 3 rows, expandable)
- Plan: Multi-line textarea (min 3 rows, expandable)
- ICD-10 Codes: Multi-select chip input with autocomplete search

**Section Validation**
- Validate per-section rather than all-at-once on submit
- Show inline validation errors below each field
- Disable "Sign Visit" button until all required sections are complete

**Keyboard Navigation**
- Tab between fields in logical clinical order
- Enter in single-line fields advances to next field
- Ctrl+Enter submits the form

### Recommendation

Use a step-by-step accordion layout with per-section validation and auto-save. Follow the SOAP note structure that clinicians are already familiar with.

## 2. Prescription PDF via Pre-signed S3 URLs

### Problem

Prescription PDFs contain sensitive medical data and must be served securely without exposing the backend to high download traffic.

### Findings

**Architecture**
1. Frontend requests PDF: `GET /visits/{id}/prescriptions/pdf`
2. Backend generates (or retrieves cached) PDF and uploads to S3
3. Backend returns a pre-signed S3 URL with TTL (default 15 minutes)
4. Frontend opens the URL in a new tab or triggers download via `<a>` element

**Security Considerations**
- Pre-signed URL TTL should be 15 minutes (configurable via env)
- URLs are single-purpose: tied to the specific visit and requester
- Backend must verify the requesting user has access to the visit before generating the URL
- S3 bucket policy should deny public access; only pre-signed URLs grant temporary read

**Caching Strategy**
- If the PDF was recently generated (visit is signed and unchanged), return cached URL
- If prescriptions changed since last generation, regenerate the PDF
- Cache invalidation key: `{visitId}-{prescriptionCount}-{updatedAt}`

**Frontend Implementation**
```typescript
async function downloadPrescriptionPdf(visitId: string): Promise<void> {
  const { downloadUrl, expiresAt } = await api.get<{ downloadUrl: string; expiresAt: string }>(
    `/visits/${visitId}/prescriptions/pdf`
  );
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `prescription-${visitId}.pdf`;
  link.click();
}
```

**Error Handling**
- 404: "No prescriptions found for this visit" — show informational message
- URL expired: Re-request a new URL automatically
- Network error: Show retry option

### Recommendation

Use pre-signed S3 URLs with 15-minute TTL. Generate PDFs server-side on demand with caching. Frontend creates a temporary `<a>` element to trigger download.

## 3. Visit Signing Workflow

### Problem

Signing a visit is an irreversible action that locks the record. The UX must prevent accidental signing while not being overly burdensome.

### Findings

**Two-step Confirmation**
1. Doctor clicks "Sign Visit" → SignVisitDialog opens
2. Dialog shows a summary of the visit (chief complaint, assessment, prescriptions count)
3. Doctor can optionally add billing line items
4. Doctor must explicitly click "Confirm & Sign" (destructive-style button)
5. No "undo" — but backend could support an "unsigned" flag for admin override (out of scope)

**Pre-sign Validation**
- Backend validates all required fields are present before allowing sign
- Frontend pre-checks validation to provide immediate feedback
- Missing fields are highlighted in the form with links to jump to the section

**Billing Items During Signing**
- Common billing items should be selectable from a quick-pick list
- Custom items can be added manually with description, quantity, and unit price
- Total price is calculated in real-time as items are added
- Billing items are optional — doctor can sign with no additional items

**Visual Feedback**
- Draft visits show a yellow "Draft" badge
- Signed visits show a green "Signed" badge with signedAt timestamp
- Once signed, all form fields are disabled/read-only
- Prescription add button is removed for signed visits

**State Transition**
```
Draft ──(sign)──→ Signed
                     │
                     └── Immutable: no edits, no prescriptions, no deletions
```

### Recommendation

Implement a two-step confirmation dialog with visit summary and optional billing items. Pre-validate required fields and provide clear visual feedback on visit status.

## 4. ICD-10 Code Input Patterns

### Problem

ICD-10 codes are numerous (~70,000), making selection difficult without effective search and filtering.

### Findings

**Search Approaches**
- **Code search**: Type "G44" → matches all codes starting with G44
- **Description search**: Type "headache" → matches codes with "headache" in description
- **Combined search**: Default to searching both code and description simultaneously

**Debounce Strategy**
- Debounce search input at 300ms to avoid excessive API calls or local filtering
- Show "Searching..." indicator during debounce delay
- If using a local dataset (~70K entries), filter client-side with Web Worker for performance

**Dataset Considerations**
- **Option A: Bundled dataset** — Ship a JSON file with all ICD-10 codes (~5MB compressed). Zero network latency but increases bundle size.
- **Option B: API search** — Call backend search endpoint. Smaller bundle but network dependency.
- **Option C: Hybrid** — Bundle top 5,000 most common codes, fallback to API for the rest.

**UI Pattern: Chip-based Multi-select**
- Selected codes appear as chips/tags below the input
- Each chip shows code + truncated description on hover
- Clicking the × on a chip removes it
- Maximum of 10 ICD-10 codes per visit (configurable)

**Autocomplete Dropdown**
- Show code and description in dropdown: `G44.209 - Tension-type headache, unspecified, not intractable`
- Highlight matching text in both code and description
- Limit dropdown to 20 results with "Type to search more..." message
- Keyboard navigation (arrow keys + Enter) for accessibility

**Recent/Favorite Codes**
- Store recently used codes per doctor in localStorage
- Show "Recently Used" section at top of dropdown
- This speeds up the common case where doctors reuse the same codes

### Recommendation

Use the hybrid approach (bundled common codes + API fallback) with a chip-based multi-select. Debounce at 300ms, show combined code+description results, and implement recent codes history per doctor.
