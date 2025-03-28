import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format relative time (e.g., 2d ago, 3 weeks ago)
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo ago`;
}

// Format repository status
export function getRepositoryStatusInfo(status: string) {
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
        bgColor: "bg-gray-200",
        textColor: "text-gray-600"
      };
  }
}

// Get activity icon and color
export function getActivityStyleInfo(type: string) {
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
        color: "text-gray-500"
      };
  }
}

// Format date with specified options
export function formatDate(dateString: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  };
  
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options || defaultOptions);
}

// Format time
export function formatTime(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString(undefined, { 
    hour: '2-digit', 
    minute: '2-digit'
  });
}
