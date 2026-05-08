# Billing Feature Specification

## Overview

The Billing feature provides comprehensive invoice management for the Smart Clinic Appointment System. It enables clinic staff to create, view, filter, and manage invoices tied to patient visits, while patients can view their own billing history.

## Feature Branch

`007-billing`

## User Stories

### P1: List Invoices with Filters

As a clinic administrator, I want to view a paginated list of invoices with filters for patient, status, and date range so that I can quickly find relevant billing records.

### P2: View Invoice Detail

As a clinic administrator, I want to view the full detail of an invoice including all line items, amounts, and payment status so that I can review the complete billing information.

### P3: Create Manual Invoice

As a clinic administrator, I want to manually create an invoice by selecting a patient visit and adding line items so that I can bill for services rendered.

### P4: Mark Invoice as Paid

As a clinic administrator, I want to mark an invoice as paid so that the billing record reflects the current payment state.

### P5: Waive Invoice (admin)

As a system administrator, I want to waive an invoice so that the patient is no longer responsible for the charges, with an audit trail of the waiver.

### P6: Patient View Own Invoices

As a patient, I want to view my own invoices and their payment status so that I can track my billing history and outstanding balances.

## Acceptance Scenarios

### P1: List Invoices with Filters

```gherkin
Scenario: View invoices list with default pagination
  Given the user is on the billing page
  When the page loads
  Then the first page of invoices is displayed with 20 items per page
  And the total invoice count and page count are shown

Scenario: Filter invoices by status
  Given the user is on the billing page
  When the user selects "PENDING" from the status filter
  Then only invoices with status PENDING are displayed
  And the pagination resets to page 1

Scenario: Filter invoices by patient
  Given the user is on the billing page
  When the user selects a patient from the patient filter
  Then only invoices for the selected patient are displayed
  And the pagination resets to page 1

Scenario: Combine filters
  Given the user is on the billing page
  When the user selects patient "John Doe" and status "PENDING"
  Then only pending invoices for patient "John Doe" are displayed

Scenario: Clear filters
  Given the user has applied filters on the billing page
  When the user clicks "Clear Filters"
  Then all filters are removed and the full invoice list is displayed

Scenario: Navigate pagination
  Given the invoice list has more than 20 items
  When the user clicks page 2
  Then the second page of invoices is displayed
  And the active page indicator updates to page 2
```

### P2: View Invoice Detail

```gherkin
Scenario: Open invoice detail from list
  Given the user is on the billing page with invoices listed
  When the user clicks on an invoice row
  Then the invoice detail view is displayed
  And all line items are shown with description, quantity, unit price, and total price
  And the invoice total amount matches the sum of line item totals

Scenario: View invoice status badge
  Given the user is viewing an invoice detail
  Then a status badge is displayed showing PENDING, PAID, or WAIVED
  And the badge color reflects the status (yellow for PENDING, green for PAID, gray for WAIVED)

Scenario: Navigate back to list
  Given the user is viewing an invoice detail
  When the user clicks the back button
  Then the user returns to the invoice list with previous filters preserved
```

### P3: Create Manual Invoice

```gherkin
Scenario: Open create invoice form
  Given the user is on the billing page
  When the user clicks "Create Invoice"
  Then a form is displayed with fields for patient, visit, and line items

Scenario: Add line items to invoice
  Given the user is on the create invoice form
  When the user fills in a line item with description "Consultation", quantity 1, and unit price 150.00
  Then the line item total shows 150.00
  And the invoice total updates to reflect the sum of all line items

Scenario: Add multiple line items
  Given the user is on the create invoice form with one line item
  When the user clicks "Add Line Item"
  Then a new empty line item row appears
  And the user can fill in additional details

Scenario: Remove a line item
  Given the user is on the create invoice form with two line items
  When the user clicks the remove button on the first line item
  Then the first line item is removed
  And the invoice total recalculates

Scenario: Submit invoice successfully
  Given the user has filled in all required fields on the create invoice form
  When the user clicks "Create"
  Then the invoice is created with status PENDING
  And the user is redirected to the invoice detail view
  And a success notification is shown

Scenario: Submit invoice with validation errors
  Given the user is on the create invoice form
  When the user clicks "Create" without filling required fields
  Then validation error messages are displayed for each missing required field
  And the invoice is not submitted

Scenario: Cancel invoice creation
  Given the user is on the create invoice form
  When the user clicks "Cancel"
  Then the form is closed and no invoice is created
  And the user returns to the invoice list
```

### P4: Mark Invoice as Paid

