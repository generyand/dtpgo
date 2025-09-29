'use client'

import React, { useMemo, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Search,
  Filter,
  X,
  Mail,
  Shield,
  ShieldCheck,
  Activity,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMultiSelect } from '@/lib/hooks/useMultiSelect'

export interface OrganizerItem {
  id: string
  name: string
  email?: string
  role?: 'organizer' | 'admin'
  isActive?: boolean
  lastLoginAt?: string | null
  createdAt?: string
}

export interface BulkOrganizerAssignmentProps {
  selectedEventIds: string[]
  organizers: OrganizerItem[]
  onAssign?: (params: { eventIds: string[]; organizerIds: string[] }) => Promise<void> | void
  onRemove?: (params: { eventIds: string[]; organizerIds: string[] }) => Promise<void> | void
  isLoading?: boolean
  className?: string
  error?: string | null
  onRetry?: () => void
  showSearch?: boolean
  showFilters?: boolean
  maxHeight?: string
}

export function BulkOrganizerAssignment({
  selectedEventIds,
  organizers,
  onAssign,
  onRemove,
  isLoading = false,
  className,
  error,
  onRetry,
  showSearch = true,
  showFilters = true,
  maxHeight = 'max-h-64',
}: BulkOrganizerAssignmentProps) {
  const organizerIds = useMemo(() => organizers.map(o => o.id), [organizers])
  const { selectedIds, toggle, selectAll, clear, isAllSelected, count } = useMultiSelect<string>()
  
  // Enhanced state management
  const [searchTerm, setSearchTerm] = useState('')
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [operationProgress, setOperationProgress] = useState(0)
  const [isOperating, setIsOperating] = useState(false)
  const [operationType, setOperationType] = useState<'assign' | 'remove' | null>(null)

  // Filter organizers based on search and active status
  const filteredOrganizers = useMemo(() => {
    return organizers.filter(organizer => {
      const matchesSearch = !searchTerm || 
        organizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        organizer.email?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesActive = !showActiveOnly || organizer.isActive !== false
      return matchesSearch && matchesActive
    })
  }, [organizers, searchTerm, showActiveOnly])

  const allSelected = isAllSelected(filteredOrganizers.map(o => o.id))
  const hasEvents = selectedEventIds.length > 0
  const hasSelection = count > 0
  const disabled = !hasEvents || !hasSelection || isLoading || isOperating

  // Enhanced operation handlers with progress tracking
  const handleAssign = useCallback(async () => {
    if (disabled) return
    
    try {
      setIsOperating(true)
      setOperationType('assign')
      setOperationProgress(0)
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setOperationProgress(prev => Math.min(prev + 10, 90))
      }, 100)
      
      await onAssign?.({ eventIds: selectedEventIds, organizerIds: Array.from(selectedIds) })
      
      clearInterval(progressInterval)
      setOperationProgress(100)
      
      // Clear selection after successful operation
      setTimeout(() => {
        clear()
        setOperationProgress(0)
        setOperationType(null)
      }, 500)
    } catch (err) {
      setOperationProgress(0)
      setOperationType(null)
      throw err
    } finally {
      setIsOperating(false)
    }
  }, [disabled, selectedEventIds, selectedIds, onAssign, clear])

  const handleRemove = useCallback(async () => {
    if (disabled) return
    
    try {
      setIsOperating(true)
      setOperationType('remove')
      setOperationProgress(0)
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setOperationProgress(prev => Math.min(prev + 10, 90))
      }, 100)
      
      await onRemove?.({ eventIds: selectedEventIds, organizerIds: Array.from(selectedIds) })
      
      clearInterval(progressInterval)
      setOperationProgress(100)
      
      // Clear selection after successful operation
      setTimeout(() => {
        clear()
        setOperationProgress(0)
        setOperationType(null)
      }, 500)
    } catch (err) {
      setOperationProgress(0)
      setOperationType(null)
      throw err
    } finally {
      setIsOperating(false)
    }
  }, [disabled, selectedEventIds, selectedIds, onRemove, clear])

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Format last login helper
  const formatLastLogin = (lastLoginAt?: string | null) => {
    if (!lastLoginAt) return 'Never'
    
    const lastLogin = new Date(lastLoginAt)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return formatDate(lastLoginAt)
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with enhanced controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <h3 className="font-medium">Organizer Assignment</h3>
          <Badge variant="outline" className="text-xs">
            {filteredOrganizers.length} organizers
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={hasSelection ? 'default' : 'secondary'} className="text-xs">
            {count} selected
          </Badge>
          {hasSelection && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={clear} 
              disabled={isLoading || isOperating}
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filter Controls */}
      {(showSearch || showFilters) && (
        <div className="space-y-3">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search organizers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md text-sm"
                disabled={isLoading || isOperating}
              />
            </div>
          )}
          
          {showFilters && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="active-only"
                checked={showActiveOnly}
                onCheckedChange={setShowActiveOnly}
                disabled={isLoading || isOperating}
              />
              <label htmlFor="active-only" className="text-sm text-muted-foreground">
                Show active organizers only
              </label>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="ml-2"
                disabled={isLoading || isOperating}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Progress Indicator */}
      {isOperating && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>
              {operationType === 'assign' ? 'Assigning organizers...' : 'Removing organizers...'}
            </span>
          </div>
          <Progress value={operationProgress} className="h-2" />
        </div>
      )}

      {/* Select All Control */}
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        <Checkbox 
          id="org-select-all" 
          checked={allSelected} 
          onCheckedChange={() => (allSelected ? clear() : selectAll(filteredOrganizers.map(o => o.id)))}
          disabled={isLoading || isOperating}
        />
        <label htmlFor="org-select-all" className="text-sm font-medium">
          Select all organizers ({filteredOrganizers.length})
        </label>
      </div>

      {/* Organizers List */}
      <div className={cn('overflow-auto space-y-2 border rounded-md p-2', maxHeight)}>
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-2">
                <Skeleton className="h-4 w-4" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrganizers.length === 0 ? (
          // Empty state
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {searchTerm ? 'No organizers found matching your search' : 'No organizers available'}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="mt-2"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          // Organizers list
          filteredOrganizers.map((organizer) => {
            const checked = selectedIds.has(organizer.id)
            return (
              <div
                key={organizer.id}
                className={cn(
                  'flex items-start space-x-3 p-3 rounded-lg transition-colors cursor-pointer',
                  checked ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50',
                  !organizer.isActive && 'opacity-60'
                )}
                onClick={() => toggle(organizer.id)}
              >
                <Checkbox 
                  id={`org-${organizer.id}`} 
                  checked={checked} 
                  onCheckedChange={() => toggle(organizer.id)}
                  disabled={isLoading || isOperating}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{organizer.name}</h4>
                    {organizer.role && (
                      <Badge 
                        variant={organizer.role === 'admin' ? 'default' : 'secondary'}
                        className={cn(
                          'text-xs',
                          organizer.role === 'admin' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        )}
                      >
                        {organizer.role === 'admin' ? (
                          <>
                            <Shield className="mr-1 h-3 w-3" />
                            Admin
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="mr-1 h-3 w-3" />
                            Organizer
                          </>
                        )}
                      </Badge>
                    )}
                    {organizer.isActive === false && (
                      <Badge variant="destructive" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {organizer.email && (
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{organizer.email}</span>
                      </div>
                    )}
                    {organizer.lastLoginAt && (
                      <div className="flex items-center space-x-1">
                        <Activity className="h-3 w-3" />
                        <span>Last login: {formatLastLogin(organizer.lastLoginAt)}</span>
                      </div>
                    )}
                    {organizer.createdAt && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Joined: {formatDate(organizer.createdAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          {hasEvents ? (
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>{selectedEventIds.length} event(s) selected</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span>Select events to enable actions</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="destructive" 
            onClick={handleRemove} 
            disabled={disabled}
            size="sm"
          >
            {isOperating && operationType === 'remove' ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <UserMinus className="h-3 w-3 mr-1" />
                Remove Selected
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleAssign} 
            disabled={disabled}
            size="sm"
          >
            {isOperating && operationType === 'assign' ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <UserPlus className="h-3 w-3 mr-1" />
                Assign Selected
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BulkOrganizerAssignment


