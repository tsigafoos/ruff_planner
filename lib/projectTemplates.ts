import { ProjectType, TaskStatus, ProjectPhase, MaintenanceCategory } from '@/types';

// Template task definition
export interface TemplateTask {
  title: string;
  description?: string;
  priority: 1 | 2 | 3 | 4;
  dueOffsetDays: number; // Days from project start
  startOffsetDays?: number; // Days from project start
  phase?: ProjectPhase; // For Agile projects
  category?: MaintenanceCategory; // For Maintenance projects
  status?: TaskStatus;
}

// Project template definition
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: TemplateCategory;
  projectType: ProjectType;
  tasks: TemplateTask[];
  estimatedDays: number;
}

// Template categories
export type TemplateCategory = 
  | 'software'
  | 'marketing'
  | 'operations'
  | 'personal'
  | 'design'
  | 'business';

// Category metadata
export const TEMPLATE_CATEGORIES: Record<TemplateCategory, { label: string; icon: string; color: string }> = {
  software: { label: 'Software Development', icon: 'code', color: '#6366F1' },
  marketing: { label: 'Marketing', icon: 'bullhorn', color: '#EC4899' },
  operations: { label: 'Operations', icon: 'cogs', color: '#F59E0B' },
  personal: { label: 'Personal', icon: 'user', color: '#10B981' },
  design: { label: 'Design', icon: 'paint-brush', color: '#8B5CF6' },
  business: { label: 'Business', icon: 'briefcase', color: '#3B82F6' },
};

// ============================================
// SOFTWARE DEVELOPMENT TEMPLATES
// ============================================

const launchMvpTemplate: ProjectTemplate = {
  id: 'launch-mvp',
  name: 'Launch MVP',
  description: 'Build and launch a minimum viable product',
  icon: 'rocket',
  color: '#6366F1',
  category: 'software',
  projectType: 'agile',
  estimatedDays: 60,
  tasks: [
    // Brainstorm Phase
    { title: 'Define product vision', description: 'Create a clear vision statement for the product', priority: 1, dueOffsetDays: 3, phase: 'brainstorm' },
    { title: 'Identify target users', description: 'Define user personas and their needs', priority: 1, dueOffsetDays: 5, phase: 'brainstorm' },
    { title: 'List core features', description: 'Identify must-have features for MVP', priority: 1, dueOffsetDays: 7, phase: 'brainstorm' },
    { title: 'Competitive analysis', description: 'Research competitors and market', priority: 2, dueOffsetDays: 7, phase: 'brainstorm' },
    
    // Design Phase
    { title: 'Create user flow diagrams', description: 'Map out the user journey', priority: 1, dueOffsetDays: 14, phase: 'design' },
    { title: 'Design wireframes', description: 'Create low-fidelity wireframes', priority: 1, dueOffsetDays: 18, phase: 'design' },
    { title: 'Create UI mockups', description: 'Design high-fidelity mockups', priority: 1, dueOffsetDays: 25, phase: 'design' },
    { title: 'Design system setup', description: 'Define colors, typography, components', priority: 2, dueOffsetDays: 25, phase: 'design' },
    
    // Logic Phase
    { title: 'Set up development environment', description: 'Configure dev tools and repos', priority: 1, dueOffsetDays: 28, phase: 'logic' },
    { title: 'Build authentication', description: 'Implement user login/signup', priority: 1, dueOffsetDays: 35, phase: 'logic' },
    { title: 'Implement core feature 1', description: 'Build first core feature', priority: 1, dueOffsetDays: 42, phase: 'logic' },
    { title: 'Implement core feature 2', description: 'Build second core feature', priority: 1, dueOffsetDays: 49, phase: 'logic' },
    { title: 'API integration', description: 'Connect to required APIs', priority: 2, dueOffsetDays: 49, phase: 'logic' },
    
    // Polish Phase
    { title: 'Bug fixes and testing', description: 'Fix bugs and run tests', priority: 1, dueOffsetDays: 53, phase: 'polish' },
    { title: 'Performance optimization', description: 'Optimize loading and performance', priority: 2, dueOffsetDays: 55, phase: 'polish' },
    { title: 'User testing', description: 'Conduct user testing sessions', priority: 1, dueOffsetDays: 57, phase: 'polish' },
    { title: 'Prepare launch materials', description: 'Create landing page, docs', priority: 2, dueOffsetDays: 58, phase: 'polish' },
    { title: 'Deploy to production', description: 'Launch the MVP', priority: 1, dueOffsetDays: 60, phase: 'polish' },
  ],
};

