import { create } from 'zustand';
import { 
  DashboardLayout, 
  DashboardRow, 
  DashboardWidget, 
  DashboardTemplate,
  WidgetType,
  WidgetWidth,
  WidgetCatalogEntry,
} from '@/types';

// Widget catalog - available widgets for the dashboard
export const WIDGET_CATALOG: WidgetCatalogEntry[] = [
  {
    type: 'gantt',
    name: 'Gantt Chart',
    description: 'Timeline visualization of tasks',
    icon: 'bar-chart',
    defaultWidth: '100%',
    supportedWidths: ['50%', '66%', '75%', '100%'],
    category: 'charts',
  },
  {
    type: 'burndown',
    name: 'Burndown Chart',
    description: 'Sprint burndown progress',
    icon: 'line-chart',
    defaultWidth: '50%',
    supportedWidths: ['33%', '50%', '66%', '100%'],
    category: 'charts',
  },
  {
    type: 'dependency-flow',
    name: 'Dependency Flowchart',
    description: 'Task dependency visualization',
    icon: 'sitemap',
    defaultWidth: '100%',
    supportedWidths: ['50%', '66%', '75%', '100%'],
    category: 'charts',
  },
  {
    type: 'kanban',
    name: 'Kanban Board',
    description: 'Drag-and-drop task columns',
    icon: 'columns',
    defaultWidth: '100%',
    supportedWidths: ['66%', '75%', '100%'],
    category: 'tasks',
  },
  {
    type: 'status-lanes',
    name: 'Status Lanes',
    description: 'Horizontal task lanes by status',
    icon: 'bars',
    defaultWidth: '100%',
    supportedWidths: ['50%', '66%', '75%', '100%'],
    category: 'tasks',
  },
  {
    type: 'task-list',
    name: 'Task List',
    description: 'Simple task list view',
    icon: 'list',
    defaultWidth: '50%',
    supportedWidths: ['33%', '50%', '66%', '100%'],
    category: 'tasks',
  },
  {
    type: 'calendar',
    name: 'Task Calendar',
    description: 'Calendar with task indicators',
    icon: 'calendar',
    defaultWidth: '50%',
    supportedWidths: ['33%', '50%', '66%', '100%'],
    category: 'tasks',
  },
  {
    type: 'mini-calendar',
    name: 'Mini Calendar',
    description: 'Compact calendar widget',
    icon: 'calendar-o',
    defaultWidth: '33%',
    supportedWidths: ['25%', '33%', '50%'],
    category: 'tasks',
  },
  {
    type: 'info-cards',
    name: 'Info Cards',
    description: 'Metrics and statistics display',
    icon: 'info-circle',
    defaultWidth: '100%',
    supportedWidths: ['50%', '66%', '75%', '100%'],
    category: 'info',
  },
  {
    type: 'project-list',
    name: 'Project List',
    description: 'List of projects with status',
    icon: 'folder',
    defaultWidth: '50%',
    supportedWidths: ['33%', '50%', '66%', '100%'],
    category: 'info',
  },
  {
    type: 'team-quick',
    name: 'Team Quick Actions',
    description: 'Quick team management',
    icon: 'users',
    defaultWidth: '33%',
    supportedWidths: ['25%', '33%', '50%'],
    category: 'team',
  },
  {
    type: 'team-waiting',
    name: 'Team Waiting List',
    description: "Who's waiting on what",
    icon: 'clock-o',
    defaultWidth: '50%',
    supportedWidths: ['33%', '50%', '66%'],
    category: 'team',
  },
];

// Default dashboard templates
export const DASHBOARD_TEMPLATES: Record<DashboardTemplate, DashboardRow[]> = {
  agile: [
    {
      id: 'agile-row-1',
      widgets: [
        { id: 'agile-w1', type: 'info-cards', width: '100%' },
      ],
    },
    {
      id: 'agile-row-2',
      widgets: [
        { id: 'agile-w2', type: 'kanban', width: '100%' },
      ],
    },
    {
      id: 'agile-row-3',
      widgets: [
        { id: 'agile-w3', type: 'burndown', width: '50%' },
        { id: 'agile-w4', type: 'team-waiting', width: '50%' },
      ],
    },
  ],
  waterfall: [
    {
      id: 'waterfall-row-1',
      widgets: [
        { id: 'waterfall-w1', type: 'info-cards', width: '100%' },
      ],
    },
    {
      id: 'waterfall-row-2',
      widgets: [
        { id: 'waterfall-w2', type: 'gantt', width: '100%' },
      ],
    },
    {
      id: 'waterfall-row-3',
      widgets: [
        { id: 'waterfall-w3', type: 'status-lanes', width: '66%' },
        { id: 'waterfall-w4', type: 'mini-calendar', width: '33%' },
      ],
    },
  ],
  maintenance: [
    {
      id: 'maintenance-row-1',
      widgets: [
        { id: 'maint-w1', type: 'info-cards', width: '100%' },
      ],
    },
    {
      id: 'maintenance-row-2',
      widgets: [
        { id: 'maint-w2', type: 'task-list', width: '50%' },
        { id: 'maint-w3', type: 'team-waiting', width: '50%' },
      ],
    },
    {
      id: 'maintenance-row-3',
      widgets: [
        { id: 'maint-w4', type: 'status-lanes', width: '100%' },
      ],
    },
  ],
  custom: [],
  blank: [],
};

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 11);

