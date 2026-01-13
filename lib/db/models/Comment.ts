// @ts-nocheck - WatermelonDB decorators require this
import { Model } from '@nozbe/watermelondb';
import { field, readonly, date, relation } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';

export default class Comment extends Model {
  static table = 'comments';
  
  static associations: Associations = {
    task: { type: 'belongs_to', key: 'task_id' },
  };

  @field('task_id') taskId: any;
  @field('content') content: any;
  @readonly @date('created_at') createdAt: any;
  @field('user_id') userId: any;
  @field('synced_at') syncedAt?: any;

  @relation('tasks', 'task_id') task: any;
}