```gherkin
Scenario: Mark a pending invoice as paid
  Given the user is viewing an invoice with status PENDING
  When the user clicks "Mark as Paid"
  Then a confirmation dialog appears

Scenario: Confirm marking as paid
  Given the user has clicked "Mark as Paid" on a pending invoice
  When the user confirms the action
  Then the invoice status changes to PAID
  And the paidAt timestamp is set
  And a success notification is shown

Scenario: Mark as paid on already paid invoice
  Given the user is viewing an invoice with status PAID
  Then the "Mark as Paid" button is disabled or hidden

Scenario: Cancel marking as paid
  Given the user has clicked "Mark as Paid" on a pending invoice
  When the user cancels the confirmation dialog
  Then the invoice status remains PENDING
```

### P5: Waive Invoice (admin)

```gherkin
Scenario: Waive a pending invoice as admin
  Given the user has admin role and is viewing a PENDING invoice
  When the user clicks "Waive Invoice"
  Then a confirmation dialog with a reason field appears

Scenario: Confirm waiving with reason
  Given the admin has clicked "Waive Invoice"
  When the admin enters a waiver reason and confirms
  Then the invoice status changes to WAIVED
  And a success notification is shown

Scenario: Non-admin cannot waive
  Given the user does not have admin role
  Then the "Waive Invoice" button is not visible

Scenario: Cannot waive a paid invoice
  Given the user has admin role and is viewing a PAID invoice
  Then the "Waive Invoice" button is disabled or hidden
```

### P6: Patient View Own Invoices

```gherkin
Scenario: Patient views their invoice list
  Given the user is logged in as a patient
  When the user navigates to their billing page
  Then only invoices belonging to the patient are displayed
  And the patient filter is not shown (automatically scoped)

Scenario: Patient views invoice detail
  Given the patient is viewing their invoice list
  When the patient clicks on an invoice
  Then the invoice detail is shown with all line items and status
  And no administrative actions (mark paid, waive) are visible

Scenario: Patient cannot access other patients' invoices
  Given the patient is logged in
  When the patient attempts to navigate to another patient's invoice URL
  Then a 403 or not-found response is displayed
```

## Functional Requirements

| ID   | Requirement                                                                                           | Priority |
|------|-------------------------------------------------------------------------------------------------------|----------|
| FR-1 | Display paginated invoice list with configurable page size (default 20)                               | P1       |
| FR-2 | Filter invoices by status (PENDING, PAID, WAIVED)                                                    | P1       |
| FR-3 | Filter invoices by patient ID                                                                         | P1       |
| FR-4 | Display invoice detail with all line items, totals, and status                                       | P1       |
| FR-5 | Create manual invoice with dynamic line items (add/remove rows)                                      | P1       |
| FR-6 | Auto-calculate line item totals and invoice total from quantity and unit price                        | P1       |
| FR-7 | Mark a PENDING invoice as PAID with confirmation dialog                                              | P1       |
| FR-8 | Waive a PENDING invoice with reason (admin only) with confirmation dialog                            | P2       |
| FR-9 | Patient-scoped invoice list (auto-filtered by logged-in patient)                                     | P2       |
| FR-10| Role-based UI: hide admin actions (waive, mark paid) from patients                                   | P2       |
| FR-11| Persist filter state in URL query parameters for deep linking                                        | P3       |
| FR-12| Display currency values with proper locale formatting                                                | P1       |
| FR-13| Validate all required fields before invoice creation submission                                       | P1       |
| FR-14| Show loading states during API calls                                                                  | P1       |
| FR-15| Show error states with retry option on API failure                                                   | P1       |

## Key Entities

### Invoice

Central billing entity representing a billable event tied to a patient visit.

### LineItem

Individual charge within an invoice. Each invoice contains one or more line items that sum to the invoice total.

### InvoiceStatus

Enumerated status tracking the lifecycle of an invoice: PENDING → PAID or PENDING → WAIVED.

## Success Criteria

1. Users can list, filter, and paginate invoices with sub-second response times on local data.
2. Invoice detail view accurately displays all line items with correct totals matching the sum of line item prices.
3. Manual invoice creation supports adding/removing line items with real-time total calculation.
4. Status transitions (PENDING → PAID, PENDING → WAIVED) work correctly with confirmation dialogs.
5. Patients can only see their own invoices; admin-only actions are properly gated by role.
6. All currency values display with proper formatting (e.g., $1,500.00).
7. Validation prevents submission of incomplete invoice forms with clear error messages.

## Assumptions

- The backend API already exists and follows REST conventions as specified in the API contracts.
- Authentication and role information (admin vs. patient) is available from the auth context.
- Currency is displayed in USD by default; multi-currency is out of scope.
- Invoice numbers/IDs are generated server-side; the frontend does not assign them.
- PDF invoice generation is out of scope for this feature.
- Payment processing integration is out of scope; "Mark as Paid" is a manual status change.
- The frontend consumes the API via TanStack Query for data fetching and caching.
- The project uses Feature-Sliced Design (FSD) architecture.
