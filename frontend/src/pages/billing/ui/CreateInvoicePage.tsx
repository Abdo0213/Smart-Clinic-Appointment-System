'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useCreateInvoice } from '@/entities/invoice'
import { useGetVisits } from '@/entities/visit'
import { useGetPatient } from '@/entities/patient'
import { createInvoiceSchema, type CreateInvoiceFormData } from '../model/schemas'
import { LoadingSpinner } from '@/shared/ui/loading-spinner/loading-spinner'
import { ROUTE_PATHS } from '@/shared/config/appConfig'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ArrowLeftIcon, PlusIcon, Trash2Icon, Loader2Icon } from 'lucide-react'

export default function CreateInvoicePage() {
  const router = useRouter()
  const createInvoiceMutation = useCreateInvoice()
  const [selectedVisitId, setSelectedVisitId] = useState('')

  const { data: visitsData } = useGetVisits({ page: 0, size: 100 })
  const visits = visitsData?.content ?? []

  const selectedVisit = visits.find((v) => v.id === selectedVisitId)
  const { data: patient } = useGetPatient(selectedVisit?.patientId ?? '')

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateInvoiceFormData>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      visitId: '',
      patientId: '',
      appointmentId: '',
      lineItems: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lineItems',
  })

  const watchLineItems = watch('lineItems')
  const totalAmount = watchLineItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0)

  const handleVisitSelect = (visitId: string) => {
    setSelectedVisitId(visitId)
    setValue('visitId', visitId)
    const visit = visits.find((v) => v.id === visitId)
    if (visit) {
      setValue('patientId', visit.patientId)
      setValue('appointmentId', visit.appointmentId)
    }
  }

  const onSubmit = (data: CreateInvoiceFormData) => {
    createInvoiceMutation.mutate(data, {
      onSuccess: (invoice) => {
        toast.success('Invoice created successfully')
        router.push(ROUTE_PATHS.ADMIN_BILLING)
      },
      onError: () => toast.error('Failed to create invoice'),
    })
  }

  return (
    <div className="container mx-auto max-w-4xl py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <h1 className="text-2xl font-bold">Create Invoice</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Visit &amp; Patient</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Select Visit</Label>
              <Select value={selectedVisitId} onValueChange={(v) => { if (v) handleVisitSelect(v) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a visit" />
                </SelectTrigger>
                <SelectContent>
                  {visits.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      Visit {v.id.slice(0, 8)}... — {v.chiefComplaint.slice(0, 40)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.visitId && <p className="text-xs text-destructive">{errors.visitId.message}</p>}
            </div>

            {selectedVisit && patient && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Patient</span>
                  <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Appointment</span>
                  <p className="font-medium">{selectedVisit.appointmentId}</p>
                </div>
              </div>
            )}

            <input type="hidden" {...register('patientId')} />
            <input type="hidden" {...register('appointmentId')} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Line Items</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
              >
                <PlusIcon className="mr-1 size-4" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_80px_120px_40px] items-end gap-2">
                <div className="flex flex-col gap-1">
                  {index === 0 && <Label className="text-xs">Description</Label>}
                  <Input
                    placeholder="Item description"
                    {...register(`lineItems.${index}.description`)}
                  />
                  {errors.lineItems?.[index]?.description && (
                    <p className="text-xs text-destructive">{errors.lineItems[index]?.description?.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  {index === 0 && <Label className="text-xs">Qty</Label>}
                  <Input
                    type="number"
                    min={1}
                    {...register(`lineItems.${index}.quantity`, { valueAsNumber: true })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  {index === 0 && <Label className="text-xs">Unit Price</Label>}
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    {...register(`lineItems.${index}.unitPrice`, { valueAsNumber: true })}
                  />
                </div>
                {fields.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="self-end">
                    <Trash2Icon className="size-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}

            {errors.lineItems && !Array.isArray(errors.lineItems) && (
              <p className="text-xs text-destructive">{errors.lineItems.message}</p>
            )}

            <Separator />

            <div className="flex justify-end">
              <div className="text-right">
                <span className="text-sm text-muted-foreground">Total</span>
                <p className="text-xl font-bold">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={createInvoiceMutation.isPending}>
            {createInvoiceMutation.isPending && <Loader2Icon className="animate-spin mr-2" />}
            Create Invoice
          </Button>
        </div>
      </form>
    </div>
  )
}
