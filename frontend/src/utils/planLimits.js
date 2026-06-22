// Configuration for Zancrypt Plan Features

export const PLAN_LIMITS = {
  free: {
    name: 'Free',
    maxStorage: 2 * 1024 * 1024 * 1024, // 2 GB
    maxNodes: 3,
    maxShareLinks: 3,
    maxFileSize: 50 * 1024 * 1024, // 50 MB
    hasSelfDestruct: false,
    hasApiAccess: false,
  },
  pro: {
    name: 'Pro',
    maxStorage: 50 * 1024 * 1024 * 1024, // 50 GB
    maxNodes: 3,
    maxShareLinks: Infinity,
    maxFileSize: 500 * 1024 * 1024, // 500 MB
    hasSelfDestruct: true,
    hasApiAccess: false,
  },
  enterprise: {
    name: 'Enterprise',
    maxStorage: 500 * 1024 * 1024 * 1024, // 500 GB
    maxNodes: Infinity, // Custom node connectivity
    maxShareLinks: Infinity,
    maxFileSize: 5 * 1024 * 1024 * 1024, // 5 GB
    hasSelfDestruct: true,
    hasApiAccess: true,
  }
};

/**
 * Helper to determine the user's active plan.
 * Assumes user object might have a `plan` attribute.
 * Admins default to 'enterprise'.
 */
export const getUserPlan = (user) => {
  if (user?.role === 'admin') return 'enterprise';
  return user?.plan?.toLowerCase() || 'free'; // Defaults to free
};

/**
 * Returns the config for a given user.
 */
export const getUserPlanConfig = (user) => {
  const plan = getUserPlan(user);
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
};
