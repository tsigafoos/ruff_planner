import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'projects',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'icon', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'user_id', type: 'string' },
        { name: 'synced_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'tasks',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'start_date', type: 'number', isOptional: true },
        { name: 'due_date', type: 'number', isOptional: true },
        { name: 'priority', type: 'number' },
        { name: 'project_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'label_ids', type: 'string' }, // JSON array stored as string
        { name: 'completed_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'recurring_pattern', type: 'string', isOptional: true },
        { name: 'status', type: 'string', isOptional: true }, // to_do, in_progress, blocked, on_hold, completed, cancelled
        { name: 'project_phase', type: 'string', isOptional: true }, // Agile only: brainstorm, design, logic, polish, done
        { name: 'synced_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'labels',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'synced_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'subtasks',
      columns: [
        { name: 'task_id', type: 'string', isIndexed: true },
        { name: 'title', type: 'string' },
        { name: 'completed', type: 'boolean' },
        { name: 'order', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'comments',
      columns: [
        { name: 'task_id', type: 'string', isIndexed: true },
        { name: 'content', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'user_id', type: 'string' },
        { name: 'synced_at', type: 'number', isOptional: true },
      ],
    }),
  ],
});
