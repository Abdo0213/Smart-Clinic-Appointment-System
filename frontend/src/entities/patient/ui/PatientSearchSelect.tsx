"use client"

import { useState } from "react"
import { useGetPatients } from "../model/patientQueries"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown, Search, UserIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "@/shared/ui/loading-spinner/loading-spinner"

interface PatientSearchSelectProps {
  onSelect: (patientId: string, patientName: string) => void
  selectedId?: string
}

export function PatientSearchSelect({ onSelect, selectedId }: PatientSearchSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  
  const { data, isLoading } = useGetPatients({
    name: search || undefined,
    page: 0,
    size: 10
  })

  const patients = data?.content ?? []
  const selectedPatient = patients.find((p) => p.id === selectedId)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedId && selectedPatient 
              ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
              : "Select patient..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-[400px] p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search patient by name..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <LoadingSpinner size="sm" />
              </div>
            ) : patients.length === 0 ? (
              <CommandEmpty>No patient found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {patients.map((patient) => (
                  <CommandItem
                    key={patient.id}
                    value={patient.id}
                    onSelect={() => {
                      onSelect(patient.id, `${patient.firstName} ${patient.lastName}`)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedId === patient.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{patient.firstName} {patient.lastName}</span>
                      <span className="text-xs text-muted-foreground">{patient.phone}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
