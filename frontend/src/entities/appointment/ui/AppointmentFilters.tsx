'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AppointmentStatus } from '../model/types'
import { APPOINTMENT_STATUS_VALUES } from '../model/types'

interface AppointmentFiltersProps {
  onFilterChange: (filters: {
    date?: string
    status?: AppointmentStatus
    doctorId?: string
    patientSearch?: string
  }) => void
  doctors?: { id: string; name: string }[]
}

export function AppointmentFilters({ onFilterChange, doctors }: AppointmentFiltersProps) {
  const [date, setDate] = useState<string>('')
  const [status, setStatus] = useState<AppointmentStatus | ''>('')
  const [doctorId, setDoctorId] = useState<string>('')
  const [patientSearch, setPatientSearch] = useState<string>('')

  const emitFilters = (
    nextDate?: string,
    nextStatus?: AppointmentStatus | '',
    nextDoctorId?: string,
    nextPatientSearch?: string
  ) => {
    onFilterChange({
      date: nextDate || undefined,
      status: (nextStatus || undefined) as AppointmentStatus | undefined,
      doctorId: nextDoctorId || undefined,
      patientSearch: nextPatientSearch || undefined,
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        type="date"
        value={date}
        onChange={(e) => {
          setDate(e.target.value)
          emitFilters(e.target.value, status, doctorId, patientSearch)
        }}
        className="w-40"
      />
      <Select
        value={status}
        onValueChange={(val) => {
          const v = (val ?? '') as AppointmentStatus | ''
          setStatus(v)
          emitFilters(date, v, doctorId, patientSearch)
        }}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All</SelectItem>
          {APPOINTMENT_STATUS_VALUES.map((s) => (
            <SelectItem key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {doctors && doctors.length > 0 && (
        <Select
          value={doctorId}
          onValueChange={(val) => {
            const v = val ?? ''
            setDoctorId(v)
            emitFilters(date, status, v, patientSearch)
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Doctor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Doctors</SelectItem>
            {doctors.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Input
        placeholder="Search patient..."
        value={patientSearch}
        onChange={(e) => {
          setPatientSearch(e.target.value)
          emitFilters(date, status, doctorId, e.target.value)
        }}
        className="w-48"
      />
    </div>
  )
}
