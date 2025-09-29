import { z } from 'zod';
import { prisma } from '@/lib/db/client';

/**
 * Base organizer assignment validation schema
 */
export const organizerAssignmentSchema = z.object({
  organizerId: z.string().cuid('Invalid organizer ID format'),
  eventId: z.string().cuid('Invalid event ID format'),
  assignedBy: z.string().cuid('Invalid assigned by user ID format').optional(),
  reason: z.string().min(1, 'Reason is required').optional(),
});

/**
 * Bulk organizer assignment validation schema
 */
export const bulkOrganizerAssignmentSchema = z.object({
  organizerIds: z
    .array(z.string().cuid('Invalid organizer ID format'))
    .min(1, 'At least one organizer ID is required')
    .max(50, 'Cannot assign more than 50 organizers at once'),
  eventIds: z
    .array(z.string().cuid('Invalid event ID format'))
    .min(1, 'At least one event ID is required')
    .max(20, 'Cannot assign to more than 20 events at once'),
  assignedBy: z.string().cuid('Invalid assigned by user ID format').optional(),
  reason: z.string().min(1, 'Reason is required').optional(),
});

/**
 * Organizer removal validation schema
 */
export const organizerRemovalSchema = z.object({
  organizerId: z.string().cuid('Invalid organizer ID format'),
  eventId: z.string().cuid('Invalid event ID format'),
  reason: z.string().min(1, 'Reason is required').optional(),
});

/**
 * Bulk organizer removal validation schema
 */
export const bulkOrganizerRemovalSchema = z.object({
  organizerIds: z
    .array(z.string().cuid('Invalid organizer ID format'))
    .min(1, 'At least one organizer ID is required')
    .max(50, 'Cannot remove more than 50 organizers at once'),
  eventIds: z
    .array(z.string().cuid('Invalid event ID format'))
    .min(1, 'At least one event ID is required')
    .max(20, 'Cannot remove from more than 20 events at once'),
  reason: z.string().min(1, 'Reason is required').optional(),
});

/**
 * Assignment conflict detection result
 */
export interface AssignmentConflictResult {
  hasConflicts: boolean;
  conflicts: {
    duplicateAssignments: Array<{
      organizerId: string;
      organizerEmail: string;
      eventId: string;
      eventName: string;
    }>;
    inactiveOrganizers: Array<{
      organizerId: string;
      organizerEmail: string;
    }>;
    nonExistentOrganizers: string[];
    nonExistentEvents: string[];
    inactiveEvents: Array<{
      eventId: string;
      eventName: string;
    }>;
  };
}

/**
 * Validate organizer assignment for conflicts and business rules
 */
export async function validateOrganizerAssignment(
  organizerIds: string[],
  eventIds: string[],
  options: {
    checkDuplicates?: boolean;
    checkActiveStatus?: boolean;
    checkExistence?: boolean;
  } = {}
): Promise<AssignmentConflictResult> {
  const {
    checkDuplicates = true,
    checkActiveStatus = true,
    checkExistence = true,
  } = options;

  const conflicts: AssignmentConflictResult['conflicts'] = {
    duplicateAssignments: [],
    inactiveOrganizers: [],
    nonExistentOrganizers: [],
    nonExistentEvents: [],
    inactiveEvents: [],
  };

  // Check for non-existent organizers
  if (checkExistence) {
    const existingOrganizers = await prisma.organizer.findMany({
      where: { id: { in: organizerIds } },
      select: { id: true, email: true, isActive: true },
    });

    const existingOrganizerIds = existingOrganizers.map(o => o.id);
    conflicts.nonExistentOrganizers = organizerIds.filter(
      id => !existingOrganizerIds.includes(id)
    );

    // Check for inactive organizers
    if (checkActiveStatus) {
      conflicts.inactiveOrganizers = existingOrganizers
        .filter(o => !o.isActive)
        .map(o => ({
          organizerId: o.id,
          organizerEmail: o.email,
        }));
    }
  }

  // Check for non-existent events
  if (checkExistence) {
    const existingEvents = await prisma.event.findMany({
      where: { id: { in: eventIds } },
      select: { id: true, name: true, isActive: true },
    });

    const existingEventIds = existingEvents.map(e => e.id);
    conflicts.nonExistentEvents = eventIds.filter(
      id => !existingEventIds.includes(id)
    );

    // Check for inactive events
    if (checkActiveStatus) {
      conflicts.inactiveEvents = existingEvents
        .filter(e => !e.isActive)
        .map(e => ({
          eventId: e.id,
          eventName: e.name,
        }));
    }
  }

  // Check for duplicate assignments
  if (checkDuplicates) {
    const existingAssignments = await prisma.organizerEventAssignment.findMany({
      where: {
        organizerId: { in: organizerIds },
        eventId: { in: eventIds },
        isActive: true,
      },
      include: {
        organizer: {
          select: { email: true },
        },
        event: {
          select: { name: true },
        },
      },
    });

    conflicts.duplicateAssignments = existingAssignments.map(assignment => ({
      organizerId: assignment.organizerId,
      organizerEmail: assignment.organizer.email,
      eventId: assignment.eventId,
      eventName: assignment.event.name,
    }));
  }

  const hasConflicts = 
    conflicts.duplicateAssignments.length > 0 ||
    conflicts.inactiveOrganizers.length > 0 ||
    conflicts.nonExistentOrganizers.length > 0 ||
    conflicts.nonExistentEvents.length > 0 ||
    conflicts.inactiveEvents.length > 0;

  return {
    hasConflicts,
    conflicts,
  };
}

