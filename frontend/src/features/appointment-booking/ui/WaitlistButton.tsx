'use client'

import { useState } from 'react'
import { useJoinWaitlist } from '../api/bookAppointment'
import { Button } from '@/components/ui/button'
import { BellIcon, CheckCircle2Icon } from 'lucide-react'

interface WaitlistButtonProps {
  appointmentId: string
}

export function WaitlistButton({ appointmentId }: WaitlistButtonProps) {
  const joinWaitlist = useJoinWaitlist()
  const [joined, setJoined] = useState(false)

  const handleJoin = async () => {
    try {
      await joinWaitlist.mutateAsync(appointmentId)
      setJoined(true)
    } catch {
      // error handled silently
    }
  }

  if (joined) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-1.5">
        <CheckCircle2Icon className="size-4" />
        Joined Waitlist
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleJoin}
      disabled={joinWaitlist.isPending}
      className="gap-1.5"
    >
      <BellIcon className="size-4" />
      {joinWaitlist.isPending ? 'Joining...' : 'Join Waitlist'}
    </Button>
  )
}
