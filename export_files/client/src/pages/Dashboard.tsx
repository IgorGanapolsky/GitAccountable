import { useQuery } from "@tanstack/react-query";
import { Repository, Activity, Reminder } from "@shared/schema";
import RepositoryCard from "@/components/RepositoryCard";
import ActivityItem from "@/components/ActivityItem";
import StatusMetric from "@/components/StatusMetric";
import ReminderItem from "@/components/ReminderItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface DashboardProps {
  userId?: number;
}

export default function Dashboard({ userId }: DashboardProps) {
  const { toast } = useToast();

  // Fetch repositories
  const { data: repositories, isLoading: isLoadingRepos, isError: isReposError, refetch: refetchRepos } = useQuery({
    queryKey: ['/api/repositories', userId],
    enabled: !!userId,
    queryFn: async () => {
      const response = await fetch(`/api/repositories?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch repositories");
      return response.json() as Promise<Repository[]>;
    }
  });

  // Fetch stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/stats', userId],
    enabled: !!userId,
    queryFn: async () => {
      const response = await fetch(`/api/stats?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    }
  });

  // Fetch recent activities
  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ['/api/activities', userId],
    queryFn: async () => {
      // In a real app, would need endpoint to get all activities across repos
      // Using a placeholder for demo
      if (repositories && repositories.length > 0) {
        const repoId = repositories[0].id;
        const response = await fetch(`/api/repositories/${repoId}/activities`);
        if (!response.ok) throw new Error("Failed to fetch activities");
        return response.json() as Promise<Activity[]>;
      }
      return [] as Activity[];
    },
    enabled: !!userId && !isLoadingRepos && !!repositories && repositories.length > 0
  });

  // Fetch reminders
  const { data: reminders, isLoading: isLoadingReminders, refetch: refetchReminders } = useQuery({
    queryKey: ['/api/reminders', userId],
    enabled: !!userId,
    queryFn: async () => {
      const response = await fetch(`/api/reminders?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch reminders");
      return response.json() as Promise<Reminder[]>;
    }
  });

  const handleSyncGitHub = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch("/api/repositories/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      
      if (!response.ok) throw new Error("Failed to sync repositories");
      
      await refetchRepos();
      toast({
        title: "GitHub sync complete",
        description: "Your repositories have been updated.",
      });
    } catch (error) {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleReminderComplete = async (reminderId: number) => {
    try {
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true })
      });
      
      if (!response.ok) throw new Error("Failed to update reminder");
      
      await refetchReminders();
      toast({
        title: "Reminder completed",
        description: "The reminder has been marked as completed.",
      });
    } catch (error) {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleReminderSnooze = async (reminderId: number) => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dueDate: tomorrow.toISOString() })
      });
      
      if (!response.ok) throw new Error("Failed to update reminder");
      
      await refetchReminders();
      toast({
        title: "Reminder snoozed",
        description: "The reminder has been snoozed for 1 day.",
      });
    } catch (error) {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (!userId) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-4">Sign in Required</h2>
        <p>Please sign in to view your dashboard</p>
      </div>
    );
  }

  return (
    <div>
      {/* Repository Overview */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Repository Overview</h2>
          <Button 
            variant="link" 
            className="text-gh-blue hover:underline text-sm p-0 h-auto"
            onClick={handleSyncGitHub}
          >
            Sync GitHub
          </Button>
        </div>
        
        {isLoadingRepos ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gh-header rounded-lg shadow-sm border border-gray-200 dark:border-gh-border p-4">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-3" />
                <div className="flex space-x-4 mb-3">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <Skeleton className="h-px w-full mb-3" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        ) : isReposError ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400">Failed to load repositories. Please try again.</p>
          </div>
        ) : repositories && repositories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repositories.slice(0, 3).map((repo) => (
              <RepositoryCard key={repo.id} repository={repo} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gh-header rounded-lg shadow-sm border border-gray-200 dark:border-gh-border p-6 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-2">No repositories found</p>
            <Button onClick={handleSyncGitHub} className="bg-gh-blue hover:bg-blue-600 text-white">
              Sync with GitHub
            </Button>
          </div>
        )}
      </div>
      
      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gh-header rounded-lg shadow-sm border border-gray-200 dark:border-gh-border p-4">
          <h3 className="font-semibold text-base mb-3">Recent Activity</h3>
          {isLoadingActivities ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start">
                  <Skeleton className="h-5 w-5 mt-1 mr-3 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities && activities.length > 0 ? (
            <ul className="space-y-3">
              {activities.slice(0, 3).map((activity) => (
                <ActivityItem key={activity.id} activity={activity} repositories={repositories || []} />
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No recent activity found</p>
          )}
          <Button 
            variant="link" 
            className="text-gh-blue hover:underline text-sm p-0 h-auto mt-3"
          >
            View All Activity
          </Button>
        </div>
        
        {/* Status Metrics */}
        <div className="bg-white dark:bg-gh-header rounded-lg shadow-sm border border-gray-200 dark:border-gh-border p-4">
          <h3 className="font-semibold text-base mb-3">Status Metrics</h3>
          {isLoadingStats ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="space-y-4">
              <StatusMetric 
                label="Active PRs" 
                value={`${stats.activePRs} open`} 
                percentage={Math.min(100, stats.activePRs * 25)} 
                color="bg-gh-blue" 
                textColor="text-gh-blue"
              />
              <StatusMetric 
                label="Weekly Commits" 
                value={`${stats.weeklyCommits} commits`} 
                percentage={Math.min(100, stats.weeklyCommits * 5)} 
                color="bg-gh-green" 
                textColor="text-gh-green"
              />
              <StatusMetric 
                label="Open Issues" 
                value={`${stats.openIssues} issues`} 
                percentage={Math.min(100, stats.openIssues * 10)} 
                color="bg-gh-orange" 
                textColor="text-gh-orange"
              />
              <StatusMetric 
                label="Repository Health" 
                value={getRepositoryHealth(stats)} 
                percentage={getRepositoryHealthPercentage(stats)} 
                color="bg-gh-blue" 
                textColor="text-gh-blue"
              />
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No stats available</p>
          )}
        </div>
      </div>
      
      {/* Reminders */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Reminders</h2>
          <Button 
            variant="link" 
            className="text-gh-blue hover:underline text-sm p-0 h-auto"
          >
            Manage
          </Button>
        </div>
        
        <div className="bg-white dark:bg-gh-header rounded-lg shadow-sm border border-gray-200 dark:border-gh-border p-4">
          {isLoadingReminders ? (
            <div className="divide-y divide-gray-200 dark:divide-gh-border">
              {[1, 2, 3].map((i) => (
                <div key={i} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center">
                  <div className="flex items-start">
                    <Skeleton className="h-5 w-5 mt-1 mr-3 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-48 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : reminders && reminders.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gh-border">
              {reminders
                .filter(r => !r.completed)
                .slice(0, 3)
                .map((reminder) => (
                  <ReminderItem 
                    key={reminder.id} 
                    reminder={reminder} 
                    repositories={repositories || []}
                    onComplete={() => handleReminderComplete(reminder.id)}
                    onSnooze={() => handleReminderSnooze(reminder.id)}
                  />
                ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm py-3">No pending reminders</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getRepositoryHealth(stats: any): string {
  const total = stats.activeRepositories + stats.needsAttentionRepositories + stats.inactiveRepositories;
  const ratio = stats.activeRepositories / total;
  
  if (ratio >= 0.7) return "Good";
  if (ratio >= 0.4) return "Fair";
  return "Needs Work";
}

function getRepositoryHealthPercentage(stats: any): number {
  const total = stats.activeRepositories + stats.needsAttentionRepositories + stats.inactiveRepositories;
  return (stats.activeRepositories / total) * 100;
}
