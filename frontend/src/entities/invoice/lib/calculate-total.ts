import type { LineItem, CreateLineItem } from '../model/types'

/**
 * Calculate the total for a single line item (quantity × unitPrice).
 */
export function calculateLineItemTotal(item: CreateLineItem): number {
  return Math.round(item.quantity * item.unitPrice * 100) / 100
}

/**
 * Calculate the total for an entire invoice from its line items.
 */
export function calculateInvoiceTotal(lineItems: (LineItem | CreateLineItem)[]): number {
  return lineItems.reduce((sum, item) => {
    const itemTotal = 'totalPrice' in item ? item.totalPrice : calculateLineItemTotal(item)
    return Math.round((sum + itemTotal) * 100) / 100
  }, 0)
}
