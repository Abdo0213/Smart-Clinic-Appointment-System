'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface PatientSearchBarProps {
  onSearch: (filters: { name?: string; phone?: string }) => void
  defaultValue?: { name?: string; phone?: string }
  debounceMs?: number
}

export function PatientSearchBar({ onSearch, defaultValue, debounceMs = 300 }: PatientSearchBarProps) {
  const [name, setName] = useState(defaultValue?.name ?? '')
  const [phone, setPhone] = useState(defaultValue?.phone ?? '')

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch({ name: name || undefined, phone: phone || undefined })
    }, debounceMs)
    return () => clearTimeout(timer)
  }, [name, phone, onSearch, debounceMs])

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="pl-8"
        />
      </div>
      <Input
        placeholder="Phone..."
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-40"
      />
    </div>
  )
}
