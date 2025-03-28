import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertRepositorySchema, 
  insertActivitySchema, 
  insertReminderSchema, 
  insertConversationSchema 
} from "@shared/schema";
import { fetchUserRepositories, fetchRepositoryCommits, fetchRepositoryIssues, fetchRepositoryPullRequests } from "./github";
import { generateChatResponse } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json({ message: "User created successfully", userId: user.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = z.object({
        username: z.string(),
        password: z.string(),
      }).parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json({
        message: "Login successful",
        user: userWithoutPassword
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid login data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to login" });
    }
  });
  
  app.post("/api/auth/github", async (req, res) => {
    try {
      const { userId, githubUsername, githubToken } = z.object({
        userId: z.number(),
        githubUsername: z.string(),
        githubToken: z.string(),
      }).parse(req.body);
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(userId, {
        githubUsername,
        githubToken
      });
      
      const { password: _, ...userWithoutPassword } = updatedUser;
      
      res.status(200).json({
        message: "GitHub account linked successfully",
        user: userWithoutPassword
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to link GitHub account" });
    }
  });

  // Repository routes
  app.get("/api/repositories", async (req, res) => {
    try {
      const userId = z.number().parse(parseInt(req.query.userId as string));
      const repositories = await storage.getRepositoriesByUserId(userId);
      res.status(200).json(repositories);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user ID", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to fetch repositories" });
    }
  });

  app.post("/api/repositories/sync", async (req, res) => {
    try {
      const { userId } = z.object({
        userId: z.number(),
      }).parse(req.body);
      
      const user = await storage.getUser(userId);
      
      if (!user || !user.githubToken || !user.githubUsername) {
        return res.status(400).json({ message: "GitHub account not linked" });
      }
      
      const repos = await fetchUserRepositories(user.githubToken, user.githubUsername);
      
      // Store repositories in the database
      const savedRepos = [];
      for (const repo of repos) {
        const existingRepo = await storage.getRepositoryByGitHubId(userId, repo.id);
        
        const repoData = {
          userId,
          githubId: repo.id,
          name: repo.name,
          description: repo.description || "",
          language: repo.language || "",
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          lastActivity: new Date(repo.pushed_at),
          isPrivate: repo.private,
          status: determineRepoStatus(new Date(repo.pushed_at))
        };
        
        if (existingRepo) {
          const updatedRepo = await storage.updateRepository(existingRepo.id, repoData);
          savedRepos.push(updatedRepo);
        } else {
          const newRepo = await storage.createRepository(repoData);
          savedRepos.push(newRepo);
        }
      }
      
      res.status(200).json({
        message: "Repositories synchronized successfully",
        repositories: savedRepos
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to synchronize repositories" });
    }
  });

  app.get("/api/repositories/:repoId/activities", async (req, res) => {
    try {
      const repoId = z.number().parse(parseInt(req.params.repoId));
      const activities = await storage.getActivitiesByRepositoryId(repoId);
      res.status(200).json(activities);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid repository ID", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to fetch repository activities" });
    }
  });

  app.post("/api/repositories/:repoId/sync-activities", async (req, res) => {
    try {
      const repoId = z.number().parse(parseInt(req.params.repoId));
      const { userId } = z.object({
        userId: z.number(),
      }).parse(req.body);
      
      const user = await storage.getUser(userId);
      const repository = await storage.getRepository(repoId);
      
      if (!user || !repository) {
        return res.status(404).json({ message: "User or repository not found" });
      }
      
      if (!user.githubToken) {
        return res.status(400).json({ message: "GitHub token not available" });
      }
      
      // Fetch commits, issues, and pull requests
      const commits = await fetchRepositoryCommits(user.githubToken, user.githubUsername, repository.name);
      const issues = await fetchRepositoryIssues(user.githubToken, user.githubUsername, repository.name);
      const pullRequests = await fetchRepositoryPullRequests(user.githubToken, user.githubUsername, repository.name);
      
      const savedActivities = [];
      
      // Save commits
      for (const commit of commits.slice(0, 10)) { // Only store the 10 most recent
        const activityData = {
          userId,
          repositoryId: repoId,
          type: "commit",
          title: commit.commit.message.split('\n')[0], // First line of commit message
          description: commit.commit.message,
          timestamp: new Date(commit.commit.author.date),
          url: commit.html_url,
          data: commit
        };
        
        const activity = await storage.createActivity(activityData);
        savedActivities.push(activity);
      }
      
      // Save issues
      for (const issue of issues.slice(0, 10)) {
        const activityData = {
          userId,
          repositoryId: repoId,
          type: "issue",
          title: issue.title,
          description: `Issue #${issue.number}: ${issue.title}`,
          timestamp: new Date(issue.created_at),
          url: issue.html_url,
          data: issue
        };
        
        const activity = await storage.createActivity(activityData);
        savedActivities.push(activity);
      }
      
      // Save pull requests
      for (const pr of pullRequests.slice(0, 10)) {
        const activityData = {
          userId,
          repositoryId: repoId,
          type: "pr",
          title: pr.title,
          description: `PR #${pr.number}: ${pr.title}`,
          timestamp: new Date(pr.created_at),
          url: pr.html_url,
          data: pr
        };
        
        const activity = await storage.createActivity(activityData);
        savedActivities.push(activity);
      }
      
      res.status(200).json({
        message: "Activities synchronized successfully",
        activities: savedActivities
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to synchronize activities" });
    }
  });

  // Reminder routes
  app.get("/api/reminders", async (req, res) => {
    try {
      const userId = z.number().parse(parseInt(req.query.userId as string));
      const reminders = await storage.getRemindersByUserId(userId);
      res.status(200).json(reminders);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user ID", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });

  app.post("/api/reminders", async (req, res) => {
    try {
      const reminderData = insertReminderSchema.parse(req.body);
      const reminder = await storage.createReminder(reminderData);
      res.status(201).json(reminder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reminder data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create reminder" });
    }
  });

  app.patch("/api/reminders/:id", async (req, res) => {
    try {
      const id = z.number().parse(parseInt(req.params.id));
      const reminderData = insertReminderSchema.partial().parse(req.body);
      const updatedReminder = await storage.updateReminder(id, reminderData);
      res.status(200).json(updatedReminder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reminder data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update reminder" });
    }
  });

  app.delete("/api/reminders/:id", async (req, res) => {
    try {
      const id = z.number().parse(parseInt(req.params.id));
      await storage.deleteReminder(id);
      res.status(200).json({ message: "Reminder deleted successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reminder ID", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to delete reminder" });
    }
  });

  // Chat routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { userId, message } = z.object({
        userId: z.number(),
        message: z.string(),
      }).parse(req.body);
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get repositories for context
      const repositories = await storage.getRepositoriesByUserId(userId);
      
      // Get recent activities for context
      const activities = await storage.getRecentActivitiesByUserId(userId, 20);
      
      // Get reminders for context
      const reminders = await storage.getRemindersByUserId(userId);
      
      // Get response from OpenAI
      const response = await generateChatResponse(message, {
        user,
        repositories,
        activities,
        reminders
      });
      
      // Save conversation
      const now = new Date();
      const conversation = await storage.createConversation({
        userId,
        timestamp: now,
        messages: [
          { role: "user", content: message, timestamp: now.toISOString() },
          { role: "assistant", content: response, timestamp: new Date().toISOString() }
        ]
      });
      
      res.status(200).json({
        message: "Chat response generated",
        response,
        conversationId: conversation.id
      });
    } catch (error) {
      console.error("Chat error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid chat data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to generate chat response" });
    }
  });

  app.get("/api/conversations", async (req, res) => {
    try {
      const userId = z.number().parse(parseInt(req.query.userId as string));
      const conversations = await storage.getConversationsByUserId(userId);
      res.status(200).json(conversations);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user ID", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Stats routes
  app.get("/api/stats", async (req, res) => {
    try {
      const userId = z.number().parse(parseInt(req.query.userId as string));
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const repositories = await storage.getRepositoriesByUserId(userId);
      const activePRs = await storage.countActivePRs(userId);
      const weeklyCommits = await storage.countWeeklyCommits(userId);
      const openIssues = await storage.countOpenIssues(userId);
      
      res.status(200).json({
        activePRs,
        weeklyCommits,
        openIssues,
        repositoryCount: repositories.length,
        activeRepositories: repositories.filter(r => r.status === "active").length,
        needsAttentionRepositories: repositories.filter(r => r.status === "needs_attention").length,
        inactiveRepositories: repositories.filter(r => r.status === "inactive").length
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user ID", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to determine repository status based on last activity
function determineRepoStatus(lastActivity: Date): string {
  const now = new Date();
  const daysDifference = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysDifference <= 7) {
    return "active";
  } else if (daysDifference <= 30) {
    return "needs_attention";
  } else {
    return "inactive";
  }
}
