'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { formatDate, formatDateTime } from '@/shared/lib/formatDate'
import {
  FileTextIcon,
  PillIcon,
  DownloadIcon,
  CalendarIcon,
  UserIcon,
  StethoscopeIcon,
  Loader2Icon,
  ReceiptIcon,
} from 'lucide-react'
import type { Visit } from '../model/types'
import { visitApi } from '../api/visitApi'
import { useState } from 'react'
import { toast } from 'sonner'
import { useGetDoctor } from '@/entities/doctor'
import { useGetPatient } from '@/entities/patient'
import { useGetInvoiceByVisit } from '@/entities/billing/model/billingQueries'
import { formatCurrency } from '@/shared/lib/formatCurrency'

interface VisitDetailsDialogProps {
  visit: Visit | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VisitDetailsDialog({ visit, open, onOpenChange }: VisitDetailsDialogProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const { data: doctor, isLoading: doctorLoading } = useGetDoctor(visit?.doctorId ?? '')
  const { data: patient, isLoading: patientLoading } = useGetPatient(visit?.patientId ?? '')
  const { data: invoice, isLoading: invoiceLoading } = useGetInvoiceByVisit(visit?.id ?? '')

  if (!visit) return null

  const doctorName = doctor
    ? `Dr. ${doctor.firstName} ${doctor.lastName}`
    : visit.doctorName || `Doctor #${visit.doctorId.slice(0, 8)}`
  const patientName = patient
    ? `${patient.firstName} ${patient.lastName}`
    : visit.patientName || `Patient #${visit.patientId.slice(0, 8)}`

  const handleDownloadAllPrescriptions = async () => {
    try {
      setIsDownloading(true)
      const { downloadUrl } = await visitApi.getAllPrescriptionsPdfUrl(visit.id)
      
      // Resolve the full URL by prepending the base API URL (Gateway: 8080/api)
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
      const fullUrl = downloadUrl.startsWith('http') 
        ? downloadUrl 
        : `${baseUrl}${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`
      
      window.open(fullUrl, '_blank')
    } catch {
      toast.error('Failed to download prescriptions. Please try again later.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/*
        KEY FIXES:
        - max-w-5xl with w-[95vw] for proper width on all screens
        - h-[90vh] with flex-col to constrain height and enable inner scroll
        - overflow-hidden on the outer shell, scroll only in ScrollArea
        - Bottom sections use flex-col (stacked on mobile), lg:flex-row side-by-side
        - Billing column uses flex-col with min-h-0 so it doesn't overflow
      */}
      <DialogContent className="max-w-[1400px] w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl border shadow-2xl">

        {/* ── HEADER (fixed, never scrolls) ── */}
        <DialogHeader className="shrink-0 px-6 py-5 border-b bg-muted/20">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl shrink-0">
                <FileTextIcon className="size-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black tracking-tight leading-none">
                  Visit Record
                </DialogTitle>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                  Ref: {visit.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant={visit.isSigned ? 'default' : 'secondary'}
                className="px-3 py-1 text-[11px] font-bold rounded-full"
              >
                {visit.isSigned ? 'SIGNED & LOCKED' : 'DRAFT RECORD'}
              </Badge>
              {invoice && (
                <Badge
                  variant="outline"
                  className={`px-3 py-1 text-[11px] font-bold rounded-full border-2 ${invoice.status === 'PAID'
                    ? 'border-green-500 text-green-600 bg-green-50 dark:bg-green-950/30'
                    : 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30'
                    }`}
                >
                  {invoice.status}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* ── SCROLLABLE BODY ── */}
        {/*
          ScrollArea fills all remaining space.
          Everything inside can be as tall as it needs to be.
        */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 py-6 space-y-8">

            {/* META CARDS — responsive row that wraps cleanly */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  icon: <CalendarIcon className="size-5 text-primary" />,
                  label: 'Encounter Date',
                  value: formatDateTime(visit.createdAt),
                  loading: false,
                },
                {
                  icon: <StethoscopeIcon className="size-5 text-primary" />,
                  label: 'Attending Doctor',
                  value: doctorName,
                  loading: doctorLoading,
                },
                {
                  icon: <UserIcon className="size-5 text-primary" />,
                  label: 'Patient',
                  value: patientName,
                  loading: patientLoading,
                },
              ].map(({ icon, label, value, loading }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 bg-muted/40 border rounded-xl p-4"
                >
                  <div className="bg-background p-2.5 rounded-lg border shrink-0">{icon}</div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">
                      {label}
                    </p>
                    <p className="text-sm font-semibold truncate" title={value}>
                      {loading ? 'Loading…' : value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CLINICAL GRID — 2 cols on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Chief Complaint', value: visit.chiefComplaint, placeholder: 'No primary complaint recorded.' },
                { title: 'Examination Findings', value: visit.examinationFindings, placeholder: 'No clinical findings recorded.' },
                { title: 'Assessment', value: visit.assessment, placeholder: 'Pending clinical assessment.' },
                { title: 'Plan', value: visit.plan, placeholder: 'No follow-up plan documented.' },
              ].map(({ title, value, placeholder }) => (
                <section key={title} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-1 bg-primary rounded-full shrink-0" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-foreground">
                      {title}
                    </h3>
                  </div>
                  <div className="bg-muted/10 border rounded-xl p-4 text-sm leading-relaxed min-h-[100px] text-foreground/80 italic">
                    {value || placeholder}
                  </div>
                </section>
              ))}
            </div>

            {/* ICD-10 */}
            {visit.icd10Codes && (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-1 bg-primary rounded-full shrink-0" />
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-foreground">
                    Diagnosis (ICD-10)
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {visit.icd10Codes.split(',').map((code) => (
                    <Badge
                      key={code}
                      variant="secondary"
                      className="font-mono text-xs px-3 py-1.5 bg-primary/5 text-primary border border-primary/20 rounded-lg"
                    >
                      {code.trim()}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            <Separator className="opacity-40" />

            {/* PRESCRIPTIONS + BILLING — stack on mobile, side-by-side on lg */}
            {/*
              KEY FIX: flex-col on small screens, lg:flex-row on large.
              Each child is `flex-1 min-w-0` so neither overflows.
              On mobile, billing is stacked below prescriptions — no horizontal squeeze.
            */}
            <div className="flex flex-col lg:flex-row gap-8 pb-4">
              {/* ── PRESCRIPTIONS ── */}
              <section className="flex-1 min-w-0 space-y-4">
                <div className="flex items-center justify-between gap-2.5 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-primary p-1.5 rounded-lg shrink-0">
                      <PillIcon className="size-4 text-white" />
                    </div>
                    <h3 className="text-base font-black uppercase tracking-tight">
                      Prescribed Medications
                    </h3>
                  </div>
                  {visit.prescriptions && visit.prescriptions.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg h-8 gap-2 border-primary text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                      onClick={handleDownloadAllPrescriptions}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <Loader2Icon className="size-3 animate-spin" />
                      ) : (
                        <DownloadIcon className="size-3" />
                      )}
                      <span className="text-[11px] font-black uppercase tracking-tighter">Download All</span>
                    </Button>
                  )}
                </div>

                {!visit.prescriptions || visit.prescriptions.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground italic bg-muted/20 p-8 rounded-2xl border-2 border-dashed">
                    <PillIcon className="size-7 opacity-20" />
                    No medications prescribed during this visit.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {visit.prescriptions.map((rx) => (
                      <div
                        key={rx.id}
                        className="border rounded-xl p-4 bg-card hover:border-primary/40 transition-colors"
                      >
                        <div className="flex-1 min-w-0 space-y-2">
                          <p className="font-black text-lg text-primary truncate">{rx.medicationName}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {[rx.dosage, rx.frequency, `${rx.durationDays} days`].map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="bg-muted/50 border-none px-2.5 py-0.5 font-semibold text-[11px] rounded-md"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          {rx.notes && (
                            <p className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg border-l-4 border-primary/30 leading-relaxed">
                              <span className="font-bold text-primary/50 uppercase text-[9px] block mb-0.5">
                                Pharmacist Note
                              </span>
                              {rx.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* ── BILLING ── */}
              <section className="flex-1 min-w-0 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="bg-primary p-1.5 rounded-lg shrink-0">
                    <ReceiptIcon className="size-4 text-white" />
                  </div>
                  <h3 className="text-base font-black uppercase tracking-tight">
                    Billing & Invoicing
                  </h3>
                </div>

                {invoiceLoading ? (
                  <div className="flex flex-col items-center justify-center gap-3 p-8 bg-muted/20 rounded-2xl border-2 border-dashed">
                    <Loader2Icon className="size-7 animate-spin text-primary/40" />
                    <p className="text-sm font-semibold text-muted-foreground">Fetching billing data…</p>
                  </div>
                ) : !invoice || !invoice.lineItems || invoice.lineItems.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground italic bg-muted/20 p-8 rounded-2xl border-2 border-dashed">
                    <ReceiptIcon className="size-7 opacity-20" />
                    No billing items found for this encounter.
                  </div>
                ) : (
                  <div className="border rounded-xl overflow-hidden flex flex-col bg-card">
                    {/* Line items */}
                    <div className="divide-y">
                      {invoice.lineItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{item.description}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Qty {item.quantity} · {formatCurrency(item.unitPrice)} each
                            </p>
                          </div>
                          <p className="font-black text-sm text-primary tabular-nums shrink-0">
                            {formatCurrency(item.totalPrice)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Total footer */}
                    <div className="mt-auto bg-primary/5 border-t-2 border-primary/15 px-5 py-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">
                          Total Payable
                        </p>
                        <p className="text-2xl font-black text-primary tabular-nums">
                          {formatCurrency(invoice.totalAmount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                          Status
                        </p>
                        <Badge
                          className={`font-black rounded-lg text-xs px-3 py-1 ${invoice.status === 'PAID'
                            ? 'bg-green-500 text-white border-none'
                            : 'border-2 border-amber-500 text-amber-600 bg-transparent'
                            }`}
                        >
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </ScrollArea>

        {/* ── FOOTER (fixed, never scrolls) ── */}
        <div className="shrink-0 px-6 py-4 border-t bg-muted/5 flex items-center justify-between gap-4">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest hidden sm:block">
            Smart Clinic • Confidential Patient Record
          </p>
          <Button
            variant="default"
            onClick={() => onOpenChange(false)}
            className="px-10 h-11 rounded-xl font-black text-sm ml-auto"
          >
            DISMISS
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}