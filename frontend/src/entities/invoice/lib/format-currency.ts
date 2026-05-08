/**
 * Entity-level currency formatter for invoice amounts.
 * Delegates to shared utility but provides an entity-specific import path
 * to follow FSD public API conventions.
 */
export { formatCurrency } from '@/shared/lib/formatCurrency'
