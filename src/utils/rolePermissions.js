import { ROLES } from '../models';

// Role hierarchy - higher number = more permissions
const ROLE_HIERARCHY = {
  [ROLES.ORG_ADMIN]: 100,
  [ROLES.LEGAL_MANAGER]: 80,
  [ROLES.CONSULTING_MANAGER]: 80,
  [ROLES.OFFICE_MANAGER]: 70,
  [ROLES.MANAGER]: 60,
  [ROLES.ATTORNEY]: 40,
  [ROLES.CANDIDATE_ATTORNEY]: 30,
  [ROLES.DEBT_COLLECTOR]: 30,
  [ROLES.EMPLOYEE]: 20,
};

/**
 * Check if a user can create tasks for another user
 * @param {string} creatorRole - Role of the user creating the task
 * @param {string} assigneeRole - Role of the user being assigned the task
 * @returns {boolean}
 */
export function canCreateTaskFor(creatorRole, assigneeRole) {
  // Org Admin can create for anyone
  if (creatorRole === ROLES.ORG_ADMIN) {
    return true;
  }

  // User can create tasks for themselves
  if (creatorRole === assigneeRole) {
    return true;
  }

  // User can create for anyone with lower role
  const creatorLevel = ROLE_HIERARCHY[creatorRole] || 0;
  const assigneeLevel = ROLE_HIERARCHY[assigneeRole] || 0;
  
  return creatorLevel > assigneeLevel;
}

/**
 * Check if a user can view tasks assigned to another user
 * @param {string} viewerRole - Role of the user viewing tasks
 * @param {string} assigneeRole - Role of the task assignee
 * @returns {boolean}
 */
export function canViewTasksFor(viewerRole, assigneeRole) {
  // Org Admin can view all tasks
  if (viewerRole === ROLES.ORG_ADMIN) {
    return true;
  }

  // Managers can view tasks of their subordinates
  const viewerLevel = ROLE_HIERARCHY[viewerRole] || 0;
  const assigneeLevel = ROLE_HIERARCHY[assigneeRole] || 0;
  
  return viewerLevel >= assigneeLevel;
}

/**
 * Check if a user can approve timesheets
 * @param {string} userRole - Role of the user
 * @returns {boolean}
 */
export function canApproveTimesheets(userRole) {
  return userRole === ROLES.ORG_ADMIN || 
         userRole === ROLES.MANAGER ||
         userRole === ROLES.LEGAL_MANAGER ||
         userRole === ROLES.CONSULTING_MANAGER ||
         userRole === ROLES.OFFICE_MANAGER;
}

/**
 * Get list of roles a user can assign tasks to
 * @param {string} userRole - Role of the user
 * @returns {string[]}
 */
export function getAssignableRoles(userRole) {
  if (userRole === ROLES.ORG_ADMIN) {
    return Object.keys(ROLES).map(key => ROLES[key]);
  }

  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const assignableRoles = Object.keys(ROLE_HIERARCHY)
    .filter(role => ROLE_HIERARCHY[role] <= userLevel);
  
  return assignableRoles;
}
