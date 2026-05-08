import type { AppointmentStatus } from './types'

/**
 * Valid status transitions for appointments.
 * BOOKED → ARRIVED, CANCELLED
 * ARRIVED → COMPLETED, CANCELLED, NO_SHOW
 * COMPLETED, CANCELLED, NO_SHOW → (terminal, no transitions)
 */
export const VALID_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  REQUESTED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['ARRIVED', 'CANCELLED'],
  BOOKED: ['ARRIVED', 'CANCELLED'],
  ARRIVED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
}

/**
 * Terminal statuses from which no transitions are allowed.
 */
export const TERMINAL_STATUSES: AppointmentStatus[] = ['COMPLETED', 'CANCELLED', 'NO_SHOW']

/**
 * Check if a status transition is valid according to the state machine.
 */
export function isValidTransition(from: AppointmentStatus, to: AppointmentStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false
}

/**
 * Get all valid next statuses from a given status.
 */
export function getValidNextStatuses(from: AppointmentStatus): AppointmentStatus[] {
  return VALID_TRANSITIONS[from] ?? []
}

/**
 * Check whether the given status is a terminal (final) state.
 */
export function isTerminalStatus(status: AppointmentStatus): boolean {
  return TERMINAL_STATUSES.includes(status)
}

/**
 * Check if an appointment with the given status can be cancelled.
 * Only BOOKED and ARRIVED can be cancelled.
 */
export function canCancel(status: AppointmentStatus): boolean {
  return isValidTransition(status, 'CANCELLED')
}

/**
 * Check if an appointment with the given status can be rescheduled.
 * Only BOOKED appointments can be rescheduled.
 */
export function canReschedule(status: AppointmentStatus): boolean {
  return status === 'BOOKED'
}
