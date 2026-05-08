'use client'

import { formatCurrency } from '@/shared/lib/formatCurrency'

interface AmountDisplayProps {
  amount: number
}

export function AmountDisplay({ amount }: AmountDisplayProps) {
  return <span>{formatCurrency(amount)}</span>
}
