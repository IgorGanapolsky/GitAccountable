import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Repository, Activity } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useGitHubData(userId?: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Query repositories
  const {
    data: repositories,
    isLoading: isLoadingRepos,
    isError: isReposError,
    refetch: refetchRepos
  } = useQuery({
    queryKey: ['/api/repositories', userId],
    enabled: !!userId,
    queryFn: async () => {
      const response = await fetch(`/api/repositories?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch repositories");
      return response.json() as Promise<Repository[]>;
    }
  });
  
  // Mutation to sync repositories with GitHub
  const syncReposMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User ID is required");
      setIsSyncing(true);
      return apiRequest("POST", "/api/repositories/sync", { userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/repositories', userId] });
      toast({
        title: "GitHub Sync Complete",
        description: "Your repositories have been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync with GitHub",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsSyncing(false);
    }
  });
  
  // Function to sync activities for a specific repository
  const syncActivitiesMutation = useMutation({
    mutationFn: async (repoId: number) => {
      if (!userId) throw new Error("User ID is required");
      return apiRequest("POST", `/api/repositories/${repoId}/sync-activities`, { userId });
    },
    onSuccess: (_, repoId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/repositories', repoId, 'activities'] });
      toast({
        title: "Activities Synced",
        description: "Repository activities have been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync activities",
        variant: "destructive"
      });
    }
  });
  
  // Function to fetch activities for a repository
  const fetchRepositoryActivities = async (repoId: number): Promise<Activity[]> => {
    if (!userId) return [];
    
    const response = await fetch(`/api/repositories/${repoId}/activities`);
    if (!response.ok) throw new Error("Failed to fetch repository activities");
    return response.json();
  };
  
  return {
    repositories,
    isLoadingRepos,
    isReposError,
    refetchRepos,
    syncRepositories: syncReposMutation.mutate,
    isSyncing: isSyncing || syncReposMutation.isPending,
    syncActivities: syncActivitiesMutation.mutate,
    isSyncingActivities: syncActivitiesMutation.isPending,
    fetchRepositoryActivities
  };
}
