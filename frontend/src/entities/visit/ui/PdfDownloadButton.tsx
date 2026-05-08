'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { FileDown, Loader2Icon } from 'lucide-react'
import { visitApi } from '../api/visitApi'
import { toast } from 'sonner'

interface PdfDownloadButtonProps {
  visitId: string
  disabled?: boolean
}

export function PdfDownloadButton({ visitId, disabled }: PdfDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      const { url } = await visitApi.getPrescriptionPdfUrl(visitId)
      window.open(url, '_blank')
    } catch {
      toast.error('Failed to download prescription PDF')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span tabIndex={0}>
            <Button variant="outline" size="sm" disabled={disabled || isLoading} onClick={handleDownload}>
              {isLoading ? <Loader2Icon className="size-4 animate-spin" /> : <FileDown className="size-4" />}
              PDF
            </Button>
          </span>
        }
      />
      <TooltipContent>Download prescription PDF</TooltipContent>
    </Tooltip>
  )
}
