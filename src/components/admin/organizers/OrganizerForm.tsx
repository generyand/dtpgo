'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, User, Mail, Shield, ToggleLeft } from 'lucide-react'
import { toast } from 'sonner'

// Validation schema
const organizerFormSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
  email: z.string()
    .email('Please enter a valid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email must be less than 255 characters'),
  role: z.enum(['organizer', 'admin']),
  isActive: z.boolean(),
})

type OrganizerFormData = z.infer<typeof organizerFormSchema>

interface OrganizerFormProps {
  organizer?: {
    id: string
    email: string
    fullName: string | null
    role: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  }
  onSuccess?: (updatedOrganizer: {
    id: string
    email: string
    fullName: string | null
    role: string
    isActive: boolean
  }) => void
  onCancel?: () => void
  mode?: 'create' | 'edit'
}

export function OrganizerForm({ 
  organizer, 
  onSuccess, 
  onCancel, 
  mode = 'edit' 
}: OrganizerFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<OrganizerFormData>({
    resolver: zodResolver(organizerFormSchema),
    defaultValues: {
      fullName: organizer?.fullName || '',
      email: organizer?.email || '',
      role: (organizer?.role as 'organizer' | 'admin') || 'organizer',
      isActive: organizer?.isActive ?? true,
    },
    mode: 'onChange',
  })

  const watchedValues = watch()

  const onSubmit = async (data: OrganizerFormData) => {
    if (!organizer && mode === 'edit') {
      setError('Organizer data is required for editing')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const url = mode === 'create' 
        ? '/api/admin/organizers'
        : `/api/admin/organizers/${organizer?.id}`
      
      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save organizer')
      }

      toast.success(
        mode === 'create' 
          ? 'Organizer created successfully' 
          : 'Organizer updated successfully'
      )

      if (onSuccess) {
        onSuccess(result.organizer)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = (value: string) => {
    setValue('role', value as 'organizer' | 'admin', { shouldValidate: true })
  }

  const handleActiveToggle = (checked: boolean) => {
    setValue('isActive', checked, { shouldValidate: true })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {mode === 'create' ? (
            <>
              <User className="h-5 w-5" />
              Create New Organizer
            </>
          ) : (
            <>
              <User className="h-5 w-5" />
              Edit Organizer Profile
            </>
          )}
        </CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? 'Add a new organizer to the system'
            : 'Update organizer information and settings'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Full Name Field */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name
            </Label>
            <Input
              id="fullName"
              {...register('fullName')}
              placeholder="Enter organizer's full name"
              className={errors.fullName ? 'border-red-500' : ''}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="Enter organizer's email address"
              className={errors.email ? 'border-red-500' : ''}
              disabled={mode === 'edit'} // Email cannot be changed after creation
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
            {mode === 'edit' && (
              <p className="text-xs text-muted-foreground">
                Email address cannot be changed after organizer creation
              </p>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Role
            </Label>
            <Select value={watchedValues.role} onValueChange={handleRoleChange}>
              <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select organizer role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="organizer">
                  <div className="flex flex-col">
                    <span className="font-medium">Organizer</span>
                    <span className="text-xs text-muted-foreground">
                      Can manage assigned events and scan attendance
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex flex-col">
                    <span className="font-medium">Admin</span>
                    <span className="text-xs text-muted-foreground">
                      Full system access and management capabilities
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role.message}</p>
            )}
          </div>

          {/* Active Status Toggle */}
          <div className="space-y-2">
            <Label htmlFor="isActive" className="flex items-center gap-2">
              <ToggleLeft className="h-4 w-4" />
              Account Status
            </Label>
            <div className="flex items-center space-x-3">
              <Switch
                id="isActive"
                checked={watchedValues.isActive}
                onCheckedChange={handleActiveToggle}
              />
              <Label htmlFor="isActive" className="text-sm font-normal">
                {watchedValues.isActive ? 'Active' : 'Inactive'}
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              {watchedValues.isActive 
                ? 'Organizer can access the system and assigned events'
                : 'Organizer account is disabled and cannot access the system'
              }
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || !isDirty || !isValid}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === 'create' ? 'Create Organizer' : 'Save Changes'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
