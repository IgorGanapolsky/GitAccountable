import { Link } from "wouter";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  currentPath: string;
}

export default function Sidebar({ isOpen, onClose, user, currentPath }: SidebarProps) {
  return (
    <div 
      id="sidebar" 
      className={`${isOpen ? 'fixed inset-0 z-50' : 'hidden'} md:relative md:flex md:z-auto flex-col w-64 bg-white dark:bg-gh-header border-r border-gray-200 dark:border-gh-border`}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gh-border">
        <div className="flex items-center">
          <i className="ri-github-fill text-2xl mr-2"></i>
          <h1 className="font-semibold text-lg">Accountability Bot</h1>
        </div>
        <button 
          className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
          onClick={onClose}
        >
          <i className="ri-close-line text-xl"></i>
        </button>
      </div>
      
      <div className="p-4 border-b border-gray-200 dark:border-gh-border">
        {user ? (
          <div className="flex items-center space-x-3">
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={`${user.name || user.username}'s profile`} 
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <i className="ri-user-line text-xl"></i>
              </div>
            )}
            <div>
              <div className="font-medium">{user.name || user.username}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">@{user.githubUsername || user.username}</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <i className="ri-user-line text-xl"></i>
            </div>
            <div>
              <div className="font-medium">Guest User</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Sign in to connect</div>
            </div>
          </div>
        )}
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        <div>
          <Link href="/">
            <div 
              className={`flex items-center px-4 py-2 text-sm rounded-md ${
                currentPath === "/" 
                  ? "bg-gh-light dark:bg-gh-dark text-gh-blue" 
                  : "hover:bg-gh-light dark:hover:bg-gh-dark text-gray-600 dark:text-gray-300 hover:text-gh-blue dark:hover:text-gh-blue"
              }`}
              onClick={() => onClose()}
            >
              <i className="ri-dashboard-line mr-3 text-current"></i>
              <span>Dashboard</span>
            </div>
          </Link>
        </div>
        <div>
          <Link href="/repositories">
            <div 
              className={`flex items-center px-4 py-2 text-sm rounded-md ${
                currentPath === "/repositories" 
                  ? "bg-gh-light dark:bg-gh-dark text-gh-blue" 
                  : "hover:bg-gh-light dark:hover:bg-gh-dark text-gray-600 dark:text-gray-300 hover:text-gh-blue dark:hover:text-gh-blue"
              }`}
              onClick={() => onClose()}
            >
              <i className="ri-git-repository-line mr-3 text-current"></i>
              <span>Repositories</span>
            </div>
          </Link>
        </div>
        <div>
          <Link href="/conversations">
            <div 
              className={`flex items-center px-4 py-2 text-sm rounded-md ${
                currentPath === "/conversations" 
                  ? "bg-gh-light dark:bg-gh-dark text-gh-blue" 
                  : "hover:bg-gh-light dark:hover:bg-gh-dark text-gray-600 dark:text-gray-300 hover:text-gh-blue dark:hover:text-gh-blue"
              }`}
              onClick={() => onClose()}
            >
              <i className="ri-chat-1-line mr-3 text-current"></i>
              <span>Conversations</span>
            </div>
          </Link>
        </div>
        <div>
          <Link href="/settings">
            <div 
              className={`flex items-center px-4 py-2 text-sm rounded-md ${
                currentPath === "/settings" 
                  ? "bg-gh-light dark:bg-gh-dark text-gh-blue" 
                  : "hover:bg-gh-light dark:hover:bg-gh-dark text-gray-600 dark:text-gray-300 hover:text-gh-blue dark:hover:text-gh-blue"
              }`}
              onClick={() => onClose()}
            >
              <i className="ri-settings-3-line mr-3 text-current"></i>
              <span>Settings</span>
            </div>
          </Link>
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gh-border">
        <Button
          variant="ghost"
          className="w-full justify-start p-0 h-auto text-gray-500 dark:text-gray-400 hover:text-gh-blue dark:hover:text-gh-blue"
          disabled={true}
        >
          <i className="ri-logout-box-line mr-2"></i>
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
}