const bugFixSprintTemplate: ProjectTemplate = {
  id: 'bug-fix-sprint',
  name: 'Bug Fix Sprint',
  description: 'Focused sprint to fix known issues',
  icon: 'bug',
  color: '#EF4444',
  category: 'software',
  projectType: 'maintenance',
  estimatedDays: 14,
  tasks: [
    { title: 'Triage all open bugs', description: 'Review and prioritize all reported bugs', priority: 1, dueOffsetDays: 1, category: 'bug' },
    { title: 'Set up bug tracking board', description: 'Organize bugs by severity and area', priority: 2, dueOffsetDays: 1, category: 'other' },
    { title: 'Fix critical bugs', description: 'Address all P1 critical issues', priority: 1, dueOffsetDays: 5, category: 'bug' },
    { title: 'Fix high-priority bugs', description: 'Address all P2 high issues', priority: 1, dueOffsetDays: 8, category: 'bug' },
    { title: 'Fix medium-priority bugs', description: 'Address P3 medium issues', priority: 2, dueOffsetDays: 11, category: 'bug' },
    { title: 'Regression testing', description: 'Test all fixed bugs', priority: 1, dueOffsetDays: 12, category: 'other' },
    { title: 'Update documentation', description: 'Document fixes and known issues', priority: 3, dueOffsetDays: 13, category: 'other' },
    { title: 'Deploy fixes', description: 'Release bug fix update', priority: 1, dueOffsetDays: 14, category: 'other' },
  ],
};

const featureRolloutTemplate: ProjectTemplate = {
  id: 'feature-rollout',
  name: 'Feature Rollout',
  description: 'Plan and execute a new feature release',
  icon: 'flag-checkered',
  color: '#10B981',
  category: 'software',
  projectType: 'waterfall',
  estimatedDays: 45,
  tasks: [
    // Planning
    { title: 'Define feature requirements', description: 'Document detailed requirements', priority: 1, dueOffsetDays: 5, startOffsetDays: 0 },
    { title: 'Create technical spec', description: 'Write technical specification', priority: 1, dueOffsetDays: 8, startOffsetDays: 5 },
    { title: 'Estimate effort', description: 'Break down and estimate tasks', priority: 2, dueOffsetDays: 10, startOffsetDays: 8 },
    
    // Development
    { title: 'Backend development', description: 'Build backend functionality', priority: 1, dueOffsetDays: 25, startOffsetDays: 10 },
    { title: 'Frontend development', description: 'Build frontend UI', priority: 1, dueOffsetDays: 30, startOffsetDays: 15 },
    { title: 'Integration testing', description: 'Test feature integration', priority: 1, dueOffsetDays: 33, startOffsetDays: 30 },
    
    // QA
    { title: 'QA testing', description: 'Full QA test cycle', priority: 1, dueOffsetDays: 38, startOffsetDays: 33 },
    { title: 'Fix QA issues', description: 'Address QA findings', priority: 1, dueOffsetDays: 40, startOffsetDays: 38 },
    
    // Rollout
    { title: 'Create release notes', description: 'Document changes for users', priority: 2, dueOffsetDays: 42, startOffsetDays: 40 },
    { title: 'Beta rollout', description: 'Release to beta users', priority: 1, dueOffsetDays: 43, startOffsetDays: 42 },
    { title: 'Monitor and fix', description: 'Monitor beta and fix issues', priority: 1, dueOffsetDays: 44, startOffsetDays: 43 },
    { title: 'Full release', description: 'Release to all users', priority: 1, dueOffsetDays: 45, startOffsetDays: 44 },
  ],
};

