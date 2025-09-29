'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { runBasicAudit, AuditIssue } from '@/lib/utils/accessibility-audit'

export function AccessibilityChecker() {
  const [issues, setIssues] = React.useState<AuditIssue[]>([])
  const [isRunning, setIsRunning] = React.useState(false)

  async function handleRun() {
    setIsRunning(true)
    const report = await runBasicAudit(document)
    setIssues(report.issues)
    setIsRunning(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accessibility Checker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-muted-foreground">WCAG 2.1 AA basic checks</div>
          <Button onClick={handleRun} disabled={isRunning} aria-busy={isRunning}>
            {isRunning ? 'Running…' : 'Run Audit'}
          </Button>
        </div>

        {issues.length === 0 ? (
          <div className="text-sm text-muted-foreground">No issues found. Run audit to check current screen.</div>
        ) : (
          <ul className="space-y-2 text-sm">
            {issues.map((i, idx) => (
              <li key={idx} className="rounded-md border p-2">
                <div className="font-medium capitalize">{i.type}</div>
                <div className="text-muted-foreground">{i.message}</div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default AccessibilityChecker


