'use client'

import { useParams } from 'next/navigation'
import { DoctorProfilePage } from '@/pages/doctor-profile'

export default function AdminDoctorDetailRoute() {
  const params = useParams<{ id: string }>()
  return <DoctorProfilePage doctorId={params.id as string} />
}
