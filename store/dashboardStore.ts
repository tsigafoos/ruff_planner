import { create } from 'zustand';
import { 
  DashboardLayout, 
  DashboardRow, 
  DashboardWidget, 
  DashboardTemplate,
  DashboardScope,
  WidgetType,
  WidgetWidth,
  WidgetColumns,
  WidgetCatalogEntry,
} from '@/types';

// Widget catalog - available widgets for the dashboard
export const WIDGET_CATALOG: WidgetCatalogEntry[] = [
  // Charts - typically wide
  {
    type: 'gantt',
    name: 'Gantt Chart',
    description: 'Timeline visualization of tasks',
    icon: 'bar-chart',
    defaultWidth: '100%',
    defaultColumns: 12,
    minColumns: 6,
    maxColumns: 12,
    supportedWidths: ['50%', '66%', '75%', '100%'],
    category: 'charts',
  },
  {
    type: 'burndown',
    name: 'Burndown Chart',
    description: 'Sprint burndown progress',
    icon: 'line-chart',
    defaultWidth: '50%',
    defaultColumns: 6,
    minColumns: 4,
    maxColumns: 12,
    supportedWidths: ['33%', '50%', '66%', '100%'],
    category: 'charts',
  },
  {
    type: 'dependency-flow',
    name: 'Dependency Flowchart',
    description: 'Task dependency visualization',
    icon: 'sitemap',
    defaultWidth: '100%',
    defaultColumns: 12,
    minColumns: 6,
    maxColumns: 12,
    supportedWidths: ['50%', '66%', '75%', '100%'],
    category: 'charts',
  },
  // Tasks - various sizes
  {
    type: 'kanban',
    name: 'Kanban Board',
    description: 'Drag-and-drop task columns',
    icon: 'columns',
    defaultWidth: '100%',
    defaultColumns: 12,
    minColumns: 8,
    maxColumns: 12,
    supportedWidths: ['66%', '75%', '100%'],
    category: 'tasks',
  },
  {
    type: 'status-lanes',
    name: 'Status Lanes',
    description: 'Horizontal task lanes by status',
    icon: 'bars',
    defaultWidth: '100%',
    defaultColumns: 12,
    minColumns: 6,
    maxColumns: 12,
    supportedWidths: ['50%', '66%', '75%', '100%'],
    category: 'tasks',
  },
  {
    type: 'task-list',
    name: 'Task List',
    description: 'Simple task list view',
    icon: 'list',
    defaultWidth: '50%',
    defaultColumns: 6,
    minColumns: 3,
    maxColumns: 12,
    supportedWidths: ['33%', '50%', '66%', '100%'],
    category: 'tasks',
  },
  {
    type: 'calendar',
    name: 'Task Calendar',
    description: 'Calendar with task indicators',
    icon: 'calendar',
    defaultWidth: '50%',
    defaultColumns: 6,
    minColumns: 4,
    maxColumns: 12,
    supportedWidths: ['33%', '50%', '66%', '100%'],
    category: 'tasks',
  },
  {
    type: 'mini-calendar',
    name: 'Mini Calendar',
    description: 'Compact calendar widget',
    icon: 'calendar-o',
    defaultWidth: '33%',
    defaultColumns: 4,
    minColumns: 3,
    maxColumns: 6,
    supportedWidths: ['25%', '33%', '50%'],
    category: 'tasks',
  },
  // Info - various sizes
  {
    type: 'info-cards',
    name: 'Info Cards',
    description: 'Metrics and statistics display',
    icon: 'info-circle',
    defaultWidth: '100%',
    defaultColumns: 12,
    minColumns: 4,
    maxColumns: 12,
    supportedWidths: ['50%', '66%', '75%', '100%'],
    category: 'info',
  },
  {
    type: 'project-list',
    name: 'Project List',
    description: 'List of projects with status',
    icon: 'folder',
    defaultWidth: '50%',
    defaultColumns: 6,
    minColumns: 3,
    maxColumns: 12,
    supportedWidths: ['33%', '50%', '66%', '100%'],
    category: 'info',
  },
  // Team - compact to medium
  {
    type: 'team-quick',
    name: 'Team Quick Actions',
    description: 'Quick team management',
    icon: 'users',
    defaultWidth: '33%',
    defaultColumns: 4,
    minColumns: 3,
    maxColumns: 6,
    supportedWidths: ['25%', '33%', '50%'],
    category: 'team',
  },
  {
    type: 'team-waiting',
    name: 'Team Waiting List',
    description: "Who's waiting on what",
    icon: 'clock-o',
    defaultWidth: '50%',
    defaultColumns: 6,
    minColumns: 4,
    maxColumns: 8,
    supportedWidths: ['33%', '50%', '66%'],
    category: 'team',
  },
  // Utility - thin widgets
  {
    type: 'notes',
    name: 'Notes',
    description: 'Quick notes and reminders',
    icon: 'sticky-note',
    defaultWidth: '25%',
    defaultColumns: 3,
    minColumns: 2,
    maxColumns: 6,
    supportedWidths: ['25%', '33%', '50%'],
    category: 'utility',
  },
  {
    type: 'resources',
    name: 'Resources Directory',
    description: 'Project resources and files',
    icon: 'folder-open',
    defaultWidth: '25%',
    defaultColumns: 3,
    minColumns: 2,
    maxColumns: 6,
    supportedWidths: ['25%', '33%', '50%'],
    category: 'utility',
  },
];

