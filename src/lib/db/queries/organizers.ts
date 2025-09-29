import { prisma } from '../client';

/**
 * Count total organizers
 */
export async function countOrganizers(filters: {
  isActive?: boolean;
  role?: 'organizer' | 'admin';
} = {}) {
  try {
    const where = {
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters.role && { role: filters.role }),
    };

    return await prisma.organizer.count({ where });
  } catch (error) {
    console.error('Error counting organizers:', error);
    return 0;
  }
}

/**
 * Get organizer statistics
 */
export async function getOrganizerStats() {
  try {
    const [
      totalOrganizers,
      activeOrganizers,
      inactiveOrganizers,
      adminOrganizers,
      organizerRole,
      pendingInvitations,
    ] = await Promise.all([
      countOrganizers(),
      countOrganizers({ isActive: true }),
      countOrganizers({ isActive: false }),
      countOrganizers({ role: 'admin' }),
      countOrganizers({ role: 'organizer' }),
      // Count organizers who have never logged in (pending invitations)
      prisma.organizer.count({
        where: {
          lastLoginAt: null,
          isActive: true,
        },
      }),
    ]);

    return {
      total: totalOrganizers,
      active: activeOrganizers,
      inactive: inactiveOrganizers,
      admin: adminOrganizers,
      organizer: organizerRole,
      pendingInvitations,
    };
  } catch (error) {
    console.error('Error fetching organizer statistics:', error);
    return {
      total: 0,
      active: 0,
      inactive: 0,
      admin: 0,
      organizer: 0,
      pendingInvitations: 0,
    };
  }
}

/**
 * Get organizers with recent activity
 */
export async function getOrganizersWithActivity(limit = 10) {
  try {
    return await prisma.organizer.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: {
        lastLoginAt: {
          sort: 'desc',
          nulls: 'last',
        },
      },
      take: limit,
    });
  } catch (error) {
    console.error('Error fetching organizers with activity:', error);
    return [];
  }
}

/**
 * Get organizer assignment statistics
 */
export async function getOrganizerAssignmentStats() {
  try {
    const [
      totalAssignments,
      organizersWithAssignments,
      eventsWithOrganizers,
    ] = await Promise.all([
      prisma.organizerEventAssignment.count({
        where: { isActive: true },
      }),
      prisma.organizer.count({
        where: {
          isActive: true,
          eventAssignments: {
            some: {
              isActive: true,
            },
          },
        },
      }),
      prisma.event.count({
        where: {
          organizerAssignments: {
            some: {
              isActive: true,
            },
          },
        },
      }),
    ]);

    return {
      totalAssignments,
      organizersWithAssignments,
      eventsWithOrganizers,
    };
  } catch (error) {
    console.error('Error fetching organizer assignment statistics:', error);
    return {
      totalAssignments: 0,
      organizersWithAssignments: 0,
      eventsWithOrganizers: 0,
    };
  }
}
