/**
 * Admin Registration Page
 *
 * Hosts the student registration form with submission handling,
 * success feedback, and "Register and Add Another" support.
 */
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import RegisterForm from '@/components/admin/RegisterForm'
import type { StudentFormInput } from '@/lib/validations/student'
import { Button } from '@/components/ui/button'
import { Toaster, toast } from 'sonner'

export default function AdminRegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [addAnother, setAddAnother] = useState(true)
  const [formKey, setFormKey] = useState(0) // remount form to reset after success

  async function handleSubmit(data: StudentFormInput): Promise<void> {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        // Provide a helpful message while API is not yet implemented
        const maybeJson = await res
          .json()
          .catch(() => ({ error: 'Registration failed (API not implemented yet)' }))
        throw new Error(maybeJson.error || 'Registration failed')
      }

      toast.success('Student registered successfully')

      if (addAnother) {
        // Remount form to clear fields for another entry
        setFormKey((k) => k + 1)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed'
      toast.error('Registration Error', { description: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Register Student</CardTitle>
          <CardDescription>Fill in the student details below.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <RegisterForm key={formKey} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={addAnother}
                  onChange={(e) => setAddAnother(e.target.checked)}
                />
                Register and add another
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormKey((k) => k + 1)}
                  disabled={isSubmitting}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Toaster richColors />
    </>
  )
} 