// @ts-nocheck - WatermelonDB decorators require this
import { Model } from '@nozbe/watermelondb';
import { field, readonly, date, children } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';

export default class Project extends Model {
  static table = 'projects';
  
  static associations: Associations = {
    tasks: { type: 'has_many', foreignKey: 'project_id' },
  };

  @field('name') name: any;
  @field('color') color: any;
  @field('icon') icon?: any;
  @readonly @date('created_at') createdAt: any;
  @readonly @date('updated_at') updatedAt: any;
  @field('user_id') userId: any;
  @field('synced_at') syncedAt?: any;

  @children('tasks') tasks: any;
}