// Default dashboard templates
export const DASHBOARD_TEMPLATES: Record<DashboardTemplate, DashboardRow[]> = {
  agile: [
    {
      id: 'agile-row-1',
      widgets: [
        { id: 'agile-w1', type: 'info-cards', width: '100%', columns: 12 },
      ],
    },
    {
      id: 'agile-row-2',
      widgets: [
        { id: 'agile-w2', type: 'kanban', width: '100%', columns: 12 },
      ],
    },
    {
      id: 'agile-row-3',
      widgets: [
        { id: 'agile-w3', type: 'burndown', width: '50%', columns: 6 },
        { id: 'agile-w4', type: 'team-waiting', width: '50%', columns: 6 },
      ],
    },
  ],
  waterfall: [
    {
      id: 'waterfall-row-1',
      widgets: [
        { id: 'waterfall-w1', type: 'info-cards', width: '100%', columns: 12 },
      ],
    },
    {
      id: 'waterfall-row-2',
      widgets: [
        { id: 'waterfall-w2', type: 'gantt', width: '100%', columns: 12 },
      ],
    },
    {
      id: 'waterfall-row-3',
      widgets: [
        { id: 'waterfall-w3', type: 'status-lanes', width: '66%', columns: 8 },
        { id: 'waterfall-w4', type: 'mini-calendar', width: '33%', columns: 4 },
      ],
    },
  ],
  maintenance: [
    {
      id: 'maintenance-row-1',
      widgets: [
        { id: 'maint-w1', type: 'info-cards', width: '100%', columns: 12 },
      ],
    },
    {
      id: 'maintenance-row-2',
      widgets: [
        { id: 'maint-w2', type: 'task-list', width: '50%', columns: 6 },
        { id: 'maint-w3', type: 'team-waiting', width: '50%', columns: 6 },
      ],
    },
    {
      id: 'maintenance-row-3',
      widgets: [
        { id: 'maint-w4', type: 'status-lanes', width: '100%', columns: 12 },
      ],
    },
  ],
  custom: [],
  blank: [],
};

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 11);

// Convert columns to width percentage
export const columnsToWidth = (columns: WidgetColumns): WidgetWidth => {
  const map: Record<WidgetColumns, WidgetWidth> = {
    1: '25%',
    2: '25%',
    3: '25%',
    4: '33%',
    5: '50%',
    6: '50%',
    7: '66%',
    8: '66%',
    9: '75%',
    10: '75%',
    11: '100%',
    12: '100%',
  };
  return map[columns];
};

// Convert width to columns
export const widthToColumns = (width: WidgetWidth): WidgetColumns => {
  const map: Record<WidgetWidth, WidgetColumns> = {
    '25%': 3,
    '33%': 4,
    '50%': 6,
    '66%': 8,
    '75%': 9,
    '100%': 12,
  };
  return map[width];
};

interface DashboardStore {
  // State
  dashboards: DashboardLayout[];
  currentDashboard: DashboardLayout | null;
  activeDashboardId: string | null;
  editMode: boolean;
  loading: boolean;
  