// ============================================
// MARKETING TEMPLATES
// ============================================

const campaignLaunchTemplate: ProjectTemplate = {
  id: 'campaign-launch',
  name: 'Campaign Launch',
  description: 'Plan and execute a marketing campaign',
  icon: 'bullhorn',
  color: '#EC4899',
  category: 'marketing',
  projectType: 'waterfall',
  estimatedDays: 30,
  tasks: [
    { title: 'Define campaign goals', description: 'Set clear, measurable objectives', priority: 1, dueOffsetDays: 2, startOffsetDays: 0 },
    { title: 'Identify target audience', description: 'Define audience segments', priority: 1, dueOffsetDays: 4, startOffsetDays: 2 },
    { title: 'Develop messaging', description: 'Create key messages and copy', priority: 1, dueOffsetDays: 8, startOffsetDays: 4 },
    { title: 'Design creative assets', description: 'Create visuals and graphics', priority: 1, dueOffsetDays: 14, startOffsetDays: 8 },
    { title: 'Set up landing pages', description: 'Build campaign landing pages', priority: 1, dueOffsetDays: 18, startOffsetDays: 14 },
    { title: 'Configure email sequences', description: 'Set up email automation', priority: 2, dueOffsetDays: 20, startOffsetDays: 18 },
    { title: 'Set up ad campaigns', description: 'Configure paid advertising', priority: 2, dueOffsetDays: 22, startOffsetDays: 18 },
    { title: 'Internal review', description: 'Review all materials', priority: 1, dueOffsetDays: 25, startOffsetDays: 22 },
    { title: 'Launch campaign', description: 'Go live with campaign', priority: 1, dueOffsetDays: 27, startOffsetDays: 25 },
    { title: 'Monitor and optimize', description: 'Track results and adjust', priority: 1, dueOffsetDays: 30, startOffsetDays: 27 },
  ],
};

const contentCalendarTemplate: ProjectTemplate = {
  id: 'content-calendar',
  name: 'Content Calendar',
  description: 'Monthly content planning and creation',
  icon: 'calendar',
  color: '#8B5CF6',
  category: 'marketing',
  projectType: 'maintenance',
  estimatedDays: 30,
  tasks: [
    { title: 'Content audit', description: 'Review existing content performance', priority: 2, dueOffsetDays: 2, category: 'other' },
    { title: 'Keyword research', description: 'Research target keywords', priority: 2, dueOffsetDays: 4, category: 'other' },
    { title: 'Plan content topics', description: 'Create list of content ideas', priority: 1, dueOffsetDays: 6, category: 'other' },
    { title: 'Write blog post 1', description: 'Create first blog post', priority: 1, dueOffsetDays: 10, category: 'other' },
    { title: 'Write blog post 2', description: 'Create second blog post', priority: 1, dueOffsetDays: 15, category: 'other' },
    { title: 'Write blog post 3', description: 'Create third blog post', priority: 2, dueOffsetDays: 20, category: 'other' },
    { title: 'Create social media posts', description: 'Design social content', priority: 2, dueOffsetDays: 22, category: 'other' },
    { title: 'Schedule all content', description: 'Schedule posts and articles', priority: 1, dueOffsetDays: 25, category: 'other' },
    { title: 'Review analytics', description: 'Analyze content performance', priority: 2, dueOffsetDays: 30, category: 'other' },
  ],
};

// ============================================
// OPERATIONS TEMPLATES
// ============================================

