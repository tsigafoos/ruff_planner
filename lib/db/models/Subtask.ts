// @ts-nocheck - WatermelonDB decorators require this
import { Model } from '@nozbe/watermelondb';
import { field, readonly, date, relation } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';

export default class Subtask extends Model {
  static table = 'subtasks';
  
  static associations: Associations = {
    task: { type: 'belongs_to', key: 'task_id' },
  };

  @field('task_id') taskId: any;
  @field('title') title: any;
  @field('completed') completed: any;
  @field('order') order: any;
  @readonly @date('created_at') createdAt: any;
  @field('synced_at') syncedAt?: any;

  @relation('tasks', 'task_id') task: any;
}