  // Actions
  setEditMode: (editing: boolean) => void;
  setActiveDashboard: (dashboardId: string) => void;
  setCurrentDashboard: (dashboard: DashboardLayout | null) => void;
  
  // Dashboard CRUD
  createDashboard: (
    name: string, 
    options?: {
      template?: DashboardTemplate;
      scope?: DashboardScope;
      projectId?: string;
      emoji?: string;
      laneCount?: number;
      userId?: string;
    }
  ) => DashboardLayout;
  updateDashboard: (dashboardId: string, updates: Partial<DashboardLayout>) => void;
  deleteDashboard: (dashboardId: string) => void;
  reorderDashboards: (dashboardIds: string[]) => void;
  
  // Widget management
  addWidgetToRow: (rowId: string, widgetType: WidgetType, columns?: WidgetColumns) => void;
  updateWidget: (widgetId: string, updates: Partial<DashboardWidget>) => void;
  removeWidget: (widgetId: string) => void;
  moveWidget: (widgetId: string, targetRowId: string, targetIndex: number) => void;
  resizeWidget: (widgetId: string, columns: WidgetColumns) => void;
  
  // Row management
  addRow: (index?: number, name?: string) => void;
  updateRow: (rowId: string, updates: Partial<DashboardRow>) => void;
  removeRow: (rowId: string) => void;
  moveRow: (rowId: string, direction: 'up' | 'down') => void;
  
  // Template
  applyTemplate: (template: DashboardTemplate) => void;
  resetToTemplate: () => void;
  
  // Persistence
  saveDashboard: () => Promise<void>;
  loadDashboards: (userId: string) => Promise<void>;
  
  // Home dashboard
  getHomeDashboard: () => DashboardLayout | null;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  dashboards: [],
  currentDashboard: null,
  activeDashboardId: null,
  editMode: false,
  loading: false,
  
  setEditMode: (editing) => set({ editMode: editing }),
  
  setActiveDashboard: (dashboardId) => {
    const dashboard = get().dashboards.find(d => d.id === dashboardId);
    set({ 
      activeDashboardId: dashboardId,
      currentDashboard: dashboard || null,
    });
  },
  
  setCurrentDashboard: (dashboard) => set({ currentDashboard: dashboard }),
  
  createDashboard: (name, options = {}) => {
    const {
      template = 'blank',
      scope = 'global',
      projectId,
      emoji,
      laneCount = 3,
      userId = '',
    } = options;
    
    // Create initial rows based on laneCount or template
    let rows: DashboardRow[];
    if (template !== 'blank' && template !== 'custom') {
      rows = JSON.parse(JSON.stringify(DASHBOARD_TEMPLATES[template] || []));
    } else {
      // Create empty lanes based on laneCount
      rows = Array.from({ length: laneCount }, (_, i) => ({
        id: generateId(),
        name: `Lane ${i + 1}`,
        widgets: [],
      }));
    }
    
    const dashboard: DashboardLayout = {
      id: generateId(),
      name,
      emoji,
      template,
      scope,
      projectId: scope === 'project' ? projectId : undefined,
      userId,
      rows,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: false,
      order: get().dashboards.length,
    };
    
    set((state) => ({
      dashboards: [...state.dashboards, dashboard],
      currentDashboard: dashboard,
      activeDashboardId: dashboard.id,
    }));
    
    return dashboard;
  },
  
  updateDashboard: (dashboardId, updates) => {
    set((state) => {
      const dashboards = state.dashboards.map((d) =>
        d.id === dashboardId ? { ...d, ...updates, updatedAt: new Date() } : d
      );
      const currentDashboard = state.currentDashboard?.id === dashboardId
        ? { ...state.currentDashboard, ...updates, updatedAt: new Date() }
        : state.currentDashboard;
      return { dashboards, currentDashboard };
    });
  },
  
  deleteDashboard: (dashboardId) => {
    set((state) => {
      const dashboards = state.dashboards.filter((d) => d.id !== dashboardId);
      const wasActive = state.activeDashboardId === dashboardId;
      return {
        dashboards,
        currentDashboard: wasActive ? dashboards[0] || null : state.currentDashboard,
        activeDashboardId: wasActive ? dashboards[0]?.id || null : state.activeDashboardId,
      };
    });
  },
  
