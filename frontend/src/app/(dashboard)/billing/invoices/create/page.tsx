'use client'

import { useCreateInvoice } from '@/entities/invoice'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusIcon, TrashIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ROUTE_PATHS } from '@/shared/config/appConfig'

const createInvoiceFormSchema = z.object({
  visitId: z.string().min(1, 'Visit ID is required'),
  patientId: z.string().min(1, 'Patient ID is required'),
  appointmentId: z.string().optional(),
  lineItems: z.array(z.object({
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unitPrice: z.number().min(0, 'Price must be positive'),
  })).min(1, 'At least one line item is required'),
})

type CreateInvoiceFormValues = z.infer<typeof createInvoiceFormSchema>

export default function CreateInvoicePage() {
  const router = useRouter()
  const createInvoice = useCreateInvoice()
  const { register, control, handleSubmit, formState: { errors } } = useForm<CreateInvoiceFormValues>({
    resolver: zodResolver(createInvoiceFormSchema),
    defaultValues: {
      lineItems: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' })

  const onSubmit = (data: CreateInvoiceFormValues) => {
    createInvoice.mutate(data, {
      onSuccess: () => {
        toast.success('Invoice created successfully')
        router.push(ROUTE_PATHS.ADMIN_BILLING)
      },
      onError: () => toast.error('Failed to create invoice'),
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Create Invoice</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="visitId">Visit ID</Label>
              <Input id="visitId" {...register('visitId')} />
              {errors.visitId && <p className="text-xs text-destructive">{errors.visitId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient ID</Label>
              <Input id="patientId" {...register('patientId')} />
              {errors.patientId && <p className="text-xs text-destructive">{errors.patientId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointmentId">Appointment ID (optional)</Label>
              <Input id="appointmentId" {...register('appointmentId')} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Line Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}>
              <PlusIcon className="size-4" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-2">
                <div className="flex-1 space-y-1">
                  <Label>Description</Label>
                  <Input {...register(`lineItems.${index}.description`)} />
                  {errors.lineItems?.[index]?.description && <p className="text-xs text-destructive">{errors.lineItems[index]?.description?.message}</p>}
                </div>
                <div className="w-20 space-y-1">
                  <Label>Qty</Label>
                  <Input type="number" {...register(`lineItems.${index}.quantity`, { valueAsNumber: true })} />
                </div>
                <div className="w-24 space-y-1">
                  <Label>Price</Label>
                  <Input type="number" step="0.01" {...register(`lineItems.${index}.unitPrice`, { valueAsNumber: true })} />
                </div>
                {fields.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                    <TrashIcon className="size-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
            {errors.lineItems?.message && <p className="text-xs text-destructive">{errors.lineItems.message}</p>}
          </CardContent>
        </Card>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={createInvoice.isPending}>
            {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </div>
  )
}
