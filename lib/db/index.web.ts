// @ts-nocheck - Web stub database
// WatermelonDB doesn't work on web, so we use a stub

import Project from './models/Project';
import Task from './models/Task';
import Label from './models/Label';
import Subtask from './models/Subtask';
import Comment from './models/Comment';

// Stub database for web - data won't persist locally but will sync to Supabase
const database = {
  get: (table: string) => ({
    query: () => ({
      filter: () => ({
        filter: () => ({
          fetch: async () => []
        }),
        fetch: async () => []
      }),
      fetch: async () => []
    }),
    find: async () => null,
    create: async () => ({}),
    update: async () => {},
  }),
};

export { database };
export { Project, Task, Label, Subtask, Comment };
