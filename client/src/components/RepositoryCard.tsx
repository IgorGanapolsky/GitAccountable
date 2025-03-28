import { Repository } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface RepositoryCardProps {
  repository: Repository;
}

export default function RepositoryCard({ repository }: RepositoryCardProps) {
  // Get status color and text based on repository status
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "active":
        return {
          text: "Active",
          bgColor: "bg-gh-green bg-opacity-20",
          textColor: "text-gh-green"
        };
      case "needs_attention":
        return {
          text: "Needs Attention",
          bgColor: "bg-gh-orange bg-opacity-20",
          textColor: "text-gh-orange"
        };
      case "inactive":
        return {
          text: "Inactive",
          bgColor: "bg-gh-red bg-opacity-20",
          textColor: "text-gh-red"
        };
      default:
        return {
          text: "Unknown",
          bgColor: "bg-gray-200 dark:bg-gray-700",
          textColor: "text-gray-600 dark:text-gray-300"
        };
    }
  };

  // Get alert message based on repository status
  const getAlertInfo = (status: string, lastActivity: Date) => {
    const daysSinceActivity = Math.floor((new Date().getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));
    
    switch (status) {
      case "active":
        return {
          icon: "ri-git-commit-line",
          message: "Recent activity detected",
          color: "text-gh-blue"
        };
      case "needs_attention":
        return {
          icon: "ri-error-warning-line",
          message: `No commits in ${daysSinceActivity} days`,
          color: "text-gh-orange"
        };
      case "inactive":
        return {
          icon: "ri-error-warning-line",
          message: `No activity in ${daysSinceActivity}+ days`,
          color: "text-gh-red"
        };
      default:
        return {
          icon: "ri-information-line",
          message: "Status unknown",
          color: "text-gray-500 dark:text-gray-400"
        };
    }
  };

  const statusInfo = getStatusInfo(repository.status);
  const alertInfo = getAlertInfo(repository.status, repository.lastActivity);

  return (
    <div className="bg-white dark:bg-gh-header rounded-lg shadow-sm border border-gray-200 dark:border-gh-border p-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-base truncate" title={repository.name}>
          {repository.name}
        </h3>
        <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} px-2 py-0.5 rounded-full text-xs font-normal`}>
          {statusInfo.text}
        </Badge>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2" title={repository.description || ""}>
        {repository.description || "No description provided"}
      </p>
      
      <div className="flex space-x-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
        {repository.language && (
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-gh-blue mr-1"></div>
            <span>{repository.language}</span>
          </div>
        )}
        <div className="flex items-center">
          <i className="ri-star-line mr-1"></i>
          <span>{repository.stars}</span>
        </div>
        <div className="flex items-center">
          <i className="ri-git-branch-line mr-1"></i>
          <span>{repository.forks}</span>
        </div>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gh-border pt-3">
        <div className="flex justify-between text-xs">
          <div className="flex items-center">
            <i className={`${alertInfo.icon} mr-1 ${alertInfo.color}`}></i>
            <span className={alertInfo.color}>{alertInfo.message}</span>
          </div>
          <span className="text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(repository.lastActivity), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
}