  reorderDashboards: (dashboardIds) => {
    set((state) => {
      const dashboards = dashboardIds.map((id, index) => {
        const dashboard = state.dashboards.find(d => d.id === id);
        return dashboard ? { ...dashboard, order: index } : null;
      }).filter(Boolean) as DashboardLayout[];
      return { dashboards };
    });
  },
  
  addWidgetToRow: (rowId, widgetType, columns) => {
    const catalogEntry = WIDGET_CATALOG.find(w => w.type === widgetType);
    const defaultColumns = columns || catalogEntry?.defaultColumns || 6;
    
    set((state) => {
      if (!state.currentDashboard) return state;
      
      const newWidget: DashboardWidget = {
        id: generateId(),
        type: widgetType,
        width: columnsToWidth(defaultColumns),
        columns: defaultColumns,
        title: catalogEntry?.name,
      };
      
      const rows = state.currentDashboard.rows.map((row) => {
        if (row.id === rowId) {
          return { ...row, widgets: [...row.widgets, newWidget] };
        }
        return row;
      });
      
      const updatedDashboard = { ...state.currentDashboard, rows, updatedAt: new Date() };
      const dashboards = state.dashboards.map(d => 
        d.id === updatedDashboard.id ? updatedDashboard : d
      );
      
      return { currentDashboard: updatedDashboard, dashboards };
    });
  },
  
  updateWidget: (widgetId, updates) => {
    set((state) => {
      if (!state.currentDashboard) return state;
      
      const rows = state.currentDashboard.rows.map((row) => ({
        ...row,
        widgets: row.widgets.map((w) =>
          w.id === widgetId ? { ...w, ...updates } : w
        ),
      }));
      
      const updatedDashboard = { ...state.currentDashboard, rows, updatedAt: new Date() };
      const dashboards = state.dashboards.map(d => 
        d.id === updatedDashboard.id ? updatedDashboard : d
      );
      
      return { currentDashboard: updatedDashboard, dashboards };
    });
  },
  
  removeWidget: (widgetId) => {
    set((state) => {
      if (!state.currentDashboard) return state;
      
      const rows = state.currentDashboard.rows.map((row) => ({
        ...row,
        widgets: row.widgets.filter((w) => w.id !== widgetId),
      }));
      
      const updatedDashboard = { ...state.currentDashboard, rows, updatedAt: new Date() };
      const dashboards = state.dashboards.map(d => 
        d.id === updatedDashboard.id ? updatedDashboard : d
      );
      
      return { currentDashboard: updatedDashboard, dashboards };
    });
  },
  
