import { z } from 'zod'

export const notificationTypeSchema = z.enum([
  'APPOINTMENT_REMINDER_24H',
  'APPOINTMENT_REMINDER_2H',
  'APPOINTMENT_STATUS_CHANGE',
  'PRESCRIPTION_READY',
  'APPOINTMENT_CANCELLED',
])

export const notificationSchema = z.object({
  id: z.string(),
  type: notificationTypeSchema,
  title: z.string().min(1),
  message: z.string().min(1),
  isRead: z.boolean(),
  createdAt: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export type NotificationSchemaType = z.infer<typeof notificationSchema>
export type NotificationTypeSchemaType = z.infer<typeof notificationTypeSchema>
