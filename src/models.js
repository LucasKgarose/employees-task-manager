// User roles
export const ROLES = {
  ORG_ADMIN: 'org_admin',
  MANAGER: 'manager',
  ATTORNEY: 'attorney',
  DEBT_COLLECTOR: 'debt_collector',
  CANDIDATE_ATTORNEY: 'candidate_attorney',
  OFFICE_MANAGER: 'office_manager',
  CONSULTING_MANAGER: 'consulting_manager',
  LEGAL_MANAGER: 'legal_manager',
  EMPLOYEE: 'employee',
};

// User object example
export const exampleUser = {
  id: 'user_123',
  name: 'Jane Doe',
  email: 'jane@example.com',
  role: ROLES.ATTORNEY,
};

// Task object example
export const exampleTask = {
  id: 'task_001',
  title: 'Draft contract',
  description: 'Draft a contract for client X',
  dueDate: '2025-12-15',
  status: 'pending', // 'pending' | 'in-progress' | 'completed' | 'approved'
  assignee: exampleUser, // or user id reference
  reviewer: exampleUser, // or user id reference
  estimateHours: 4,
  actualHours: 5,
  notes: 'Client requested urgent delivery',
  createdBy: exampleUser, // or user id reference
  createdAt: '2025-12-10T10:00:00Z',
  updatedAt: '2025-12-12T12:00:00Z',
};

// Timesheet object example
export const exampleTimesheet = {
  id: 'timesheet_001',
  employee: exampleUser, // or user id reference
  weekStart: '2025-12-08', // Monday
  weekEnd: '2025-12-14', // Sunday
  tasks: [exampleTask], // array of task objects or ids
  lunchHours: 5, // Total lunch hours for the week
  comments: 'Good progress this week',
  approved: false,
  approvedBy: null, // user object or id
  approvedAt: null, // date string
};

// Organization object example (Phase 2)
export const exampleOrganization = {
  id: 'org_001',
  name: 'ABC Law Firm',
  requiredWeeklyHours: 45, // Configurable by org admin
  admins: ['user_id_1', 'user_id_2'],
  createdAt: '2025-12-01T10:00:00Z',
};
