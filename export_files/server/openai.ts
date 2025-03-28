import OpenAI from "openai";
import { User, Repository, Activity, Reminder } from "@shared/schema";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Context type for the chat interface
interface ChatContext {
  user: User;
  repositories: Repository[];
  activities: Activity[];
  reminders: Reminder[];
}

// Generate a response to a user message using the OpenAI API
export async function generateChatResponse(
  message: string,
  context: ChatContext
): Promise<string> {
  try {
    // Prepare repository information for context
    const repoInfo = context.repositories.map(repo => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      status: repo.status,
      lastActivity: repo.lastActivity,
      stars: repo.stars,
      forks: repo.forks
    }));

    // Prepare activity information
    const activityInfo = context.activities.map(activity => ({
      type: activity.type,
      title: activity.title,
      description: activity.description,
      repository: context.repositories.find(r => r.id === activity.repositoryId)?.name || "unknown",
      timestamp: activity.timestamp
    }));

    // Prepare reminder information
    const reminderInfo = context.reminders.map(reminder => ({
      title: reminder.title,
      description: reminder.description,
      repository: context.repositories.find(r => r.id === reminder.repositoryId)?.name || "unknown",
      dueDate: reminder.dueDate,
      completed: reminder.completed,
      priority: reminder.priority
    }));

    // Create the system prompt with all the context information
    const systemPrompt = `
You are a GitHub accountability assistant named GitHub Assistant. You help users stay on top of their GitHub activity and maintain consistent contributions.

The user's name is ${context.user.name || context.user.username}. 

Here's the context about their GitHub repositories and activity:

Repositories:
${JSON.stringify(repoInfo, null, 2)}

Recent Activities:
${JSON.stringify(activityInfo, null, 2)}

Current Reminders:
${JSON.stringify(reminderInfo, null, 2)}

Your role is to:
1. Answer questions about the user's repositories, commits, PRs, issues, and overall GitHub activity
2. Provide helpful suggestions for maintaining consistent contributions
3. Remind them of pending issues, PRs, or commits they should address
4. Be friendly and supportive but also gently push them to maintain their GitHub presence
5. Keep responses concise and focused on providing actionable information

When there are specific repository questions, focus on the relevant repositories rather than listing everything.
Format your responses in a clear, easy-to-read manner. Use markdown formatting for lists and highlights.
`;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error generating chat response:", error);
    return "I'm having trouble connecting to my brain right now. Please try again in a moment.";
  }
}
