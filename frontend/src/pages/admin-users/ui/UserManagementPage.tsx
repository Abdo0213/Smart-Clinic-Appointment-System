'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { apiClient } from '@/shared/api/client'
import { API_ROUTES } from '@/shared/api/apiRoutes'
import { AuthGuard } from '@/features/auth/ui/AuthGuard'
import { createUserSchema, type CreateUserData } from '@/features/auth/model/schemas'
import { DataTable } from '@/shared/ui/data-table/data-table'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog/confirm-dialog'
import { SearchBar } from '@/shared/ui/search-bar/search-bar'
import { LoadingSpinner } from '@/shared/ui/loading-spinner/loading-spinner'
import { EmptyState } from '@/shared/ui/empty-state/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { PlusIcon, PencilIcon, Trash2Icon, Loader2Icon, ShieldCheckIcon, ShieldOffIcon } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { UserRole } from '@/shared/types/enums'

interface UserItem {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  specialization?: string
}

interface UsersResponse {
  content: UserItem[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

function useGetUsers(params: { page: number; size: number; search?: string }) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      const { data } = await apiClient.get<UsersResponse>(API_ROUTES.USERS.LIST, { params })
      return data
    },
  })
}

function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { firstName: string; lastName: string; email: string; password: string; role: UserRole; specialization?: string }) =>
      apiClient.post(API_ROUTES.USERS.CREATE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { firstName?: string; lastName?: string; email?: string; role?: UserRole; specialization?: string } }) =>
      apiClient.put(API_ROUTES.USERS.DETAIL(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(API_ROUTES.USERS.DETAIL(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

function useToggleDoctorStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ doctorId, isActive }: { doctorId: string; isActive: boolean }) =>
      apiClient.patch(API_ROUTES.ADMIN.DOCTOR_STATUS(doctorId), null, { params: { isActive } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

const ROLE_COLORS: Record<UserRole, string> = {
  Admin: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400',
  Doctor: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
  Receptionist: 'border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-400',
  Patient: 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400',
}

function CreateUserForm({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const createUserMutation = useCreateUser()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateUserData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'Patient',
      specialization: '',
    },
  })

  const selectedRole = watch('role')

  const onSubmit = (data: CreateUserData) => {
    createUserMutation.mutate(data, {
      onSuccess: () => {
        reset()
        onOpenChange(false)
        toast.success('User created successfully')
      },
      onError: () => toast.error('Failed to create user'),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>Add a new user to the system</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="create-firstName">First Name</Label>
              <Input id="create-firstName" {...register('firstName')} />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="create-lastName">Last Name</Label>
              <Input id="create-lastName" {...register('lastName')} />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="create-email">Email</Label>
            <Input id="create-email" type="email" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="create-password">Password</Label>
            <Input id="create-password" type="password" {...register('password')} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="create-role">Role</Label>
            <Select value={selectedRole} onValueChange={(v) => register('role').onChange({ target: { value: v, name: 'role' } })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Patient">Patient</SelectItem>
                <SelectItem value="Doctor">Doctor</SelectItem>
                <SelectItem value="Receptionist">Receptionist</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
          </div>
          {selectedRole === 'Doctor' && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="create-specialization">Specialization</Label>
              <Input id="create-specialization" placeholder="e.g. Cardiology" {...register('specialization')} />
              {errors.specialization && <p className="text-xs text-destructive">{errors.specialization.message}</p>}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createUserMutation.isPending}>
              {createUserMutation.isPending && <Loader2Icon className="animate-spin mr-2" />}
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditUserForm({
  open,
  onOpenChange,
  user,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserItem | null
}) {
  const updateUserMutation = useUpdateUser()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      createUserSchema.omit({ password: true }).extend({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        email: z.string().email().min(1, 'Email is required'),
      })
    ),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      role: user?.role ?? 'Patient',
      specialization: user?.specialization ?? '',
    },
    values: user
      ? {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          specialization: user.specialization ?? '',
        }
      : undefined,
  })

  const selectedRole = watch('role')

  const onSubmit = (data: { firstName: string; lastName: string; email: string; role: UserRole; specialization?: string }) => {
    if (!user) return
    updateUserMutation.mutate(
      { id: user.id, data },
      {
        onSuccess: () => {
          onOpenChange(false)
          toast.success('User updated successfully')
        },
        onError: () => toast.error('Failed to update user'),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-firstName">First Name</Label>
              <Input id="edit-firstName" {...register('firstName')} />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-lastName">Last Name</Label>
              <Input id="edit-lastName" {...register('lastName')} />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input id="edit-email" type="email" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-role">Role</Label>
            <Select value={selectedRole} onValueChange={(v) => register('role').onChange({ target: { value: v, name: 'role' } })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Patient">Patient</SelectItem>
                <SelectItem value="Doctor">Doctor</SelectItem>
                <SelectItem value="Receptionist">Receptionist</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {selectedRole === 'Doctor' && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-specialization">Specialization</Label>
              <Input id="edit-specialization" {...register('specialization')} />
              {errors.specialization && <p className="text-xs text-destructive">{errors.specialization.message}</p>}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending && <Loader2Icon className="animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function UserManagementPage() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null)
  const [toggleStatusOpen, setToggleStatusOpen] = useState(false)
  const [toggleTarget, setToggleTarget] = useState<UserItem | null>(null)

  const { data, isLoading } = useGetUsers({ page, size: 10, search: search || undefined })
  const deleteUserMutation = useDeleteUser()
  const toggleStatusMutation = useToggleDoctorStatus()

  const handleDelete = () => {
    if (!selectedUser) return
    deleteUserMutation.mutate(selectedUser.id, {
      onSuccess: () => {
        setDeleteOpen(false)
        toast.success(`User ${selectedUser.firstName} ${selectedUser.lastName} deleted`)
      },
      onError: () => toast.error('Failed to delete user'),
    })
  }

  const handleToggleStatus = () => {
    if (!toggleTarget) return
    const newStatus = !(toggleTarget as any).isActive
    toggleStatusMutation.mutate(
      { doctorId: toggleTarget.id, isActive: newStatus },
      {
        onSuccess: () => {
          setToggleStatusOpen(false)
          toast.success(`Doctor ${toggleTarget.firstName} ${toggleTarget.lastName} ${newStatus ? 'activated' : 'deactivated'}`)
        },
        onError: () => toast.error('Failed to toggle doctor status'),
      },
    )
  }

  const columns: ColumnDef<UserItem>[] = [
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <Badge variant="outline" className={ROLE_COLORS[row.original.role]}>
          {row.original.role}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedUser(row.original)
              setEditOpen(true)
            }}
          >
            <PencilIcon className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedUser(row.original)
              setDeleteOpen(true)
            }}
          >
            <Trash2Icon className="size-4 text-destructive" />
          </Button>
          {row.original.role === 'Doctor' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setToggleTarget(row.original)
                setToggleStatusOpen(true)
              }}
              title="Toggle active status"
            >
              {(row.original as any).isActive !== false ? (
                <ShieldOffIcon className="size-4 text-orange-500" />
              ) : (
                <ShieldCheckIcon className="size-4 text-green-500" />
              )}
            </Button>
          )}
        </div>
      ),
    },
  ]

  const users = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <AuthGuard requiredRole="Admin">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">User Management</h1>
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon className="mr-2 size-4" />
            Create User
          </Button>
        </div>

        <SearchBar onSearch={setSearch} placeholder="Search users..." className="max-w-sm" />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : users.length === 0 ? (
          <EmptyState title="No users found" description="Create a user to get started." />
        ) : (
          <DataTable
            columns={columns}
            data={users}
            pagination={{ page, pageSize: 10, totalPages, onPageChange: setPage }}
          />
        )}

        <CreateUserForm open={createOpen} onOpenChange={setCreateOpen} />
        <EditUserForm open={editOpen} onOpenChange={setEditOpen} user={selectedUser} />

        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete User"
          description={`Are you sure you want to delete ${selectedUser?.firstName} ${selectedUser?.lastName}? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleDelete}
          isLoading={deleteUserMutation.isPending}
        />

        <ConfirmDialog
          open={toggleStatusOpen}
          onOpenChange={setToggleStatusOpen}
          title="Toggle Doctor Status"
          description={`Are you sure you want to ${(toggleTarget as any)?.isActive !== false ? 'deactivate' : 'activate'} Dr. ${toggleTarget?.firstName} ${toggleTarget?.lastName}?`}
          confirmLabel={(toggleTarget as any)?.isActive !== false ? 'Deactivate' : 'Activate'}
          variant={(toggleTarget as any)?.isActive !== false ? 'destructive' : 'default'}
          onConfirm={handleToggleStatus}
          isLoading={toggleStatusMutation.isPending}
        />
      </div>
    </AuthGuard>
  )
}