interface DashboardStore {
  // State
  layouts: DashboardLayout[];
  currentLayout: DashboardLayout | null;
  editMode: boolean;
  loading: boolean;
  
  // Actions
  setEditMode: (editing: boolean) => void;
  setCurrentLayout: (layout: DashboardLayout | null) => void;
  
  // Layout CRUD
  createLayout: (name: string, template: DashboardTemplate, projectId?: string, userId?: string) => DashboardLayout;
  updateLayout: (layoutId: string, updates: Partial<DashboardLayout>) => void;
  deleteLayout: (layoutId: string) => void;
  
  // Widget management
  addWidget: (rowId: string, widget: Omit<DashboardWidget, 'id'>) => void;
  updateWidget: (widgetId: string, updates: Partial<DashboardWidget>) => void;
  removeWidget: (widgetId: string) => void;
  moveWidget: (widgetId: string, targetRowId: string, targetIndex: number) => void;
  
  // Row management
  addRow: (index?: number) => void;
  removeRow: (rowId: string) => void;
  moveRow: (rowId: string, direction: 'up' | 'down') => void;
  
  // Template
  applyTemplate: (template: DashboardTemplate) => void;
  resetToTemplate: () => void;
  
  // Persistence
  saveLayout: () => Promise<void>;
  loadLayout: (projectId?: string, userId?: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  layouts: [],
  currentLayout: null,
  editMode: false,
  loading: false,
  
  setEditMode: (editing) => set({ editMode: editing }),
  
  setCurrentLayout: (layout) => set({ currentLayout: layout }),
  
  createLayout: (name, template, projectId, userId) => {
    const templateRows = DASHBOARD_TEMPLATES[template] || [];
    const layout: DashboardLayout = {
      id: generateId(),
      name,
      template,
      projectId,
      userId: userId || '',
      rows: JSON.parse(JSON.stringify(templateRows)), // Deep copy
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state) => ({
      layouts: [...state.layouts, layout],
      currentLayout: layout,
    }));
    
    return layout;
  },
  
  updateLayout: (layoutId, updates) => {
    set((state) => {
      const layouts = state.layouts.map((l) =>
        l.id === layoutId ? { ...l, ...updates, updatedAt: new Date() } : l
      );
      const currentLayout = state.currentLayout?.id === layoutId
        ? { ...state.currentLayout, ...updates, updatedAt: new Date() }
        : state.currentLayout;
      return { layouts, currentLayout };
    });
  },
  
  deleteLayout: (layoutId) => {
    set((state) => ({
      layouts: state.layouts.filter((l) => l.id !== layoutId),
      currentLayout: state.currentLayout?.id === layoutId ? null : state.currentLayout,
    }));
  },
  
  addWidget: (rowId, widget) => {
    set((state) => {
      if (!state.currentLayout) return state;
      
      const newWidget: DashboardWidget = {
        ...widget,
        id: generateId(),
      };
      
      const rows = state.currentLayout.rows.map((row) => {
        if (row.id === rowId) {
          return { ...row, widgets: [...row.widgets, newWidget] };
        }
        return row;
      });
      
      return {
        currentLayout: { ...state.currentLayout, rows, updatedAt: new Date() },
      };
    });
  },
  
  updateWidget: (widgetId, updates) => {
    set((state) => {
      if (!state.currentLayout) return state;
      
      const rows = state.currentLayout.rows.map((row) => ({
        ...row,
        widgets: row.widgets.map((w) =>
          w.id === widgetId ? { ...w, ...updates } : w
        ),
      }));
      
      return {
        currentLayout: { ...state.currentLayout, rows, updatedAt: new Date() },
      };
    });
  },
  
