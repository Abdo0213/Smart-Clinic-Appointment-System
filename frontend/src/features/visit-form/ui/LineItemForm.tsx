'use client'

import { useVisitFormStore } from '../model/visitFormStore'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Trash2Icon } from 'lucide-react'

interface LineItemFormProps {
  index: number
  onRemove: () => void
}

export function LineItemForm({ index, onRemove }: LineItemFormProps) {
  const additionalItems = useVisitFormStore((s) => s.additionalItems)
  const updateAdditionalItem = useVisitFormStore((s) => s.updateAdditionalItem)
  const item = additionalItems[index]

  const totalPrice = item ? item.quantity * item.unitPrice : 0

  const handleChange = (field: 'description' | 'quantity' | 'unitPrice', rawValue: string) => {
    if (field === 'description') {
      updateAdditionalItem(index, field, rawValue)
    } else {
      const numVal = parseFloat(rawValue)
      if (!isNaN(numVal)) {
        updateAdditionalItem(index, field, numVal)
      }
    }
  }

  return (
    <div className="grid grid-cols-[1fr_80px_100px_100px_40px] items-end gap-2">
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Description</Label>
        <Input
          placeholder="Item description"
          value={item?.description ?? ''}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Qty</Label>
        <Input
          type="number"
          min={1}
          value={item?.quantity ?? 1}
          onChange={(e) => handleChange('quantity', e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Unit Price</Label>
        <Input
          type="number"
          min={0}
          step={0.01}
          value={item?.unitPrice ?? 0}
          onChange={(e) => handleChange('unitPrice', e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Total</Label>
        <Input value={totalPrice.toFixed(2)} readOnly className="bg-muted" />
      </div>
      <Button type="button" variant="ghost" size="icon" onClick={onRemove} className="self-end">
        <Trash2Icon className="size-4 text-destructive" />
      </Button>
    </div>
  )
}
