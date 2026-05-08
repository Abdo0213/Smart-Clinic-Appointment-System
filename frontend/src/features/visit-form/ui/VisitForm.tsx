'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useVisitFormStore } from '../model/visitFormStore'
import { createVisitSchema, type CreateVisitFormData } from '../model/schemas'
import { FormSection } from '@/shared/ui/form-section/form-section'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface VisitFormProps {
  appointmentId: string
  onSubmit: (data: CreateVisitFormData) => void
  isSubmitting?: boolean
}

export function VisitForm({ appointmentId, onSubmit, isSubmitting }: VisitFormProps) {
  const { chiefComplaint, examinationFindings, assessment, plan, icd10Codes, setField } = useVisitFormStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreateVisitFormData>({
    resolver: zodResolver(createVisitSchema),
    defaultValues: {
      appointmentId,
      chiefComplaint,
      examinationFindings,
      assessment,
      plan,
      icd10Codes: icd10Codes ? icd10Codes.split(',').map((s) => s.trim()).filter(Boolean) : [],
    },
  })

  const handleBlur = (field: keyof Omit<CreateVisitFormData, 'appointmentId' | 'icd10Codes'>) => {
    const value = useVisitFormStore.getState()[field]
    setValue(field, value as string, { shouldValidate: true })
  }

  const handleIcdBlur = () => {
    const raw = useVisitFormStore.getState().icd10Codes
    const codes = raw.split(',').map((s) => s.trim()).filter(Boolean)
    setValue('icd10Codes', codes, { shouldValidate: true })
  }

  return (
    <form id="visit-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <input type="hidden" {...register('appointmentId')} />

      <FormSection title="Chief Complaint" description="Patient's primary reason for the visit">
        <div className="flex flex-col gap-2">
          <Label htmlFor="chiefComplaint">Complaint</Label>
          <Textarea
            id="chiefComplaint"
            placeholder="Describe the chief complaint..."
            {...register('chiefComplaint', {
              onBlur: () => handleBlur('chiefComplaint'),
              onChange: (e) => setField('chiefComplaint', e.target.value),
            })}
          />
          {errors.chiefComplaint && (
            <p className="text-xs text-destructive">{errors.chiefComplaint.message}</p>
          )}
        </div>
      </FormSection>

      <FormSection title="Examination Findings" description="Physical examination observations">
        <div className="flex flex-col gap-2">
          <Label htmlFor="examinationFindings">Findings</Label>
          <Textarea
            id="examinationFindings"
            placeholder="Document examination findings..."
            {...register('examinationFindings', {
              onBlur: () => handleBlur('examinationFindings'),
              onChange: (e) => setField('examinationFindings', e.target.value),
            })}
          />
          {errors.examinationFindings && (
            <p className="text-xs text-destructive">{errors.examinationFindings.message}</p>
          )}
        </div>
      </FormSection>

      <FormSection title="Assessment" description="Clinical assessment and diagnosis">
        <div className="flex flex-col gap-2">
          <Label htmlFor="assessment">Assessment</Label>
          <Textarea
            id="assessment"
            placeholder="Clinical assessment..."
            {...register('assessment', {
              onBlur: () => handleBlur('assessment'),
              onChange: (e) => setField('assessment', e.target.value),
            })}
          />
          {errors.assessment && (
            <p className="text-xs text-destructive">{errors.assessment.message}</p>
          )}
        </div>
      </FormSection>

      <FormSection title="Plan" description="Treatment plan and next steps">
        <div className="flex flex-col gap-2">
          <Label htmlFor="plan">Plan</Label>
          <Textarea
            id="plan"
            placeholder="Treatment plan..."
            {...register('plan', {
              onBlur: () => handleBlur('plan'),
              onChange: (e) => setField('plan', e.target.value),
            })}
          />
          {errors.plan && (
            <p className="text-xs text-destructive">{errors.plan.message}</p>
          )}
        </div>
      </FormSection>

      <FormSection title="ICD-10 Codes" description="Comma-separated diagnostic codes">
        <div className="flex flex-col gap-2">
          <Label htmlFor="icd10Codes">Codes</Label>
          <Input
            id="icd10Codes"
            placeholder="e.g. J06.9, M54.5"
            onChange={(e) => setField('icd10Codes', e.target.value)}
            onBlur={handleIcdBlur}
            defaultValue={icd10Codes}
          />
          {errors.icd10Codes && (
            <p className="text-xs text-destructive">{errors.icd10Codes.message}</p>
          )}
        </div>
      </FormSection>

      <button type="submit" disabled={isSubmitting} className="hidden" />
    </form>
  )
}
