'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AmountDisplay } from './AmountDisplay'
import type { LineItem } from '../model/types'

interface LineItemsTableProps {
  lineItems: LineItem[]
}

export function LineItemsTable({ lineItems }: LineItemsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Qty</TableHead>
          <TableHead className="text-right">Unit Price</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lineItems.map((item, idx) => (
          <TableRow key={idx}>
            <TableCell>{item.description}</TableCell>
            <TableCell className="text-right">{item.quantity}</TableCell>
            <TableCell className="text-right">
              <AmountDisplay amount={item.unitPrice} />
            </TableCell>
            <TableCell className="text-right">
              <AmountDisplay amount={item.totalPrice} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
