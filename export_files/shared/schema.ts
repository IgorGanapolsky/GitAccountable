import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  githubUsername: text("github_username"),
  githubToken: text("github_token"),
  avatarUrl: text("avatar_url"),
  name: text("name"),
  lastLogin: timestamp("last_login"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  githubUsername: true,
  githubToken: true,
  avatarUrl: true,
  name: true,
});

// Repository schema
export const repositories = pgTable("repositories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  githubId: integer("github_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  language: text("language"),
  stars: integer("stars").default(0),
  forks: integer("forks").default(0),
  lastActivity: timestamp("last_activity"),
  status: text("status").default("active"),
  isPrivate: boolean("is_private").default(false),
});

export const insertRepositorySchema = createInsertSchema(repositories).pick({
  userId: true,
  githubId: true,
  name: true,
  description: true,
  language: true,
  stars: true,
  forks: true,
  lastActivity: true,
  status: true,
  isPrivate: true,
});

// Repository activity schema
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  repositoryId: integer("repository_id").notNull(),
  type: text("type").notNull(), // commit, pr, issue
  title: text("title").notNull(),
  description: text("description"),
  timestamp: timestamp("timestamp").notNull(),
  url: text("url"),
  data: jsonb("data"),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  repositoryId: true,
  type: true,
  title: true,
  description: true,
  timestamp: true,
  url: true,
  data: true,
});

// Reminders schema
export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  repositoryId: integer("repository_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  completed: boolean("completed").default(false),
  priority: text("priority").default("medium"),
});

export const insertReminderSchema = createInsertSchema(reminders).pick({
  userId: true,
  repositoryId: true,
  title: true,
  description: true,
  dueDate: true,
  completed: true,
  priority: true,
});

// Conversation schema
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  messages: jsonb("messages").notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  userId: true,
  timestamp: true,
  messages: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertRepository = z.infer<typeof insertRepositorySchema>;
export type Repository = typeof repositories.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = typeof reminders.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// API response types
export type GitHubRepository = {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  private: boolean;
  updated_at: string;
  pushed_at: string;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
};

export type GitHubCommit = {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
};

export type GitHubPullRequest = {
  id: number;
  number: number;
  title: string;
  state: string;
  created_at: string;
  updated_at: string;
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
};

export type GitHubIssue = {
  id: number;
  number: number;
  title: string;
  state: string;
  created_at: string;
  updated_at: string;
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
};
