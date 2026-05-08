import { z } from 'zod'

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')

export const reportFilterSchema = z
  .object({
    from: dateSchema.optional(),
    to: dateSchema.optional(),
    reportType: z
      .enum(['appointments', 'revenue', 'visits', 'doctors', 'patients', 'no-show-rate'])
      .optional(),
  })
  .refine(
    (data) => {
      if (data.from && data.to) {
        return new Date(data.from) <= new Date(data.to)
      }
      return true
    },
    { message: 'From date must be before or equal to To date', path: ['from'] },
  )

export const auditLogQuerySchema = z.object({
  page: z.number().int().min(0).default(0),
  size: z.number().int().min(1).max(100).default(20),
})

export const createUserSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['Admin', 'Doctor', 'Receptionist', 'Patient']),
    specialization: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.role === 'Doctor') {
        return !!data.specialization && data.specialization.length > 0
      }
      return true
    },
    { message: 'Specialization is required for Doctor role', path: ['specialization'] },
  )

export type ReportFilterData = z.infer<typeof reportFilterSchema>
export type AuditLogQueryData = z.infer<typeof auditLogQuerySchema>
export type CreateUserFormData = z.infer<typeof createUserSchema>