const onboardingChecklistTemplate: ProjectTemplate = {
  id: 'onboarding-checklist',
  name: 'Employee Onboarding',
  description: 'New employee onboarding checklist',
  icon: 'user-plus',
  color: '#10B981',
  category: 'operations',
  projectType: 'waterfall',
  estimatedDays: 14,
  tasks: [
    { title: 'Send welcome email', description: 'Send welcome package info', priority: 1, dueOffsetDays: -2, startOffsetDays: -2 },
    { title: 'Set up workstation', description: 'Prepare desk and equipment', priority: 1, dueOffsetDays: 0, startOffsetDays: -1 },
    { title: 'Create accounts', description: 'Set up email, Slack, tools', priority: 1, dueOffsetDays: 0, startOffsetDays: -1 },
    { title: 'Prepare welcome kit', description: 'Gather swag and materials', priority: 2, dueOffsetDays: 0, startOffsetDays: -1 },
    { title: 'Day 1: Office tour', description: 'Show around the office', priority: 1, dueOffsetDays: 1, startOffsetDays: 1 },
    { title: 'Day 1: HR paperwork', description: 'Complete all HR forms', priority: 1, dueOffsetDays: 1, startOffsetDays: 1 },
    { title: 'Day 1: Team introductions', description: 'Meet the team', priority: 1, dueOffsetDays: 1, startOffsetDays: 1 },
    { title: 'Day 2-3: Training sessions', description: 'Initial training', priority: 1, dueOffsetDays: 3, startOffsetDays: 2 },
    { title: 'Week 1: Shadow colleague', description: 'Learn by observation', priority: 2, dueOffsetDays: 5, startOffsetDays: 3 },
    { title: 'Week 1: First task assignment', description: 'Assign starter project', priority: 2, dueOffsetDays: 5, startOffsetDays: 4 },
    { title: 'Week 2: Check-in meeting', description: '1:1 with manager', priority: 1, dueOffsetDays: 10, startOffsetDays: 10 },
    { title: 'Week 2: Complete onboarding docs', description: 'Finish documentation', priority: 2, dueOffsetDays: 14, startOffsetDays: 7 },
  ],
};

const quarterlyReviewTemplate: ProjectTemplate = {
  id: 'quarterly-review',
  name: 'Quarterly Review',
  description: 'Quarterly business review process',
  icon: 'line-chart',
  color: '#3B82F6',
  category: 'operations',
  projectType: 'waterfall',
  estimatedDays: 21,
  tasks: [
    { title: 'Gather financial data', description: 'Collect Q revenue and expenses', priority: 1, dueOffsetDays: 5, startOffsetDays: 0 },
    { title: 'Compile KPI metrics', description: 'Gather all key metrics', priority: 1, dueOffsetDays: 5, startOffsetDays: 0 },
    { title: 'Department reports', description: 'Collect reports from each dept', priority: 1, dueOffsetDays: 8, startOffsetDays: 3 },
    { title: 'Customer feedback summary', description: 'Summarize customer insights', priority: 2, dueOffsetDays: 8, startOffsetDays: 3 },
    { title: 'Create presentation', description: 'Build review presentation', priority: 1, dueOffsetDays: 14, startOffsetDays: 8 },
    { title: 'Executive review prep', description: 'Prepare for exec meeting', priority: 1, dueOffsetDays: 16, startOffsetDays: 14 },
    { title: 'Quarterly review meeting', description: 'Present to leadership', priority: 1, dueOffsetDays: 18, startOffsetDays: 18 },
    { title: 'Action items follow-up', description: 'Document action items', priority: 1, dueOffsetDays: 19, startOffsetDays: 18 },
    { title: 'Share summary with team', description: 'Communicate key points', priority: 2, dueOffsetDays: 21, startOffsetDays: 19 },
  ],
};

// ============================================
// PERSONAL TEMPLATES
// ============================================

const vacationPlanningTemplate: ProjectTemplate = {
  id: 'vacation-planning',
  name: 'Vacation Planning',
  description: 'Plan your perfect vacation',
  icon: 'plane',
  color: '#06B6D4',
  category: 'personal',
  projectType: 'waterfall',
  estimatedDays: 60,
  tasks: [
    { title: 'Choose destination', description: 'Research and pick where to go', priority: 1, dueOffsetDays: 7, startOffsetDays: 0 },
    { title: 'Set budget', description: 'Determine total trip budget', priority: 1, dueOffsetDays: 7, startOffsetDays: 0 },
    { title: 'Book flights', description: 'Search and book flights', priority: 1, dueOffsetDays: 14, startOffsetDays: 7 },
    { title: 'Book accommodation', description: 'Reserve hotels/rentals', priority: 1, dueOffsetDays: 14, startOffsetDays: 7 },
    { title: 'Plan itinerary', description: 'Research activities and sights', priority: 2, dueOffsetDays: 30, startOffsetDays: 14 },
    { title: 'Book activities', description: 'Reserve tours and experiences', priority: 2, dueOffsetDays: 40, startOffsetDays: 30 },
    { title: 'Check travel documents', description: 'Verify passport, visas', priority: 1, dueOffsetDays: 45, startOffsetDays: 14 },
    { title: 'Arrange pet/house care', description: 'Set up care while away', priority: 2, dueOffsetDays: 50, startOffsetDays: 30 },
    { title: 'Pack bags', description: 'Pack luggage', priority: 1, dueOffsetDays: 58, startOffsetDays: 57 },
    { title: 'Final preparations', description: 'Last-minute checks', priority: 1, dueOffsetDays: 60, startOffsetDays: 59 },
  ],
};