  removeWidget: (widgetId) => {
    set((state) => {
      if (!state.currentLayout) return state;
      
      const rows = state.currentLayout.rows.map((row) => ({
        ...row,
        widgets: row.widgets.filter((w) => w.id !== widgetId),
      }));
      
      return {
        currentLayout: { ...state.currentLayout, rows, updatedAt: new Date() },
      };
    });
  },
  
  moveWidget: (widgetId, targetRowId, targetIndex) => {
    set((state) => {
      if (!state.currentLayout) return state;
      
      // Find and remove widget from current position
      let movedWidget: DashboardWidget | null = null;
      let rows = state.currentLayout.rows.map((row) => {
        const widgetIndex = row.widgets.findIndex((w) => w.id === widgetId);
        if (widgetIndex !== -1) {
          movedWidget = row.widgets[widgetIndex];
          return {
            ...row,
            widgets: row.widgets.filter((w) => w.id !== widgetId),
          };
        }
        return row;
      });
      
      if (!movedWidget) return state;
      
      // Insert widget at new position
      rows = rows.map((row) => {
        if (row.id === targetRowId) {
          const newWidgets = [...row.widgets];
          newWidgets.splice(targetIndex, 0, movedWidget!);
          return { ...row, widgets: newWidgets };
        }
        return row;
      });
      
      return {
        currentLayout: { ...state.currentLayout, rows, updatedAt: new Date() },
      };
    });
  },
  
  addRow: (index) => {
    set((state) => {
      if (!state.currentLayout) return state;
      
      const newRow: DashboardRow = {
        id: generateId(),
        widgets: [],
      };
      
      const rows = [...state.currentLayout.rows];
      if (index !== undefined) {
        rows.splice(index, 0, newRow);
      } else {
        rows.push(newRow);
      }
      
      return {
        currentLayout: { ...state.currentLayout, rows, updatedAt: new Date() },
      };
    });
  },
  
  removeRow: (rowId) => {
    set((state) => {
      if (!state.currentLayout) return state;
      
      return {
        currentLayout: {
          ...state.currentLayout,
          rows: state.currentLayout.rows.filter((r) => r.id !== rowId),
          updatedAt: new Date(),
        },
      };
    });
  },
  
  moveRow: (rowId, direction) => {
    set((state) => {
      if (!state.currentLayout) return state;
      
      const rows = [...state.currentLayout.rows];
      const index = rows.findIndex((r) => r.id === rowId);
      if (index === -1) return state;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= rows.length) return state;
      
      [rows[index], rows[newIndex]] = [rows[newIndex], rows[index]];
      
      return {
        currentLayout: { ...state.currentLayout, rows, updatedAt: new Date() },
      };
    });
  },
  
  applyTemplate: (template) => {
    set((state) => {
      if (!state.currentLayout) return state;
      
      const templateRows = DASHBOARD_TEMPLATES[template] || [];
      
      return {
        currentLayout: {
          ...state.currentLayout,
          template,
          rows: JSON.parse(JSON.stringify(templateRows)),
          updatedAt: new Date(),
        },
      };
    });
  },
  
  resetToTemplate: () => {
    const { currentLayout } = get();
    if (currentLayout) {
      get().applyTemplate(currentLayout.template);
    }
  },
  
  saveLayout: async () => {
    const { currentLayout } = get();
    if (!currentLayout) return;
    
    // TODO: Save to Supabase
    // For now, save to localStorage
    try {
      const key = currentLayout.projectId 
        ? `dashboard-layout-${currentLayout.projectId}`
        : `dashboard-layout-user-${currentLayout.userId}`;
      localStorage.setItem(key, JSON.stringify(currentLayout));
    } catch (error) {
      console.error('Error saving layout:', error);
    }
  },
  
  loadLayout: async (projectId, userId) => {
    set({ loading: true });
    
    try {
      // TODO: Load from Supabase
      // For now, load from localStorage
      const key = projectId 
        ? `dashboard-layout-${projectId}`
        : `dashboard-layout-user-${userId}`;
      const stored = localStorage.getItem(key);
      
      if (stored) {
        const layout = JSON.parse(stored) as DashboardLayout;
        set({ currentLayout: layout, loading: false });
      } else {
        // Create default layout
        const template: DashboardTemplate = 'waterfall';
        get().createLayout('Default Dashboard', template, projectId, userId);
        set({ loading: false });
      }
    } catch (error) {
      console.error('Error loading layout:', error);
      set({ loading: false });
    }
  },
}));
