"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { patientApi } from "@/entities/patient/api/patientApi"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { useDebounce } from "@/shared/hooks/useDebounce"

interface PatientSearchProps {
  onSelect?: (patientId: string) => void
  placeholder?: string
}

export function PatientSearch({ onSelect, placeholder = "Search patients by name or phone..." }: PatientSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const trimmedSearch = debouncedSearchTerm.trim()
  const isEnabled = trimmedSearch.length > 1

  const { data, isLoading } = useQuery({
    queryKey: ["patients", { name: trimmedSearch, phone: trimmedSearch, size: 5 }],
    queryFn: () => patientApi.getAll({ name: trimmedSearch, phone: trimmedSearch, size: 5 }),
    enabled: isEnabled,
  })

  return (
    <div className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          className="pl-8 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {isLoading && (
          <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {data && data.content.length > 0 && isEnabled && (
        <div className="absolute top-full mt-1 w-full bg-popover text-popover-foreground border rounded-md shadow-md z-10 max-h-60 overflow-y-auto">
          <ul className="py-1">
            {data.content.map((patient) => (
              <li key={patient.id}>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-muted text-sm"
                  onClick={() => {
                    onSelect?.(patient.id)
                    setSearchTerm("")
                  }}
                >
                  <div className="font-medium">
                    {patient.firstName} {patient.lastName}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {patient.phone}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data && data.content.length === 0 && isEnabled && !isLoading && (
        <div className="absolute top-full mt-1 w-full bg-popover text-popover-foreground border rounded-md shadow-md z-10 p-4 text-center text-sm text-muted-foreground">
          No patients found.
        </div>
      )}
    </div>
  )
}