const eventPlanningTemplate: ProjectTemplate = {
  id: 'event-planning',
  name: 'Event Planning',
  description: 'Plan a party or event',
  icon: 'birthday-cake',
  color: '#F59E0B',
  category: 'personal',
  projectType: 'waterfall',
  estimatedDays: 30,
  tasks: [
    { title: 'Set date and budget', description: 'Pick date and set budget', priority: 1, dueOffsetDays: 2, startOffsetDays: 0 },
    { title: 'Create guest list', description: 'List all invitees', priority: 1, dueOffsetDays: 5, startOffsetDays: 2 },
    { title: 'Choose venue', description: 'Find and book location', priority: 1, dueOffsetDays: 10, startOffsetDays: 5 },
    { title: 'Send invitations', description: 'Send out invites', priority: 1, dueOffsetDays: 12, startOffsetDays: 10 },
    { title: 'Plan menu', description: 'Decide on food and drinks', priority: 1, dueOffsetDays: 18, startOffsetDays: 12 },
    { title: 'Order decorations', description: 'Buy decorations and supplies', priority: 2, dueOffsetDays: 20, startOffsetDays: 15 },
    { title: 'Arrange entertainment', description: 'Book music, activities', priority: 2, dueOffsetDays: 22, startOffsetDays: 15 },
    { title: 'Confirm RSVPs', description: 'Follow up on responses', priority: 1, dueOffsetDays: 25, startOffsetDays: 20 },
    { title: 'Final headcount', description: 'Finalize numbers', priority: 1, dueOffsetDays: 27, startOffsetDays: 25 },
    { title: 'Set up venue', description: 'Decorate and prepare', priority: 1, dueOffsetDays: 30, startOffsetDays: 29 },
  ],
};

// ============================================
// EXPORT ALL TEMPLATES
// ============================================

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  // Software
  launchMvpTemplate,
  bugFixSprintTemplate,
  featureRolloutTemplate,
  // Marketing
  campaignLaunchTemplate,
  contentCalendarTemplate,
  // Operations
  onboardingChecklistTemplate,
  quarterlyReviewTemplate,
  // Personal
  vacationPlanningTemplate,
  eventPlanningTemplate,
];

// Get templates by category
export const getTemplatesByCategory = (category: TemplateCategory): ProjectTemplate[] => {
  return PROJECT_TEMPLATES.filter(t => t.category === category);
};

// Get template by ID
export const getTemplateById = (id: string): ProjectTemplate | undefined => {
  return PROJECT_TEMPLATES.find(t => t.id === id);
};

// Calculate task dates from project start date
export const calculateTaskDates = (template: ProjectTemplate, projectStartDate: Date): Array<TemplateTask & { dueDate: Date; startDate?: Date }> => {
  return template.tasks.map(task => {
    const dueDate = new Date(projectStartDate);
    dueDate.setDate(dueDate.getDate() + task.dueOffsetDays);
    
    let startDate: Date | undefined;
    if (task.startOffsetDays !== undefined) {
      startDate = new Date(projectStartDate);
      startDate.setDate(startDate.getDate() + task.startOffsetDays);
    }
    
    return {
      ...task,
      dueDate,
      startDate,
    };
  });
};
