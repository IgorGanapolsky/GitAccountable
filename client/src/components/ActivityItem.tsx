import { Activity, Repository } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface ActivityItemProps {
  activity: Activity;
  repositories: Repository[];
}

export default function ActivityItem({ activity, repositories }: ActivityItemProps) {
  // Find repository associated with this activity
  const repository = repositories.find(repo => repo.id === activity.repositoryId);
  
  // Get icon and color based on activity type
  const getActivityStyle = (type: string) => {
    switch (type) {
      case "commit":
        return {
          icon: "ri-git-commit-line",
          color: "text-gh-blue"
        };
      case "pr":
        return {
          icon: "ri-git-pull-request-line",
          color: "text-gh-green"
        };
      case "issue":
        return {
          icon: "ri-error-warning-line",
          color: "text-gh-red"
        };
      default:
        return {
          icon: "ri-git-repository-line",
          color: "text-gray-500 dark:text-gray-400"
        };
    }
  };

  const style = getActivityStyle(activity.type);

  return (
    <li className="flex items-start">
      <div className={`mt-1 mr-3 ${style.color}`}>
        <i className={style.icon}></i>
      </div>
      <div>
        <p className="text-sm">
          <span className="font-medium">{repository?.name || "Unknown repository"}:</span>{" "}
          {activity.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
        </p>
      </div>
    </li>
  );
}
