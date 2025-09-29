'use client'

import React, { useMemo, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { organizerAcceptSchema, type OrganizerAcceptInput } from '@/lib/validations/organizer-accept'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'

function OrganizerAcceptContent() {
  const params = useSearchParams()
  const router = useRouter()
  const token = useMemo(() => params.get('token') || '', [params])
  const [submitting, setSubmitting] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const form = useForm<OrganizerAcceptInput>({
    resolver: zodResolver(organizerAcceptSchema),
    defaultValues: { token, password: '', confirmPassword: '' },
  })

  async function onSubmit(values: OrganizerAcceptInput) {
    try {
      setSubmitting(true)
      setErrorMsg(null)
      const res = await fetch('/api/organizer/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Failed to accept invitation')
      }
      toast.success('Invitation accepted', { description: 'Your password has been set' })
      setAccepted(true)
      setTimeout(() => {
        router.push('/organizer/sessions')
      }, 1200)
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      setErrorMsg(message)
      toast.error('Unable to accept invitation', { description: message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>
            {accepted ? 'Password Set — Redirecting' : 'Set Your Organizer Password'}
          </CardTitle>
          <CardDescription>
            {accepted
              ? 'Your organizer account is now active. You will be redirected shortly.'
              : 'Enter a strong password to activate your organizer account.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accepted ? (
            <Button className="w-full" onClick={() => router.push('/organizer/sessions')}>
              Go to Organizer Sessions
            </Button>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {(!token || token.length === 0) && (
                  <p className="text-sm text-red-600">
                    Missing invitation token. Please use the link from your email or request a new invitation from an administrator.
                  </p>
                )}
                {errorMsg && (
                  <p className="text-sm text-red-600">
                    {errorMsg}
                  </p>
                )}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <input type="hidden" value={token} {...form.register('token')} />
                <Button type="submit" className="w-full" isLoading={submitting} disabled={!token}>
                  Set Password
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function OrganizerAcceptPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-6 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait while we load the invitation form.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <OrganizerAcceptContent />
    </Suspense>
  )
}