  moveWidget: (widgetId, targetRowId, targetIndex) => {
    set((state) => {
      if (!state.currentDashboard) return state;
      
      let movedWidget: DashboardWidget | null = null;
      let rows = state.currentDashboard.rows.map((row) => {
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
      
      rows = rows.map((row) => {
        if (row.id === targetRowId) {
          const newWidgets = [...row.widgets];
          newWidgets.splice(targetIndex, 0, movedWidget!);
          return { ...row, widgets: newWidgets };
        }
        return row;
      });
      
      const updatedDashboard = { ...state.currentDashboard, rows, updatedAt: new Date() };
      const dashboards = state.dashboards.map(d => 
        d.id === updatedDashboard.id ? updatedDashboard : d
      );
      
      return { currentDashboard: updatedDashboard, dashboards };
    });
  },
  
  resizeWidget: (widgetId, columns) => {
    get().updateWidget(widgetId, {
      columns,
      width: columnsToWidth(columns),
    });
  },
  
  addRow: (index, name) => {
    set((state) => {
      if (!state.currentDashboard) return state;
      
      const newRow: DashboardRow = {
        id: generateId(),
        name: name || `Lane ${state.currentDashboard.rows.length + 1}`,
        widgets: [],
      };
      
      const rows = [...state.currentDashboard.rows];
      if (index !== undefined) {
        rows.splice(index, 0, newRow);
      } else {
        rows.push(newRow);
      }
      
      const updatedDashboard = { ...state.currentDashboard, rows, updatedAt: new Date() };
      const dashboards = state.dashboards.map(d => 
        d.id === updatedDashboard.id ? updatedDashboard : d
      );
      
      return { currentDashboard: updatedDashboard, dashboards };
    });
  },
  
  updateRow: (rowId, updates) => {
    set((state) => {
      if (!state.currentDashboard) return state;
      
      const rows = state.currentDashboard.rows.map((row) =>
        row.id === rowId ? { ...row, ...updates } : row
      );
      
      const updatedDashboard = { ...state.currentDashboard, rows, updatedAt: new Date() };
      const dashboards = state.dashboards.map(d => 
        d.id === updatedDashboard.id ? updatedDashboard : d
      );
      
      return { currentDashboard: updatedDashboard, dashboards };
    });
  },
  
  removeRow: (rowId) => {
    set((state) => {
      if (!state.currentDashboard) return state;
      
      const rows = state.currentDashboard.rows.filter((r) => r.id !== rowId);
      
      const updatedDashboard = { ...state.currentDashboard, rows, updatedAt: new Date() };
      const dashboards = state.dashboards.map(d => 
        d.id === updatedDashboard.id ? updatedDashboard : d
      );
      
      return { currentDashboard: updatedDashboard, dashboards };
    });
  },
  
  moveRow: (rowId, direction) => {
    set((state) => {
      if (!state.currentDashboard) return state;
      
      const rows = [...state.currentDashboard.rows];
      const index = rows.findIndex((r) => r.id === rowId);
      if (index === -1) return state;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= rows.length) return state;
      
      [rows[index], rows[newIndex]] = [rows[newIndex], rows[index]];
      
      const updatedDashboard = { ...state.currentDashboard, rows, updatedAt: new Date() };
      const dashboards = state.dashboards.map(d => 
        d.id === updatedDashboard.id ? updatedDashboard : d
      );
      
      return { currentDashboard: updatedDashboard, dashboards };
    });
  },
  
  applyTemplate: (template) => {
    set((state) => {
      if (!state.currentDashboard) return state;
      
      const templateRows = JSON.parse(JSON.stringify(DASHBOARD_TEMPLATES[template] || []));
      
      const updatedDashboard = {
        ...state.currentDashboard,
        template,
        rows: templateRows,
        updatedAt: new Date(),
      };
      const dashboards = state.dashboards.map(d => 
        d.id === updatedDashboard.id ? updatedDashboard : d
      );
      
      return { currentDashboard: updatedDashboard, dashboards };
    });
  },
  
  resetToTemplate: () => {
    const { currentDashboard } = get();
    if (currentDashboard) {
      get().applyTemplate(currentDashboard.template);
    }
  },
  
  saveDashboard: async () => {
    const { currentDashboard, dashboards } = get();
    if (!currentDashboard) return;
    
    try {
      // Save all dashboards to localStorage
      const key = `dashboards-user-${currentDashboard.userId}`;
      localStorage.setItem(key, JSON.stringify(dashboards));
    } catch (error) {
      console.error('Error saving dashboards:', error);
    }
  },
  
  loadDashboards: async (userId) => {
    set({ loading: true });
    
    try {
      const key = `dashboards-user-${userId}`;
      const stored = localStorage.getItem(key);
      
      if (stored) {
        const dashboards = JSON.parse(stored) as DashboardLayout[];
        const homeDashboard = dashboards.find(d => d.isDefault) || dashboards[0];
        set({ 
          dashboards, 
          currentDashboard: homeDashboard || null,
          activeDashboardId: homeDashboard?.id || null,
          loading: false,
        });
      } else {
        // Create default home dashboard
        const homeDashboard: DashboardLayout = {
          id: generateId(),
          name: 'Home',
          emoji: '🏠',
          template: 'custom',
          scope: 'global',
          userId,
          rows: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isDefault: true,
          order: 0,
        };
        
        set({ 
          dashboards: [homeDashboard],
          currentDashboard: homeDashboard,
          activeDashboardId: homeDashboard.id,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error loading dashboards:', error);
      set({ loading: false });
    }
  },
  
  getHomeDashboard: () => {
    return get().dashboards.find(d => d.isDefault) || get().dashboards[0] || null;
  },
}));
