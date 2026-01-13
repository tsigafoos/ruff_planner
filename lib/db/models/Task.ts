// @ts-nocheck - WatermelonDB decorators require this
import { Model } from '@nozbe/watermelondb';
import { field, readonly, date, relation, children } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';

export default class Task extends Model {
  static table = 'tasks';
  
  static associations: Associations = {
    project: { type: 'belongs_to', key: 'project_id' },
    subtasks: { type: 'has_many', foreignKey: 'task_id' },
    comments: { type: 'has_many', foreignKey: 'task_id' },
  };

  @field('title') title: any;
  @field('description') description?: any;
  @field('due_date') dueDate?: any;
  @field('priority') priority: any;
  @field('project_id') projectId?: any;
  @field('label_ids') labelIds: any; // JSON string
  @field('completed_at') completedAt?: any;
  @readonly @date('created_at') createdAt: any;
  @readonly @date('updated_at') updatedAt: any;
  @field('user_id') userId: any;
  @field('recurring_pattern') recurringPattern?: any;
  @field('synced_at') syncedAt?: any;

  @relation('projects', 'project_id') project: any;
  @children('subtasks') subtasks: any;
  @children('comments') comments: any;

  get parsedLabelIds(): string[] {
    try {
      return JSON.parse(this.labelIds || '[]');
    } catch {
      return [];
    }
  }

  set parsedLabelIds(ids: string[]) {
    this.labelIds = JSON.stringify(ids);
  }
}
