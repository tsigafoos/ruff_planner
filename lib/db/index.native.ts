// @ts-nocheck - Native WatermelonDB setup
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';
import { schema } from './schema';

import Project from './models/Project';
import Task from './models/Task';
import Label from './models/Label';
import Subtask from './models/Subtask';
import Comment from './models/Comment';

const migrations = schemaMigrations({
  migrations: [],
});

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'barkitdone',
  migrations,
  onSetUpError: (error: any) => {
    console.error('WatermelonDB setup error:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [
    Project,
    Task,
    Label,
    Subtask,
    Comment,
  ],
});

export { Project, Task, Label, Subtask, Comment };