/**
 * Validate organizer removal for business rules
 */
export async function validateOrganizerRemoval(
  organizerIds: string[],
  eventIds: string[],
  options: {
    checkExistence?: boolean;
    checkActiveStatus?: boolean;
  } = {}
): Promise<AssignmentConflictResult> {
  const {
    checkExistence = true,
    checkActiveStatus = true,
  } = options;

  const conflicts: AssignmentConflictResult['conflicts'] = {
    duplicateAssignments: [],
    inactiveOrganizers: [],
    nonExistentOrganizers: [],
    nonExistentEvents: [],
    inactiveEvents: [],
  };

  // Check for non-existent organizers
  if (checkExistence) {
    const existingOrganizers = await prisma.organizer.findMany({
      where: { id: { in: organizerIds } },
      select: { id: true, email: true, isActive: true },
    });

    const existingOrganizerIds = existingOrganizers.map(o => o.id);
    conflicts.nonExistentOrganizers = organizerIds.filter(
      id => !existingOrganizerIds.includes(id)
    );

    // Check for inactive organizers
    if (checkActiveStatus) {
      conflicts.inactiveOrganizers = existingOrganizers
        .filter(o => !o.isActive)
        .map(o => ({
          organizerId: o.id,
          organizerEmail: o.email,
        }));
    }
  }

  // Check for non-existent events
  if (checkExistence) {
    const existingEvents = await prisma.event.findMany({
      where: { id: { in: eventIds } },
      select: { id: true, name: true, isActive: true },
    });

    const existingEventIds = existingEvents.map(e => e.id);
    conflicts.nonExistentEvents = eventIds.filter(
      id => !existingEventIds.includes(id)
    );

    // Check for inactive events
    if (checkActiveStatus) {
      conflicts.inactiveEvents = existingEvents
        .filter(e => !e.isActive)
        .map(e => ({
          eventId: e.id,
          eventName: e.name,
        }));
    }
  }

  // Check for non-assigned organizers (these would be "conflicts" for removal)
  const existingAssignments = await prisma.organizerEventAssignment.findMany({
    where: {
      organizerId: { in: organizerIds },
      eventId: { in: eventIds },
      isActive: true,
    },
    include: {
      organizer: {
        select: { email: true },
      },
      event: {
        select: { name: true },
      },
    },
  });

  // Find organizers that are not assigned to any of the specified events
  const assignedOrganizerIds = existingAssignments.map(a => a.organizerId);
  const unassignedOrganizers = organizerIds.filter(
    id => !assignedOrganizerIds.includes(id)
  );

  // Add unassigned organizers to conflicts (they can't be removed if not assigned)
  if (unassignedOrganizers.length > 0) {
    const unassignedOrganizerDetails = await prisma.organizer.findMany({
      where: { id: { in: unassignedOrganizers } },
      select: { id: true, email: true },
    });

    conflicts.duplicateAssignments = unassignedOrganizerDetails.map(org => ({
      organizerId: org.id,
      organizerEmail: org.email,
      eventId: '', // Not applicable for unassigned organizers
      eventName: 'Not assigned to any specified event',
    }));
  }

  const hasConflicts = 
    conflicts.duplicateAssignments.length > 0 ||
    conflicts.inactiveOrganizers.length > 0 ||
    conflicts.nonExistentOrganizers.length > 0 ||
    conflicts.nonExistentEvents.length > 0 ||
    conflicts.inactiveEvents.length > 0;

  return {
    hasConflicts,
    conflicts,
  };
}

/**
 * Check if organizer has permission to be assigned to event
 */
