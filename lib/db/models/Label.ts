// @ts-nocheck - WatermelonDB decorators require this
import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export default class Label extends Model {
  static table = 'labels';

  @field('name') name: any;
  @field('color') color: any;
  @readonly @date('created_at') createdAt: any;
  @field('user_id') userId: any;
  @field('synced_at') syncedAt?: any;
}
