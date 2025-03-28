import { 
  User, InsertUser, 
  Repository, InsertRepository, 
  Activity, InsertActivity, 
  Reminder, InsertReminder, 
  Conversation, InsertConversation 
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  
  // Repository operations
  getRepository(id: number): Promise<Repository | undefined>;
  getRepositoryByGitHubId(userId: number, githubId: number): Promise<Repository | undefined>;
  getRepositoriesByUserId(userId: number): Promise<Repository[]>;
  createRepository(repository: InsertRepository): Promise<Repository>;
  updateRepository(id: number, repository: Partial<InsertRepository>): Promise<Repository>;
  
  // Activity operations
  getActivity(id: number): Promise<Activity | undefined>;
  getActivitiesByRepositoryId(repositoryId: number): Promise<Activity[]>;
  getRecentActivitiesByUserId(userId: number, limit: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Reminder operations
  getReminder(id: number): Promise<Reminder | undefined>;
  getRemindersByUserId(userId: number): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, reminder: Partial<InsertReminder>): Promise<Reminder>;
  deleteReminder(id: number): Promise<void>;
  
  // Conversation operations
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationsByUserId(userId: number): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  
  // Statistics operations
  countActivePRs(userId: number): Promise<number>;
  countWeeklyCommits(userId: number): Promise<number>;
  countOpenIssues(userId: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private repositories: Map<number, Repository>;
  private activities: Map<number, Activity>;
  private reminders: Map<number, Reminder>;
  private conversations: Map<number, Conversation>;
  
  private userIdCounter: number;
  private repositoryIdCounter: number;
  private activityIdCounter: number;
  private reminderIdCounter: number;
  private conversationIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.repositories = new Map();
    this.activities = new Map();
    this.reminders = new Map();
    this.conversations = new Map();
    
    this.userIdCounter = 1;
    this.repositoryIdCounter = 1;
    this.activityIdCounter = 1;
    this.reminderIdCounter = 1;
    this.conversationIdCounter = 1;
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, user: Partial<InsertUser>): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser: User = { ...existingUser, ...user };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Repository operations
  async getRepository(id: number): Promise<Repository | undefined> {
    return this.repositories.get(id);
  }
  
  async getRepositoryByGitHubId(userId: number, githubId: number): Promise<Repository | undefined> {
    return Array.from(this.repositories.values()).find(
      (repo) => repo.userId === userId && repo.githubId === githubId
    );
  }
  
  async getRepositoriesByUserId(userId: number): Promise<Repository[]> {
    return Array.from(this.repositories.values()).filter(
      (repo) => repo.userId === userId
    );
  }
  
  async createRepository(repository: InsertRepository): Promise<Repository> {
    const id = this.repositoryIdCounter++;
    const newRepository: Repository = { ...repository, id };
    this.repositories.set(id, newRepository);
    return newRepository;
  }
  
  async updateRepository(id: number, repository: Partial<InsertRepository>): Promise<Repository> {
    const existingRepository = this.repositories.get(id);
    if (!existingRepository) {
      throw new Error(`Repository with ID ${id} not found`);
    }
    
    const updatedRepository: Repository = { ...existingRepository, ...repository };
    this.repositories.set(id, updatedRepository);
    return updatedRepository;
  }
  
  // Activity operations
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }
  
  async getActivitiesByRepositoryId(repositoryId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter((activity) => activity.repositoryId === repositoryId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  async getRecentActivitiesByUserId(userId: number, limit: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter((activity) => activity.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const newActivity: Activity = { ...activity, id };
    this.activities.set(id, newActivity);
    return newActivity;
  }
  
  // Reminder operations
  async getReminder(id: number): Promise<Reminder | undefined> {
    return this.reminders.get(id);
  }
  
  async getRemindersByUserId(userId: number): Promise<Reminder[]> {
    return Array.from(this.reminders.values())
      .filter((reminder) => reminder.userId === userId)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }
  
  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    const id = this.reminderIdCounter++;
    const newReminder: Reminder = { ...reminder, id };
    this.reminders.set(id, newReminder);
    return newReminder;
  }
  
  async updateReminder(id: number, reminder: Partial<InsertReminder>): Promise<Reminder> {
    const existingReminder = this.reminders.get(id);
    if (!existingReminder) {
      throw new Error(`Reminder with ID ${id} not found`);
    }
    
    const updatedReminder: Reminder = { ...existingReminder, ...reminder };
    this.reminders.set(id, updatedReminder);
    return updatedReminder;
  }
  
  async deleteReminder(id: number): Promise<void> {
    if (!this.reminders.has(id)) {
      throw new Error(`Reminder with ID ${id} not found`);
    }
    
    this.reminders.delete(id);
  }
  
  // Conversation operations
  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }
  
  async getConversationsByUserId(userId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter((conversation) => conversation.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const id = this.conversationIdCounter++;
    const newConversation: Conversation = { ...conversation, id };
    this.conversations.set(id, newConversation);
    return newConversation;
  }
  
  // Statistics operations
  async countActivePRs(userId: number): Promise<number> {
    return Array.from(this.activities.values()).filter(
      (activity) => 
        activity.userId === userId && 
        activity.type === "pr" && 
        activity.data && 
        (activity.data as any).state === "open"
    ).length;
  }
  
  async countWeeklyCommits(userId: number): Promise<number> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return Array.from(this.activities.values()).filter(
      (activity) => 
        activity.userId === userId && 
        activity.type === "commit" && 
        activity.timestamp >= oneWeekAgo
    ).length;
  }
  
  async countOpenIssues(userId: number): Promise<number> {
    return Array.from(this.activities.values()).filter(
      (activity) => 
        activity.userId === userId && 
        activity.type === "issue" && 
        activity.data && 
        (activity.data as any).state === "open"
    ).length;
  }
}

export const storage = new MemStorage();