export async function validateOrganizerPermissions(
  organizerId: string,
  eventId: string
): Promise<{ hasPermission: boolean; reason?: string }> {
  try {
    // Get organizer details
    const organizer = await prisma.organizer.findUnique({
      where: { id: organizerId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!organizer) {
      return {
        hasPermission: false,
        reason: 'Organizer not found',
      };
    }

    if (!organizer.isActive) {
      return {
        hasPermission: false,
        reason: 'Organizer account is inactive',
      };
    }

    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        name: true,
        isActive: true,
        startDate: true,
        endDate: true,
      },
    });

    if (!event) {
      return {
        hasPermission: false,
        reason: 'Event not found',
      };
    }

    if (!event.isActive) {
      return {
        hasPermission: false,
        reason: 'Event is inactive',
      };
    }

    // Check if event is in the past
    const now = new Date();
    if (event.endDate < now) {
      return {
        hasPermission: false,
        reason: 'Cannot assign organizers to past events',
      };
    }

    // Check organizer role restrictions (if any)
    if (organizer.role === 'organizer') {
      // Regular organizers might have restrictions
      // For now, we allow all active organizers to be assigned
      return { hasPermission: true };
    }

    return { hasPermission: true };
  } catch (error) {
    console.error('Error validating organizer permissions:', error);
    return {
      hasPermission: false,
      reason: 'Error validating permissions',
    };
  }
}

/**
 * Get assignment statistics for validation
 */
export async function getAssignmentStatistics(
  organizerIds: string[],
  eventIds: string[]
): Promise<{
  organizerStats: Array<{
    organizerId: string;
    organizerEmail: string;
    currentAssignments: number;
    maxAssignments?: number;
  }>;
  eventStats: Array<{
    eventId: string;
    eventName: string;
    currentOrganizers: number;
    maxOrganizers?: number;
  }>;
}> {
  // Get organizer assignment counts
  const organizerStats = await Promise.all(
    organizerIds.map(async (organizerId) => {
      const organizer = await prisma.organizer.findUnique({
        where: { id: organizerId },
        select: { email: true },
      });

      const currentAssignments = await prisma.organizerEventAssignment.count({
        where: {
          organizerId,
          isActive: true,
        },
      });

      return {
        organizerId,
        organizerEmail: organizer?.email || 'Unknown',
        currentAssignments,
        // Could add maxAssignments logic here if needed
      };
    })
  );

  // Get event organizer counts
  const eventStats = await Promise.all(
    eventIds.map(async (eventId) => {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { name: true },
      });

      const currentOrganizers = await prisma.organizerEventAssignment.count({
        where: {
          eventId,
          isActive: true,
        },
      });

      return {
        eventId,
        eventName: event?.name || 'Unknown',
        currentOrganizers,
        // Could add maxOrganizers logic here if needed
      };
    })
  );

  return {
    organizerStats,
    eventStats,
  };
}

/**
 * Custom validation error messages
 */
export const assignmentValidationMessages = {
  DUPLICATE_ASSIGNMENT: 'Organizer is already assigned to this event',
  INACTIVE_ORGANIZER: 'Cannot assign inactive organizer',
  INACTIVE_EVENT: 'Cannot assign organizers to inactive event',
  NON_EXISTENT_ORGANIZER: 'Organizer not found',
  NON_EXISTENT_EVENT: 'Event not found',
  PAST_EVENT: 'Cannot assign organizers to past events',
  MAX_ASSIGNMENTS_REACHED: 'Organizer has reached maximum assignment limit',
  MAX_ORGANIZERS_REACHED: 'Event has reached maximum organizer limit',
  PERMISSION_DENIED: 'Organizer does not have permission for this event',
} as const;

/**
 * Generate human-readable conflict summary
 */
export function generateConflictSummary(conflicts: AssignmentConflictResult['conflicts']): string[] {
  const messages: string[] = [];

  if (conflicts.duplicateAssignments.length > 0) {
    messages.push(
      `${conflicts.duplicateAssignments.length} organizer(s) are already assigned to the specified event(s)`
    );
  }

  if (conflicts.inactiveOrganizers.length > 0) {
    messages.push(
      `${conflicts.inactiveOrganizers.length} organizer(s) are inactive`
    );
  }

  if (conflicts.nonExistentOrganizers.length > 0) {
    messages.push(
      `${conflicts.nonExistentOrganizers.length} organizer(s) not found`
    );
  }

  if (conflicts.nonExistentEvents.length > 0) {
    messages.push(
      `${conflicts.nonExistentEvents.length} event(s) not found`
    );
  }

  if (conflicts.inactiveEvents.length > 0) {
    messages.push(
      `${conflicts.inactiveEvents.length} event(s) are inactive`
    );
  }

  return messages;
}
