// Types
export type {
  AppointmentStatus,
  Appointment,
  BookAppointmentRequest,
  CancelAppointmentRequest,
  RescheduleAppointmentRequest,
  AppointmentFilters as AppointmentFilterValues,
  AppointmentListResponse,
  WaitlistEntry,
} from './model/types'
export { APPOINTMENT_STATUS_VALUES } from './model/types'

// Status transitions
export {
  VALID_TRANSITIONS,
  TERMINAL_STATUSES,
  isValidTransition,
  getValidNextStatuses,
  isTerminalStatus,
  canCancel,
  canReschedule,
} from './model/status-transitions'

// Query hooks
export {
  useGetAppointments,
  useGetAppointment,
  useDoctorQueue,
  useBookAppointment,
  useUpdateAppointmentStatus,
  useCancelAppointment,
  useRescheduleAppointment,
  useJoinWaitlist,
} from './model/appointmentQueries'

// API
export { appointmentApi } from './api/appointmentApi'

// UI
export { AppointmentCard } from './ui/AppointmentCard'
export { StatusBadge as AppointmentStatusBadge } from './ui/StatusBadge'
export { AppointmentFilters } from './ui/AppointmentFilters'
