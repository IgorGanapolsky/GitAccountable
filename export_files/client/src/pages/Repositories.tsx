import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Repository } from "@shared/schema";
import RepositoryCard from "@/components/RepositoryCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

interface RepositoriesProps {
  userId?: number;
}

export default function Repositories({ userId }: RepositoriesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  
  const { data: repositories, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/repositories', userId],
    enabled: !!userId,
    queryFn: async () => {
      const response = await fetch(`/api/repositories?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch repositories");
      return response.json() as Promise<Repository[]>;
    }
  });

  const handleSync = async () => {
    if (!userId) return;
    
    try {
      await apiRequest("POST", "/api/repositories/sync", { userId });
      refetch();
      toast({
        title: "Repositories synced",
        description: "Your GitHub repositories have been updated.",
      });
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Failed to sync repositories. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredRepositories = repositories?.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "active") return matchesSearch && repo.status === "active";
    if (activeTab === "needs_attention") return matchesSearch && repo.status === "needs_attention";
    if (activeTab === "inactive") return matchesSearch && repo.status === "inactive";
    
    return matchesSearch;
  });

  if (!userId) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-4">Sign in Required</h2>
        <p>Please sign in to view your repositories</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">GitHub Repositories</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="text"
                placeholder="Search repositories..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={handleSync} className="whitespace-nowrap">
              Sync GitHub
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="needs_attention">Needs Attention</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
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
            ) : isError ? (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400">Failed to load repositories. Please try again.</p>
                <Button variant="outline" onClick={() => refetch()} className="mt-2">
                  Retry
                </Button>
              </div>
            ) : filteredRepositories && filteredRepositories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRepositories.map((repo) => (
                  <RepositoryCard key={repo.id} repository={repo} />
                ))}
              </div>
            ) : repositories && repositories.length > 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-2">No repositories match your search criteria</p>
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No repositories found</p>
                <Button onClick={handleSync} className="bg-gh-blue hover:bg-blue-600 text-white">
                  Sync with GitHub
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
